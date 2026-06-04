/**
 * Motor de Probabilidades — Sub-fase 1B
 *
 * Implementa las fórmulas del documento de arquitectura:
 * - Probabilidad implícita: P(%) = (1 / Cuota) × 100
 * - Normalización de margen (vigorish removal)
 * - Probabilidad combinada: P(A ∩ B ∩ ... ∩ N) = P(A) × P(B) × ... × P(N)
 */

/**
 * Convierte una cuota decimal a probabilidad implícita.
 * @param {number} odd - Cuota decimal (ej: 2.50)
 * @returns {number} Probabilidad en porcentaje (ej: 40.0)
 */
export function oddToImpliedProbability(odd) {
  if (odd <= 0) {
    throw new Error(`Cuota inválida: ${odd}. Debe ser mayor a 0.`);
  }
  return (1 / odd) * 100;
}

/**
 * Normaliza probabilidades removiendo el overround (vigorish) de la casa.
 * Las probabilidades implícitas de todos los outcomes de un evento suman >100%.
 * Esta función las normaliza a 100%.
 *
 * @param {number[]} impliedProbabilities - Array de probabilidades implícitas en %
 * @returns {number[]} Probabilidades normalizadas sumando 100%
 *
 * @example
 * // Cuotas: Local 2.10, Empate 3.30, Visitante 3.50
 * // Implícitas: 47.62%, 30.30%, 28.57% = 106.49% (overround 6.49%)
 * normalizeOverround([47.62, 30.30, 28.57])
 * // → [44.74, 28.45, 26.83] (suman ~100%)
 */
export function normalizeOverround(impliedProbabilities) {
  const totalOverround = impliedProbabilities.reduce((sum, p) => sum + p, 0);

  if (totalOverround === 0) {
    throw new Error('La suma de probabilidades no puede ser 0.');
  }

  return impliedProbabilities.map((p) => (p / totalOverround) * 100);
}

/**
 * Calcula la probabilidad combinada de eventos independientes.
 * P(A ∩ B ∩ ... ∩ N) = P(A) × P(B) × ... × P(N)
 *
 * @param {number[]} probabilities - Array de probabilidades en porcentaje (0–100)
 * @returns {number} Probabilidad combinada en porcentaje
 *
 * @example
 * // Brasil 1ro del Grupo G (66.7%) + Argentina 1ra del Grupo C (76.9%)
 * calculateCombinedProbability([66.7, 76.9])
 * // → 51.3%
 */
export function calculateCombinedProbability(probabilities) {
  if (probabilities.length === 0) {
    return 0;
  }

  // Convertir porcentajes a fracciones, multiplicar, y convertir de vuelta
  const combined = probabilities.reduce((product, p) => product * (p / 100), 1);
  return combined * 100;
}

/**
 * Dado un array de cuotas, convierte todas a probabilidades implícitas
 * y las normaliza removiendo el overround.
 *
 * @param {number[]} odds - Array de cuotas decimales
 * @returns {number[]} Probabilidades normalizadas en %
 */
export function oddsToNormalizedProbabilities(odds) {
  const implied = odds.map(oddToImpliedProbability);
  return normalizeOverround(implied);
}
