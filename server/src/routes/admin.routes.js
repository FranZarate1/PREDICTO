// ============================================================
// Admin Routes — Panel de control del scraper
// Protegido por ADMIN_TOKEN en el header Authorization
// ============================================================
import { Router } from 'express';
import prisma from '../config/db.js';
import { runInitialScrape } from '../scrapers/orchestrator.js';

const router = Router();

// ── Middleware de autenticación admin ─────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN;

  if (!validToken || token !== validToken) {
    return res.status(401).json({ success: false, error: { message: 'No autorizado' } });
  }
  next();
}

router.use(requireAdmin);

// ── GET /api/admin/status ─────────────────────────────────────
// Estado del scraper y últimas ejecuciones
router.get('/status', async (req, res, next) => {
  try {
    const [teamsCount, playersCount, matchesCount, lastScrapes] = await Promise.all([
      prisma.team.count(),
      prisma.player.count(),
      prisma.match.count({ where: { status: 'FINISHED' } }),
      prisma.scrapingLog.findMany({ orderBy: { triggeredAt: 'desc' }, take: 5 }),
    ]);

    res.json({
      success: true,
      data: {
        db: { teams: teamsCount, players: playersCount, matches: matchesCount },
        lastScrapes,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/admin/scrape ────────────────────────────────────
// Dispara el scrape inicial manualmente
router.post('/scrape', async (req, res, next) => {
  try {
    // Respuesta inmediata — el scrape corre en background
    res.json({ success: true, message: 'Scrape iniciado en background. Revisá /api/admin/status.' });

    // Corre async sin bloquear
    runInitialScrape().catch(err => {
      console.error('[Admin] Error en scrape manual:', err.message);
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/admin/logs ───────────────────────────────────────
router.get('/logs', async (req, res, next) => {
  try {
    const logs = await prisma.scrapingLog.findMany({
      orderBy: { triggeredAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
