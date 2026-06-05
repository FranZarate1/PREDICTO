// ============================================================
// Script: Scrapear solo los últimos partidos (sin jugadores)
// Corre después del scrape inicial cuando los equipos ya existen
// ============================================================
import 'dotenv/config';
import prisma from '../config/db.js';
import { scrapeRecentMatchesSofascore } from '../scrapers/sofascore.scraper.js';

console.log('\n⚽ App Mundial — Scrape de Últimos Partidos');
console.log('═'.repeat(50));
console.log('  Fuente: Sofascore (API pública)');
console.log('  Objetivo: últimos 5 partidos por selección');
console.log('═'.repeat(50));

async function scrapeMatches() {
  // 1. Obtener todos los equipos de la DB
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  console.log(`\n📋 ${teams.length} equipos encontrados\n`);

  const teamNames = teams.map(t => t.name);

  // 2. Scrapear últimos partidos de Sofascore
  const matchesByTeam = await scrapeRecentMatchesSofascore(teamNames);

  // 3. Guardar en DB
  console.log('\n💾 Guardando partidos en Supabase...');
  let saved = 0;
  let skipped = 0;

  for (const team of teams) {
    const matches = matchesByTeam.get(team.name) || [];

    for (const match of matches) {
      const isHome = match.homeTeam.toLowerCase().includes(team.name.toLowerCase()) ||
                     team.name.toLowerCase().includes(match.homeTeam.toLowerCase().split(' ')[0]);

      const opponentName = isHome ? match.awayTeam : match.homeTeam;

      // Buscar rival en la DB
      let opponent = await prisma.team.findFirst({
        where: { name: { contains: opponentName.split(' ')[0], mode: 'insensitive' } }
      });

      if (!opponent) {
        opponent = await prisma.team.upsert({
          where: { name: opponentName },
          update: {},
          create: { name: opponentName, shortName: opponentName.slice(0, 3).toUpperCase() },
        });
      }

      const homeTeamId = isHome ? team.id : opponent.id;
      const awayTeamId = isHome ? opponent.id : team.id;

      if (!match.date) { skipped++; continue; }

      try {
        await prisma.match.create({
          data: {
            stage:      'PRE_TOURNAMENT',
            homeTeamId,
            awayTeamId,
            matchDate:  new Date(match.date),
            status:     'FINISHED',
            homeScore:  match.homeScore,
            awayScore:  match.awayScore,
            venue:      match.venue || null,
            scrapedAt:  new Date(),
          },
        });
        saved++;
      } catch {
        skipped++; // Duplicado u otro error
      }
    }
  }

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  ✅ ${saved} partidos guardados`);
  console.log(`  ⏭️  ${skipped} omitidos (duplicados o sin fecha)`);
  console.log(`══════════════════════════════════════════\n`);
}

scrapeMatches()
  .catch(err => { console.error('\n💥', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
