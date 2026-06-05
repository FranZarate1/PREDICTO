/**
 * Cálculo de probabilidad client-side usando ranking FIFA.
 */

/**
 * Estima la probabilidad de un resultado específico en un grupo.
 * Soporta predicción de 1ro, 2do y opcionalmente 3ro.
 *
 * @param {Array<{id, fifaRanking}>} teams  - Los 4 equipos del grupo
 * @param {string} firstId   - ID del equipo elegido como 1ro
 * @param {string} secondId  - ID del equipo elegido como 2do
 * @param {string} [thirdId] - ID del equipo elegido como 3ro (opcional)
 * @returns {{ firstProb, secondProb, thirdProb?, groupProb } | null}
 */
export function estimateGroupProbability(teams, firstId, secondId, thirdId = null) {
  if (!firstId || !secondId || firstId === secondId) return null;

  // Fuerza proporcional al ranking (menor ranking = más fuerte)
  const strength = t => 1 / (t.fifaRanking || 100);
  const totalStr = teams.reduce((s, t) => s + strength(t), 0);
  const prob     = id => {
    const t = teams.find(t => t.id === id);
    return t ? (strength(t) / totalStr) * 100 : null;
  };

  const firstBase  = prob(firstId);
  const secondBase = prob(secondId);
  if (firstBase === null || secondBase === null) return null;

  // P(ganar el grupo) ≈ 60% de la prob base
  // P(clasificar 2do)  ≈ 85% de la prob base
  const firstProb  = firstBase  * 0.60;
  const secondProb = secondBase * 0.85;
  let groupProb    = (firstProb / 100) * (secondProb / 100) * 100;

  // 3er lugar — calculado entre los 2 equipos restantes
  let thirdProb = null;
  if (thirdId && thirdId !== firstId && thirdId !== secondId) {
    const remaining    = teams.filter(t => t.id !== firstId && t.id !== secondId);
    const remainingStr = remaining.reduce((s, t) => s + strength(t), 0);
    const thirdTeam    = remaining.find(t => t.id === thirdId);
    if (thirdTeam) {
      thirdProb = (strength(thirdTeam) / remainingStr) * 100 * 0.85;
      groupProb = groupProb * (thirdProb / 100);
    }
  }

  return {
    firstProb:  parseFloat(firstProb.toFixed(2)),
    secondProb: parseFloat(secondProb.toFixed(2)),
    thirdProb:  thirdProb !== null ? parseFloat(thirdProb.toFixed(2)) : null,
    groupProb:  parseFloat(groupProb.toFixed(4)),
  };
}

/**
 * Combina probabilidades de múltiples grupos independientes.
 * P(total) = P(A) × P(B) × ... × P(N)
 */
export function combineProbabilities(groupProbs) {
  if (!groupProbs.length) return 0;
  return groupProbs.reduce((prod, p) => prod * (p / 100), 1) * 100;
}

/**
 * Formatea una probabilidad para mostrar en UI.
 * >= 1%    → "45.23%"
 * >= 0.01% → "0.0042%"
 * < 0.01%  → "1 en 34.722"
 */
export function formatProbability(prob) {
  if (prob === null || prob === undefined) return '—';
  if (prob >= 1)    return `${prob.toFixed(2)}%`;
  if (prob >= 0.01) return `${prob.toFixed(4)}%`;
  const oneIn = Math.round(100 / prob);
  return `1 en ${oneIn.toLocaleString('es-AR')}`;
}
