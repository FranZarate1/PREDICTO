/**
 * Servicio de Ingesta — Sub-fase 1A
 *
 * Orquesta los adapters de APIs externas y persiste datos en la DB via Prisma.
 * Implementa la lógica de sincronización y el principio de idempotencia.
 */

import prisma from '../config/db.js';
import * as footballDataAdapter from '../adapters/footballData.adapter.js';
import * as oddsApiAdapter from '../adapters/oddsApi.adapter.js';

/**
 * Ingesta inicial: crea el torneo, grupos y equipos a partir de Football-Data.org.
 * Diseñado para ser idempotente (puede correrse múltiples veces sin duplicar datos).
 */
export async function ingestTournamentData() {
  console.log('[Ingestion] Iniciando ingesta de datos del torneo...');

  // 1. Obtener info del torneo
  const competition = await footballDataAdapter.getCompetition();

  // 2. Upsert del torneo
  const tournament = await prisma.tournament.upsert({
    where: { code: competition.code },
    create: {
      name: competition.name,
      code: competition.code,
      year: new Date().getFullYear(),
      externalId: competition.externalId,
      startDate: competition.currentSeason?.startDate
        ? new Date(competition.currentSeason.startDate)
        : null,
      endDate: competition.currentSeason?.endDate
        ? new Date(competition.currentSeason.endDate)
        : null,
    },
    update: {
      name: competition.name,
      externalId: competition.externalId,
    },
  });

  console.log(`[Ingestion] Torneo: ${tournament.name} (${tournament.id})`);

  // 3. Obtener standings (grupos + equipos + posiciones)
  const standings = await footballDataAdapter.getStandings();

  for (const standing of standings) {
    // Upsert del grupo
    const group = await prisma.group.upsert({
      where: {
        tournamentId_name: {
          tournamentId: tournament.id,
          name: standing.groupName,
        },
      },
      create: {
        name: standing.groupName,
        tournamentId: tournament.id,
        stage: standing.stage || 'GROUP_STAGE',
      },
      update: {
        stage: standing.stage || 'GROUP_STAGE',
      },
    });

    // Upsert de equipos y posiciones
    for (const teamData of standing.teams) {
      const team = await prisma.team.upsert({
        where: { externalId: teamData.externalId },
        create: {
          name: teamData.name,
          shortName: teamData.shortName,
          tla: teamData.tla,
          crestUrl: teamData.crestUrl,
          externalId: teamData.externalId,
        },
        update: {
          name: teamData.name,
          shortName: teamData.shortName,
          tla: teamData.tla,
          crestUrl: teamData.crestUrl,
        },
      });

      // Upsert de la posición en el grupo
      await prisma.groupTeam.upsert({
        where: {
          groupId_teamId: {
            groupId: group.id,
            teamId: team.id,
          },
        },
        create: {
          groupId: group.id,
          teamId: team.id,
          position: teamData.position,
          playedGames: teamData.playedGames,
          won: teamData.won,
          draw: teamData.draw,
          lost: teamData.lost,
          goalsFor: teamData.goalsFor,
          goalsAgainst: teamData.goalsAgainst,
          goalDifference: teamData.goalDifference,
          points: teamData.points,
        },
        update: {
          position: teamData.position,
          playedGames: teamData.playedGames,
          won: teamData.won,
          draw: teamData.draw,
          lost: teamData.lost,
          goalsFor: teamData.goalsFor,
          goalsAgainst: teamData.goalsAgainst,
          goalDifference: teamData.goalDifference,
          points: teamData.points,
        },
      });
    }

    console.log(
      `[Ingestion] Grupo ${standing.groupName}: ${standing.teams.length} equipos`
    );
  }

  // 4. Obtener y persistir partidos
  const matches = await footballDataAdapter.getMatches({ stage: 'GROUP_STAGE' });

  for (const matchData of matches) {
    // Buscar los equipos por externalId
    const homeTeam = await prisma.team.findUnique({
      where: { externalId: matchData.homeTeam.externalId },
    });
    const awayTeam = await prisma.team.findUnique({
      where: { externalId: matchData.awayTeam.externalId },
    });

    if (!homeTeam || !awayTeam) {
      console.warn(
        `[Ingestion] Equipo no encontrado para partido ${matchData.externalId}`
      );
      continue;
    }

    // Buscar el grupo por nombre
    const group = await prisma.group.findFirst({
      where: {
        tournamentId: tournament.id,
        name: matchData.group,
      },
    });

    if (!group) {
      console.warn(
        `[Ingestion] Grupo ${matchData.group} no encontrado para partido ${matchData.externalId}`
      );
      continue;
    }

    await prisma.match.upsert({
      where: { externalId: matchData.externalId },
      create: {
        externalId: matchData.externalId,
        groupId: group.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        matchday: matchData.matchday,
        utcDate: matchData.utcDate,
        status: matchData.status,
        homeScore: matchData.homeScore,
        awayScore: matchData.awayScore,
      },
      update: {
        status: matchData.status,
        homeScore: matchData.homeScore,
        awayScore: matchData.awayScore,
      },
    });
  }

  console.log(`[Ingestion] ${matches.length} partidos procesados.`);
  console.log('[Ingestion] ✅ Ingesta completada.');

  return { tournament, groupCount: standings.length, matchCount: matches.length };
}

/**
 * Ingesta de cuotas outright desde The Odds API.
 * (Fase 1A.2)
 */
export async function ingestOddsData() {
  console.log('[Ingestion] Iniciando ingesta de cuotas...');

  try {
    const outrightsAvailable = await oddsApiAdapter.checkSportAvailability();

    if (!outrightsAvailable) {
      console.warn('[Ingestion] ⚠️ El deporte del Mundial no está disponible en The Odds API.');
      return { status: 'unavailable' };
    }

    const outrightOdds = await oddsApiAdapter.getOutrightOdds();
    console.log(
      `[Ingestion] Obtenidas ${outrightOdds.length} entradas de cuotas outright.`
    );

    // TODO: Mapear cuotas outright a GroupOdds en la DB
    // Esto depende de la estructura exacta de la respuesta (validar en la PoC)

    return { status: 'ok', count: outrightOdds.length };
  } catch (error) {
    console.error('[Ingestion] Error ingresando cuotas:', error.message);
    return { status: 'error', error: error.message };
  }
}

export default {
  ingestTournamentData,
  ingestOddsData,
};
