import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

/**
 * GET /api/teams
 * Retorna todos los equipos con ranking y confederación.
 */
router.get('/', async (req, res, next) => {
  try {
    const { group, confederation } = req.query;
    const where = {};
    if (confederation) where.confederation = confederation;

    const teams = await prisma.team.findMany({
      where,
      include: {
        groupTeams: {
          include: { group: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/:id
 * Retorna un equipo con sus jugadores y últimos 5 partidos.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        players:    { orderBy: [{ position: 'asc' }, { number: 'asc' }] },
        groupTeams: { include: { group: true } },
        homeMatches: {
          where:   { status: 'FINISHED' },
          include: { awayTeam: true },
          orderBy: { matchDate: 'desc' },
          take: 5,
        },
        awayMatches: {
          where:   { status: 'FINISHED' },
          include: { homeTeam: true },
          orderBy: { matchDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!team) {
      const err = new Error('Equipo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    // Combinar y ordenar últimos partidos
    const recentMatches = [
      ...team.homeMatches.map(m => ({ ...m, perspective: 'home' })),
      ...team.awayMatches.map(m => ({ ...m, perspective: 'away' })),
    ]
      .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
      .slice(0, 5);

    res.json({ success: true, data: { ...team, recentMatches } });
  } catch (error) {
    next(error);
  }
});

export default router;
