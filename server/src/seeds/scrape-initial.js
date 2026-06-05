// Script de entrada para correr el scrape inicial
import 'dotenv/config';
import prisma from '../config/db.js';
import { runInitialScrape } from '../scrapers/orchestrator.js';

console.log('\n🌍 App Mundial — Scrape Inicial');
console.log('═'.repeat(50));
console.log('  Fuentes: Wikipedia (jugadores) + ESPN (partidos)');
console.log('  Tiempo estimado: ~10 minutos (48 selecciones)');
console.log('═'.repeat(50));

runInitialScrape()
  .catch(err => {
    console.error('\n💥 Error fatal:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
