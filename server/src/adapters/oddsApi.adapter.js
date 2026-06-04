/**
 * Adapter: The Odds API v4
 * Patrón Adapter — traduce la respuesta de The Odds API al modelo interno.
 *
 * Endpoints utilizados:
 * - GET /v4/sports/{sport}/odds → Cuotas de partidos (h2h, spreads, totals)
 * - GET /v4/sports/{sport}/outrights → Cuotas outright (campeón, grupo)
 * - GET /v4/sports → Lista de deportes disponibles
 */

import axios from 'axios';
import config from '../config/index.js';

const apiClient = axios.create({
  baseURL: config.oddsApi.baseUrl,
  timeout: 10000,
});

/**
 * Parámetros base que van en todas las requests a The Odds API.
 */
function baseParams() {
  return {
    apiKey: config.oddsApi.apiKey,
    regions: config.oddsApi.regions,
    oddsFormat: config.oddsApi.oddsFormat,
  };
}

/**
 * Obtiene cuotas head-to-head (1X2) para partidos del Mundial.
 * Endpoint: GET /v4/sports/{sport}/odds?markets=h2h
 * @returns {Array} Cuotas mapeadas al modelo interno
 */
export async function getMatchOdds() {
  const { data } = await apiClient.get(
    `/sports/${config.oddsApi.sportKey}/odds`,
    {
      params: {
        ...baseParams(),
        markets: 'h2h',
      },
    }
  );

  return data.map((event) => ({
    externalId: event.id,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: new Date(event.commence_time),
    bookmakers: event.bookmakers.map((bk) => ({
      name: bk.key,
      title: bk.title,
      lastUpdate: new Date(bk.last_update),
      markets: bk.markets.map((market) => ({
        key: market.key,
        outcomes: market.outcomes.map((outcome) => ({
          name: outcome.name,
          price: outcome.price, // Cuota decimal
        })),
      })),
    })),
  }));
}

/**
 * Obtiene cuotas outright (futuros) para el Mundial.
 * Esto incluye: campeón del torneo, ganador de grupo, etc.
 * Endpoint: GET /v4/sports/{sport}/outrights
 * @returns {Array} Cuotas outright mapeadas
 */
export async function getOutrightOdds() {
  const { data } = await apiClient.get(
    `/sports/${config.oddsApi.sportKey}/outrights`,
    {
      params: baseParams(),
    }
  );

  return data.map((event) => ({
    externalId: event.id,
    title: event.sport_title,
    commenceTime: event.commence_time
      ? new Date(event.commence_time)
      : null,
    bookmakers: event.bookmakers.map((bk) => ({
      name: bk.key,
      title: bk.title,
      lastUpdate: new Date(bk.last_update),
      markets: bk.markets.map((market) => ({
        key: market.key,
        outcomes: market.outcomes.map((outcome) => ({
          name: outcome.name,     // Nombre del equipo
          price: outcome.price,   // Cuota decimal
        })),
      })),
    })),
  }));
}

/**
 * Verifica si el deporte está disponible en la API.
 * Endpoint: GET /v4/sports
 * @returns {Object|null} Información del deporte o null si no existe
 */
export async function checkSportAvailability() {
  const { data } = await apiClient.get('/sports', {
    params: { apiKey: config.oddsApi.apiKey },
  });

  return data.find((sport) => sport.key === config.oddsApi.sportKey) || null;
}

export default {
  getMatchOdds,
  getOutrightOdds,
  checkSportAvailability,
};
