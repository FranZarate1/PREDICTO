import { Router } from 'express';
import prisma from '../config/db.js';
import { calculateCombinedProbability, oddToImpliedProbability } from '../services/probability.service.js';

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

    // Si se envía un predictionId, buscar los items en la DB
    if (predictionId) {
      const prediction = await prisma.userPrediction.findUnique({
        where: { id: predictionId },
        include: { items: true },
      });

      if (!prediction) {
        const err = new Error('Predicción no encontrada');
        err.statusCode = 404;
        throw err;
      }

      predictionItems = prediction.items;
    }

    if (!predictionItems || predictionItems.length === 0) {
      const err = new Error('No hay items de predicción para calcular');
      err.statusCode = 400;
      throw err;
    }

    // Para cada item, buscar la cuota outright del equipo elegido como 1ro
    const groupProbabilities = [];

    for (const item of predictionItems) {
      // Buscar cuota de "ganar el grupo" para el equipo elegido como 1ro
      const firstPlaceOdd = await prisma.groupOdd.findFirst({
        where: {
          groupId: item.groupId,
          teamId: item.firstPlaceTeamId,
        },
      });

      // Buscar cuota de "clasificar" para el equipo elegido como 2do
      const secondPlaceOdd = await prisma.groupOdd.findFirst({
        where: {
          groupId: item.groupId,
          teamId: item.secondPlaceTeamId,
        },
      });

      const firstProb = firstPlaceOdd?.toWinGroup
        ? oddToImpliedProbability(firstPlaceOdd.toWinGroup)
        : null;

      const secondProb = secondPlaceOdd?.toQualify
        ? oddToImpliedProbability(secondPlaceOdd.toQualify)
        : null;

      groupProbabilities.push({
        groupId: item.groupId,
        firstPlaceTeamId: item.firstPlaceTeamId,
        secondPlaceTeamId: item.secondPlaceTeamId,
        firstPlaceProbability: firstProb,
        secondPlaceProbability: secondProb,
        // Probabilidad combinada de este grupo: P(1ro) × P(2do clasificar)
        groupProbability: firstProb && secondProb
          ? (firstProb / 100) * (secondProb / 100) * 100
          : null,
      });
    }

    const validProbabilities = groupProbabilities
      .map((g) => g.groupProbability)
      .filter((p) => p !== null);

    const combinedProbability = validProbabilities.length > 0
      ? calculateCombinedProbability(validProbabilities)
      : null;

    // Si hay un predictionId, guardar el resultado
    if (predictionId && combinedProbability !== null) {
      await prisma.userPrediction.update({
        where: { id: predictionId },
        data: { combinedProbability },
      });

      // Actualizar probabilidades individuales
      for (const gp of groupProbabilities) {
        if (gp.groupProbability !== null) {
          await prisma.predictionItem.updateMany({
            where: {
              predictionId,
              groupId: gp.groupId,
            },
            data: { groupProbability: gp.groupProbability },
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        groupProbabilities,
        combinedProbability,
        totalGroupsWithOdds: validProbabilities.length,
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
