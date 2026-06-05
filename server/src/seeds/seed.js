// ============================================================
// Seed — Estructura base del Mundial 2026
// Crea: Tournament + 12 Groups + 48 Teams (datos estáticos)
// ============================================================
// Ejecutar: npm run db:seed -w server

import 'dotenv/config';
import prisma from '../config/db.js';

// ── Datos del Mundial 2026 (fuente: sorteo oficial FIFA, 5 dic 2025) ──
const TOURNAMENT = {
  name: 'FIFA World Cup 2026',
  code: 'WC2026',
  year: 2026,
  startDate: new Date('2026-06-11T00:00:00Z'),
  endDate:   new Date('2026-07-19T23:59:59Z'),
  currentStage: 'GROUP_STAGE',
};

const GROUPS = [
  {
    name: 'Grupo A',
    teams: [
      { name: 'Mexico',      shortName: 'MEX', tla: 'MEX', confederation: 'CONCACAF', fifaRanking: 16 },
      { name: 'South Korea', shortName: 'KOR', tla: 'KOR', confederation: 'AFC',      fifaRanking: 22 },
      { name: 'Czechia',     shortName: 'CZE', tla: 'CZE', confederation: 'UEFA',     fifaRanking: 37 },
      { name: 'South Africa',shortName: 'RSA', tla: 'RSA', confederation: 'CAF',      fifaRanking: 63 },
    ],
  },
  {
    name: 'Grupo B',
    teams: [
      { name: 'Canada',              shortName: 'CAN', tla: 'CAN', confederation: 'CONCACAF', fifaRanking: 49 },
      { name: 'Switzerland',         shortName: 'SUI', tla: 'SUI', confederation: 'UEFA',     fifaRanking: 20 },
      { name: 'Bosnia and Herzegovina', shortName: 'BIH', tla: 'BIH', confederation: 'UEFA', fifaRanking: 58 },
      { name: 'Qatar',               shortName: 'QAT', tla: 'QAT', confederation: 'AFC',      fifaRanking: 38 },
    ],
  },
  {
    name: 'Grupo C',
    teams: [
      { name: 'Brazil',   shortName: 'BRA', tla: 'BRA', confederation: 'CONMEBOL', fifaRanking: 5  },
      { name: 'Morocco',  shortName: 'MAR', tla: 'MAR', confederation: 'CAF',      fifaRanking: 14 },
      { name: 'Scotland', shortName: 'SCO', tla: 'SCO', confederation: 'UEFA',     fifaRanking: 38 },
      { name: 'Haiti',    shortName: 'HAI', tla: 'HAI', confederation: 'CONCACAF', fifaRanking: 92 },
    ],
  },
  {
    name: 'Grupo D',
    teams: [
      { name: 'USA',       shortName: 'USA', tla: 'USA', confederation: 'CONCACAF', fifaRanking: 11 },
      { name: 'Turkey',    shortName: 'TUR', tla: 'TUR', confederation: 'UEFA',     fifaRanking: 29 },
      { name: 'Paraguay',  shortName: 'PAR', tla: 'PAR', confederation: 'CONMEBOL', fifaRanking: 59 },
      { name: 'Australia', shortName: 'AUS', tla: 'AUS', confederation: 'AFC',      fifaRanking: 23 },
    ],
  },
  {
    name: 'Grupo E',
    teams: [
      { name: 'Germany',        shortName: 'GER', tla: 'GER', confederation: 'UEFA',     fifaRanking: 12 },
      { name: 'Ecuador',        shortName: 'ECU', tla: 'ECU', confederation: 'CONMEBOL', fifaRanking: 44 },
      { name: "Cote d'Ivoire",  shortName: 'CIV', tla: 'CIV', confederation: 'CAF',      fifaRanking: 25 },
      { name: 'Curacao',        shortName: 'CUW', tla: 'CUW', confederation: 'CONCACAF', fifaRanking: 85 },
    ],
  },
  {
    name: 'Grupo F',
    teams: [
      { name: 'Netherlands', shortName: 'NED', tla: 'NED', confederation: 'UEFA', fifaRanking: 7  },
      { name: 'Japan',       shortName: 'JPN', tla: 'JPN', confederation: 'AFC',  fifaRanking: 18 },
      { name: 'Sweden',      shortName: 'SWE', tla: 'SWE', confederation: 'UEFA', fifaRanking: 27 },
      { name: 'Tunisia',     shortName: 'TUN', tla: 'TUN', confederation: 'CAF',  fifaRanking: 30 },
    ],
  },
  {
    name: 'Grupo G',
    teams: [
      { name: 'Belgium',     shortName: 'BEL', tla: 'BEL', confederation: 'UEFA', fifaRanking: 3  },
      { name: 'Iran',        shortName: 'IRN', tla: 'IRN', confederation: 'AFC',  fifaRanking: 22 },
      { name: 'Egypt',       shortName: 'EGY', tla: 'EGY', confederation: 'CAF',  fifaRanking: 34 },
      { name: 'New Zealand', shortName: 'NZL', tla: 'NZL', confederation: 'OFC',  fifaRanking: 94 },
    ],
  },
  {
    name: 'Grupo H',
    teams: [
      { name: 'Spain',        shortName: 'ESP', tla: 'ESP', confederation: 'UEFA',     fifaRanking: 1  },
      { name: 'Uruguay',      shortName: 'URU', tla: 'URU', confederation: 'CONMEBOL', fifaRanking: 17 },
      { name: 'Saudi Arabia', shortName: 'KSA', tla: 'KSA', confederation: 'AFC',      fifaRanking: 57 },
      { name: 'Cape Verde',   shortName: 'CPV', tla: 'CPV', confederation: 'CAF',      fifaRanking: 71 },
    ],
  },
  {
    name: 'Grupo I',
    teams: [
      { name: 'France',  shortName: 'FRA', tla: 'FRA', confederation: 'UEFA',     fifaRanking: 2  },
      { name: 'Norway',  shortName: 'NOR', tla: 'NOR', confederation: 'UEFA',     fifaRanking: 19 },
      { name: 'Senegal', shortName: 'SEN', tla: 'SEN', confederation: 'CAF',      fifaRanking: 15 },
      { name: 'Iraq',    shortName: 'IRQ', tla: 'IRQ', confederation: 'AFC',      fifaRanking: 64 },
    ],
  },
  {
    name: 'Grupo J',
    teams: [
      { name: 'Argentina', shortName: 'ARG', tla: 'ARG', confederation: 'CONMEBOL', fifaRanking: 1  },
      { name: 'Algeria',   shortName: 'ALG', tla: 'ALG', confederation: 'CAF',      fifaRanking: 36 },
      { name: 'Austria',   shortName: 'AUT', tla: 'AUT', confederation: 'UEFA',     fifaRanking: 24 },
      { name: 'Jordan',    shortName: 'JOR', tla: 'JOR', confederation: 'AFC',      fifaRanking: 75 },
    ],
  },
  {
    name: 'Grupo K',
    teams: [
      { name: 'Portugal',   shortName: 'POR', tla: 'POR', confederation: 'UEFA',     fifaRanking: 6  },
      { name: 'Colombia',   shortName: 'COL', tla: 'COL', confederation: 'CONMEBOL', fifaRanking: 9  },
      { name: 'DR Congo',   shortName: 'COD', tla: 'COD', confederation: 'CAF',      fifaRanking: 46 },
      { name: 'Uzbekistan', shortName: 'UZB', tla: 'UZB', confederation: 'AFC',      fifaRanking: 68 },
    ],
  },
  {
    name: 'Grupo L',
    teams: [
      { name: 'England', shortName: 'ENG', tla: 'ENG', confederation: 'UEFA',     fifaRanking: 4  },
      { name: 'Croatia', shortName: 'CRO', tla: 'CRO', confederation: 'UEFA',     fifaRanking: 10 },
      { name: 'Ghana',   shortName: 'GHA', tla: 'GHA', confederation: 'CAF',      fifaRanking: 60 },
      { name: 'Panama',  shortName: 'PAN', tla: 'PAN', confederation: 'CONCACAF', fifaRanking: 78 },
    ],
  },
];

// ── Colores por confederación para UI ──
const CONFEDERATION_COLORS = {
  UEFA:     '#003399',
  CONMEBOL: '#009900',
  CONCACAF: '#CC0000',
  AFC:      '#FF6600',
  CAF:      '#FFCC00',
  OFC:      '#9900CC',
};

async function seed() {
  console.log('\n🌱 Iniciando seed del Mundial 2026...\n');

  // 1. Crear torneo
  console.log('📋 Creando torneo...');
  const tournament = await prisma.tournament.upsert({
    where:  { code: TOURNAMENT.code },
    update: TOURNAMENT,
    create: TOURNAMENT,
  });
  console.log(`   ✅ Torneo creado: ${tournament.name} (id: ${tournament.id})`);

  // 2. Crear equipos y grupos
  let totalTeams = 0;
  let totalGroups = 0;

  for (const groupData of GROUPS) {
    console.log(`\n📁 ${groupData.name}:`);

    // Crear grupo
    const group = await prisma.group.upsert({
      where:  { tournamentId_name: { tournamentId: tournament.id, name: groupData.name } },
      update: { stage: 'GROUP_STAGE' },
      create: {
        name:         groupData.name,
        tournamentId: tournament.id,
        stage:        'GROUP_STAGE',
      },
    });
    totalGroups++;

    // Crear equipos y vincularlos al grupo
    for (const teamData of groupData.teams) {
      const team = await prisma.team.upsert({
        where:  { name: teamData.name },
        update: {
          shortName:     teamData.shortName,
          tla:           teamData.tla,
          confederation: teamData.confederation,
          fifaRanking:   teamData.fifaRanking,
        },
        create: {
          name:          teamData.name,
          shortName:     teamData.shortName,
          tla:           teamData.tla,
          confederation: teamData.confederation,
          fifaRanking:   teamData.fifaRanking,
        },
      });

      // Vincular equipo al grupo (tabla de posiciones inicial)
      await prisma.groupTeam.upsert({
        where:  { groupId_teamId: { groupId: group.id, teamId: team.id } },
        update: {},
        create: {
          groupId:  group.id,
          teamId:   team.id,
          position: groupData.teams.indexOf(teamData) + 1,
        },
      });

      totalTeams++;
      console.log(`   ✅ ${teamData.name} (${teamData.tla}) — ${teamData.confederation} — Ranking FIFA: ${teamData.fifaRanking}`);
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`  Seed completado:`);
  console.log(`  ✅ 1 torneo creado`);
  console.log(`  ✅ ${totalGroups} grupos creados`);
  console.log(`  ✅ ${totalTeams} equipos creados`);
  console.log('══════════════════════════════════════════\n');
}

seed()
  .catch(err => {
    console.error('\n💥 Error en seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
