import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

/**
 * GET /api/groups
 * Retorna los 8 grupos del torneo activo con sus equipos.
 */
router.get('/', async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        groupTeams: {
          include: { team: true },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:id
 * Retorna un grupo específico con equipos y partidos.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        groupTeams: {
          include: { team: true },
          orderBy: { position: 'asc' },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            odds: true,
          },
          orderBy: { matchDate: 'asc' },
        },
      },
    });

    if (!group) {
      const err = new Error('Grupo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:id/odds
 * Retorna las cuotas outright actuales para un grupo.
 */
router.get('/:id/odds', async (req, res, next) => {
  try {
    const odds = await prisma.groupOdd.findMany({
      where: { groupId: req.params.id },
      include: { team: true },
      orderBy: { toWinGroup: 'asc' },
    });

    res.json({ success: true, data: odds });
  } catch (error) {
    next(error);
  }
});

export default router;
