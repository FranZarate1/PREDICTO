// ============================================================
// Orchestrator — Coordina todos los scrapers y guarda en la DB
// ============================================================
// Uso:
//   import { runFullScrape, runPostMatchScrape } from './orchestrator.js'
//   await runFullScrape()         // Datos iniciales (equipos + jugadores)
//   await runPostMatchScrape()    // Post-fecha (resultados + stats)

import 'dotenv/config';
import prisma from '../config/db.js';
import { scrapeAllTeams } from './wikipedia.scraper.js';
import { scrapeRecentMatches } from './espn.scraper.js';

// ── Helpers ──────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toLocaleTimeString('es-AR');
  console.log(`  [${ts}] ${msg}`);
}

async function createScrapingLog(data) {
  return prisma.scrapingLog.create({ data });
}

async function updateScrapingLog(id, data) {
  return prisma.scrapingLog.update({ where: { id }, data });
}

// ── Scrape inicial: equipos + jugadores ──────────────────────

/**
 * Corre UNA SOLA VEZ antes del torneo.
 * Enriquece los equipos ya creados por el seed con:
 *  - Datos del DT, escudo, URL Wikipedia (Wikipedia scraper)
 *  - Últimos 5 partidos de cada selección (ESPN scraper)
 *  - Plantilla de jugadores (Wikipedia scraper)
 */
export async function runInitialScrape() {
  const startTime = Date.now();
  log('🚀 Iniciando scrape inicial (equipos + jugadores + últimos partidos)');

  // Crear log en DB
  const scrapingLog = await createScrapingLog({
    stage:   'INITIAL',
    source:  'MANUAL',
    status:  'RUNNING',
    details: { type: 'initial_scrape' },
  });

  try {
    // 1. Obtener todos los equipos de la DB
    const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
    log(`📋 ${teams.length} equipos encontrados en la DB`);

    // 2. Scrape Wikipedia — datos de equipos y jugadores
    log('\n── Fase 1: Wikipedia (equipos y plantillas) ──');
    const wikiData = await scrapeAllTeams(teams);

    let playersCreated = 0;
    let teamsUpdated = 0;

    for (const team of teams) {
      const data = wikiData.get(team.id);
      if (!data) continue;

      // Actualizar equipo con datos de Wikipedia
      await prisma.team.update({
        where: { id: team.id },
        data: {
          coach:        data.meta.coach?.split('\n')[0]?.trim() || null,
          crestUrl:     data.meta.crestUrl || null,
          wikipediaUrl: data.wikipediaUrl || null,
          updatedAt:    new Date(),
        },
      });
      teamsUpdated++;

      // Guardar jugadores
      for (const player of data.squad) {
        try {
          await prisma.player.upsert({
            where: {
              teamId_number: {
                teamId: team.id,
                number: player.number ?? -1,  // -1 si no tiene número
              }
            },
            update: {
              name:      player.name,
              position:  player.position,
              club:      player.club,
              updatedAt: new Date(),
            },
            create: {
              teamId:   team.id,
              name:     player.name,
              position: player.position,
              number:   player.number,
              club:     player.club,
            },
          });
          playersCreated++;
        } catch {
          // Si hay conflicto de número, guardamos sin número
          await prisma.player.create({
            data: {
              teamId:   team.id,
              name:     player.name,
              position: player.position,
              club:     player.club,
            },
          }).catch(() => {}); // Ignorar duplicados de nombre
        }
      }
    }

    log(`✅ ${teamsUpdated} equipos actualizados, ${playersCreated} jugadores guardados`);

    // 3. Scrape ESPN — últimos partidos
    log('\n── Fase 2: ESPN (últimos partidos) ──');
    const teamNames = teams.map(t => t.name);
    const recentMatches = await scrapeRecentMatches(teamNames);

    // Los últimos partidos los guardamos en la tabla 'matches'
    // pero con un tournament especial "PRE_TOURNAMENT"
    // (o los guardamos como JSON en el campo details del team — más simple para MVP)
    // Por ahora, los guardamos en la DB como matches históricos sin grupo
    let matchesSaved = 0;

    for (const team of teams) {
      const matches = recentMatches.get(team.name) || [];

      for (const match of matches) {
        // Buscar o crear el equipo rival
        const opponentName = match.homeTeam === team.name ? match.awayTeam : match.homeTeam;
        let opponent = await prisma.team.findFirst({
          where: { name: { contains: opponentName.split(' ')[0], mode: 'insensitive' } }
        });

        // Si el rival no está en el torneo, lo creamos como equipo fantasma
        if (!opponent) {
          opponent = await prisma.team.upsert({
            where: { name: opponentName },
            update: {},
            create: { name: opponentName, shortName: opponentName.slice(0, 3).toUpperCase() },
          });
        }

        const isHome = match.homeTeam === team.name;
        const homeTeam = isHome ? team : opponent;
        const awayTeam = isHome ? opponent : team;

        try {
          await prisma.match.create({
            data: {
              stage:      'PRE_TOURNAMENT',
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              matchDate:  new Date(match.date),
              status:     'FINISHED',
              homeScore:  match.homeScore,
              awayScore:  match.awayScore,
              venue:      match.venue || null,
              scrapedAt:  new Date(),
            },
          });
          matchesSaved++;
        } catch {
          // Ignorar duplicados
        }
      }
    }

    log(`✅ ${matchesSaved} partidos históricos guardados`);

    // Actualizar log
    const durationMs = Date.now() - startTime;
    await updateScrapingLog(scrapingLog.id, {
      status:         'SUCCESS',
      durationMs,
      matchesUpdated: matchesSaved,
      playersUpdated: playersCreated,
      details: {
        type:           'initial_scrape',
        teamsUpdated,
        playersCreated,
        matchesSaved,
      },
    });

    log(`\n🎉 Scrape inicial completado en ${(durationMs / 1000).toFixed(1)}s`);
    log(`   Equipos: ${teamsUpdated} | Jugadores: ${playersCreated} | Partidos: ${matchesSaved}`);

    return { success: true, teamsUpdated, playersCreated, matchesSaved };

  } catch (err) {
    await updateScrapingLog(scrapingLog.id, {
      status: 'FAILED',
      durationMs: Date.now() - startTime,
      errors: { general: err.message },
    });
    log(`💥 Error en scrape inicial: ${err.message}`);
    throw err;
  }
}

// ── Scrape post-fecha: resultados + stats ────────────────────

/**
 * Corre al terminar cada fecha del Mundial (29 veces en total).
 * Actualiza:
 *  - Resultados de los partidos del día
 *  - Tabla de posiciones de cada grupo
 *  - Stats de jugadores (goles, asistencias, etc.)
 */
export async function runPostMatchScrape(stage = 'GROUP_STAGE', matchday = null) {
  const startTime = Date.now();
  log(`🔄 Iniciando scrape post-fecha: ${stage}${matchday ? ` J${matchday}` : ''}`);

  const scrapingLog = await createScrapingLog({
    stage,
    matchday,
    source:  'SCHEDULED',
    status:  'RUNNING',
  });

  try {
    // Acá irán los scrapers de resultados del día (ESPN/Sofascore)
    // Por ahora es un placeholder que se completará en Fase 2
    log('  📊 [PLACEHOLDER] Scrapeando resultados del día...');

    // TODO Fase 2: implementar scraping de partidos del día actual

    const durationMs = Date.now() - startTime;
    await updateScrapingLog(scrapingLog.id, {
      status:    'SUCCESS',
      durationMs,
    });

    log(`✅ Scrape post-fecha completado en ${(durationMs / 1000).toFixed(1)}s`);
    return { success: true };

  } catch (err) {
    await updateScrapingLog(scrapingLog.id, {
      status: 'FAILED',
      durationMs: Date.now() - startTime,
      errors: { general: err.message },
    });
    throw err;
  }
}
