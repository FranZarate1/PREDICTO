import { Router } from 'express';
import prisma from '../config/db.js';
import {
  calculateCombinedProbability,
  oddToImpliedProbability,
  estimateProbabilityByRanking,
} from '../services/probability.service.js';

const router = Router();

/**
 * POST /api/predictions
 * Persiste la predicción completa del usuario (8 grupos).
 * Body: { userId, tournamentId, items: [{ groupId, firstPlaceTeamId, secondPlaceTeamId }] }
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, tournamentId, items } = req.body;

    // Validación básica
    if (!userId || !tournamentId || !items || !Array.isArray(items)) {
      const err = new Error('Faltan campos requeridos: userId, tournamentId, items[]');
      err.statusCode = 400;
      throw err;
    }

    // Upsert de la predicción (una por usuario por torneo)
    const prediction = await prisma.userPrediction.upsert({
      where: {
        userId_tournamentId: { userId, tournamentId },
      },
      create: {
        userId,
        tournamentId,
        items: {
          create: items.map((item) => ({
            groupId: item.groupId,
            firstPlaceTeamId: item.firstPlaceTeamId,
            secondPlaceTeamId: item.secondPlaceTeamId,
          })),
        },
      },
      update: {
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            groupId: item.groupId,
            firstPlaceTeamId: item.firstPlaceTeamId,
            secondPlaceTeamId: item.secondPlaceTeamId,
          })),
        },
      },
      include: {
        items: {
          include: {
            group: true,
            firstPlace: true,
            secondPlace: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/predictions/calculate
 * Calcula la probabilidad combinada de una predicción.
 * Body: { predictionId } o { items: [{ groupId, firstPlaceTeamId, secondPlaceTeamId }] }
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { predictionId, items } = req.body;
    let predictionItems = items;

    if (predictionId) {
      const prediction = await prisma.userPrediction.findUnique({
        where: { id: predictionId },
        include: { items: true },
      });
      if (!prediction) {
        const err = new Error('Predicción no encontrada'); err.statusCode = 404; throw err;
      }
      predictionItems = prediction.items;
    }

    if (!predictionItems || predictionItems.length === 0) {
      const err = new Error('No hay items de predicción'); err.statusCode = 400; throw err;
    }

    const groupProbabilities = [];

    for (const item of predictionItems) {
      // 1. Intentar con GroupOdds (bookmaker data)
      const [firstPlaceOdd, secondPlaceOdd] = await Promise.all([
        prisma.groupOdd.findFirst({ where: { groupId: item.groupId, teamId: item.firstPlaceTeamId } }),
        prisma.groupOdd.findFirst({ where: { groupId: item.groupId, teamId: item.secondPlaceTeamId } }),
      ]);

      let firstProb  = firstPlaceOdd?.toWinGroup  ? oddToImpliedProbability(firstPlaceOdd.toWinGroup)  : null;
      let secondProb = secondPlaceOdd?.toQualify   ? oddToImpliedProbability(secondPlaceOdd.toQualify)  : null;
      let source     = 'bookmaker';

      // 2. Fallback: estimación por ranking FIFA
      if (firstProb === null || secondProb === null) {
        const groupTeams = await prisma.groupTeam.findMany({
          where:   { groupId: item.groupId },
          include: { team: true },
        });
        const estimate = estimateProbabilityByRanking(
          groupTeams.map(gt => gt.team),
          item.firstPlaceTeamId,
          item.secondPlaceTeamId,
        );
        if (estimate) {
          firstProb  = estimate.firstProb;
          secondProb = estimate.secondProb;
          source     = 'fifa_ranking';
        }
      }

      const groupProbability = (firstProb && secondProb)
        ? (firstProb / 100) * (secondProb / 100) * 100
        : null;

      groupProbabilities.push({
        groupId:              item.groupId,
        firstPlaceTeamId:     item.firstPlaceTeamId,
        secondPlaceTeamId:    item.secondPlaceTeamId,
        firstPlaceProbability: firstProb,
        secondPlaceProbability: secondProb,
        groupProbability,
        source,
      });
    }

    const validProbs       = groupProbabilities.filter(g => g.groupProbability !== null).map(g => g.groupProbability);
    const combinedProbability = validProbs.length > 0 ? calculateCombinedProbability(validProbs) : null;
    const usedRankingFallback = groupProbabilities.some(g => g.source === 'fifa_ranking');

    // Guardar si viene de predictionId
    if (predictionId && combinedProbability !== null) {
      await prisma.userPrediction.update({ where: { id: predictionId }, data: { combinedProbability } });
    }

    res.json({
      success: true,
      data: {
        groupProbabilities,
        combinedProbability,
        totalGroupsWithData: validProbs.length,
        source: usedRankingFallback ? 'fifa_ranking' : 'bookmaker',
        note: usedRankingFallback
          ? 'Probabilidades estimadas con ranking FIFA. Se actualizarán con cuotas reales durante el torneo.'
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/predictions/:userId
 * Recupera la predicción del usuario y su probabilidad calculada.
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const predictions = await prisma.userPrediction.findMany({
      where: { userId: req.params.userId },
      include: {
        tournament: true,
        items: {
          include: {
            group: true,
            firstPlace: true,
            secondPlace: true,
          },
          orderBy: { group: { name: 'asc' } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
});

export default router;
