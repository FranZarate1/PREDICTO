/**
 * Motor de Probabilidades — App Mundial
 *
 * Implementa dos modos:
 *  1. Con odds reales (bookmakers) — cuando hay GroupOdds en la DB
 *  2. Con ranking FIFA — fallback para el MVP antes de tener odds scrapeados
 */

// ── Modo 1: Cuotas decimales ──────────────────────────────────

export function oddToImpliedProbability(odd) {
  if (odd <= 0) throw new Error(`Cuota inválida: ${odd}`);
  return (1 / odd) * 100;
}

export function normalizeOverround(impliedProbabilities) {
  const total = impliedProbabilities.reduce((s, p) => s + p, 0);
  if (total === 0) throw new Error('La suma de probabilidades no puede ser 0.');
  return impliedProbabilities.map(p => (p / total) * 100);
}

export function oddsToNormalizedProbabilities(odds) {
  return normalizeOverround(odds.map(oddToImpliedProbability));
}

// ── Modo 2: Ranking FIFA (fallback MVP) ───────────────────────
// Cuanto MENOR el ranking, MAYOR la probabilidad de clasificar.
// Usamos la inversa del ranking como peso.

/**
 * Estima la probabilidad de clasificar de un grupo usando ranking FIFA.
 * El top 2 tiene una probabilidad proporcional a su "fuerza relativa".
 *
 * @param {Array<{id, name, fifaRanking}>} groupTeams - 4 equipos del grupo
 * @param {string} firstPlaceTeamId  - ID del equipo elegido como 1ro
 * @param {string} secondPlaceTeamId - ID del equipo elegido como 2do
 * @returns {{ firstProb, secondProb, combinedProb }}
 */
export function estimateProbabilityByRanking(groupTeams, firstPlaceTeamId, secondPlaceTeamId) {
  // Calcular "fuerza" = 1/ranking (equipos sin ranking = posición 100)
  const teamsWithStrength = groupTeams.map(t => ({
    id:       t.id,
    name:     t.name,
    ranking:  t.fifaRanking || 100,
    strength: 1 / (t.fifaRanking || 100),
  }));

  const totalStrength = teamsWithStrength.reduce((s, t) => s + t.strength, 0);

  // Probabilidad de cada equipo de pasar (proporcional a su fuerza)
  const teamProbs = teamsWithStrength.map(t => ({
    ...t,
    qualifyProb: (t.strength / totalStrength) * 100,
  }));

  const firstTeam  = teamProbs.find(t => t.id === firstPlaceTeamId);
  const secondTeam = teamProbs.find(t => t.id === secondPlaceTeamId);

  if (!firstTeam || !secondTeam) return null;

  // Probabilidad de ganar el grupo ≈ 60% de la probabilidad de clasificar
  // (estimación conservadora — el más fuerte no siempre gana el grupo)
  const firstProb  = firstTeam.qualifyProb * 0.6;
  const secondProb = secondTeam.qualifyProb * 0.85; // clasificar es más probable que ganar

  // Probabilidad combinada de que AMBOS accedan en esas posiciones
  const combinedProb = (firstProb / 100) * (secondProb / 100) * 100;

  return {
    firstProb:    parseFloat(firstProb.toFixed(2)),
    secondProb:   parseFloat(secondProb.toFixed(2)),
    combinedProb: parseFloat(combinedProb.toFixed(4)),
    source:       'fifa_ranking',
    note:         'Estimación basada en ranking FIFA. Se actualizará con odds reales durante el torneo.',
  };
}

// ── Probabilidad combinada total ──────────────────────────────

/**
 * P(A ∩ B ∩ ... ∩ N) = P(A) × P(B) × ... × P(N)
 * @param {number[]} probabilities - Array de probabilidades en % (0-100)
 * @returns {number} Probabilidad combinada en %
 */
export function calculateCombinedProbability(probabilities) {
  if (!probabilities.length) return 0;
  const combined = probabilities.reduce((prod, p) => prod * (p / 100), 1);
  return combined * 100;
}

/**
 * Formatea la probabilidad para mostrar en UI
 * @param {number} prob - probabilidad en %
 * @returns {string} - "45.2%" o "1 en 34,722"
 */
export function formatProbability(prob) {
  if (prob === null || prob === undefined) return 'N/A';
  if (prob >= 1) return `${prob.toFixed(2)}%`;
  if (prob >= 0.01) return `${prob.toFixed(4)}%`;
  const oneIn = Math.round(100 / prob);
  return `1 en ${oneIn.toLocaleString('es-AR')}`;
}
