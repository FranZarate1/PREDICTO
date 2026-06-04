/**
 * Adapter: Football-Data.org API v4
 * Patrón Adapter — traduce la respuesta de football-data.org al modelo interno.
 *
 * Endpoints utilizados:
 * - GET /v4/competitions/WC/standings → Grupos y tablas de posiciones
 * - GET /v4/competitions/WC/matches  → Partidos del torneo
 * - GET /v4/competitions/WC/teams    → Equipos participantes
 */

import axios from 'axios';
import config from '../config/index.js';

const apiClient = axios.create({
  baseURL: config.footballData.baseUrl,
  headers: {
    'X-Auth-Token': config.footballData.apiKey,
  },
  timeout: 10000,
});

/**
 * Obtiene las posiciones/grupos del Mundial.
 * Endpoint: GET /v4/competitions/{code}/standings
 * @returns {Array} Grupos con equipos mapeados al modelo interno
 */
export async function getStandings() {
  const { data } = await apiClient.get(
    `/competitions/${config.footballData.competitionCode}/standings`
  );

  // Mapear al modelo interno
  return data.standings
    .filter((s) => s.type === 'TOTAL')
    .map((standing) => ({
      groupName: standing.group, // ej: "GROUP_A"
      stage: standing.stage,
      teams: standing.table.map((entry) => ({
        externalId: entry.team.id,
        name: entry.team.name,
        shortName: entry.team.shortName,
        tla: entry.team.tla,
        crestUrl: entry.team.crest,
        position: entry.position,
        playedGames: entry.playedGames,
        won: entry.won,
        draw: entry.draw,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: entry.goalDifference,
        points: entry.points,
      })),
    }));
}

/**
 * Obtiene los partidos del Mundial.
 * Endpoint: GET /v4/competitions/{code}/matches
 * @param {Object} options - Filtros opcionales
 * @param {string} options.stage - Filtrar por fase (ej: "GROUP_STAGE")
 * @param {number} options.matchday - Filtrar por jornada
 * @returns {Array} Partidos mapeados al modelo interno
 */
export async function getMatches(options = {}) {
  const params = {};
  if (options.stage) params.stage = options.stage;
  if (options.matchday) params.matchday = options.matchday;

  const { data } = await apiClient.get(
    `/competitions/${config.footballData.competitionCode}/matches`,
    { params }
  );

  return data.matches.map((match) => ({
    externalId: match.id,
    utcDate: new Date(match.utcDate),
    status: match.status,
    matchday: match.matchday,
    stage: match.stage,
    group: match.group,        // ej: "GROUP_A"
    homeTeam: {
      externalId: match.homeTeam.id,
      name: match.homeTeam.name,
      tla: match.homeTeam.tla,
    },
    awayTeam: {
      externalId: match.awayTeam.id,
      name: match.awayTeam.name,
      tla: match.awayTeam.tla,
    },
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
  }));
}

/**
 * Obtiene la información del torneo.
 * Endpoint: GET /v4/competitions/{code}
 * @returns {Object} Datos del torneo
 */
export async function getCompetition() {
  const { data } = await apiClient.get(
    `/competitions/${config.footballData.competitionCode}`
  );

  return {
    externalId: data.id,
    name: data.name,
    code: data.code,
    currentSeason: data.currentSeason
      ? {
          startDate: data.currentSeason.startDate,
          endDate: data.currentSeason.endDate,
          currentMatchday: data.currentSeason.currentMatchday,
        }
      : null,
  };
}

export default {
  getStandings,
  getMatches,
  getCompetition,
};
