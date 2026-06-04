/**
 * Constantes compartidas entre server y client.
 * Importar como: import { COMPETITION_CODE, ... } from '../shared/constants.js'
 */

// Football-Data.org competition code para el Mundial
export const COMPETITION_CODE = 'WC';

// The Odds API sport key para el Mundial
export const ODDS_SPORT_KEY = 'soccer_fifa_world_cup';

// Número de grupos en un Mundial
export const TOTAL_GROUPS = 8;

// Equipos por grupo
export const TEAMS_PER_GROUP = 4;

// Clasificados por grupo
export const QUALIFIERS_PER_GROUP = 2;

// Estados de partido (Football-Data.org)
export const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'TIMED',
  IN_PLAY: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
};

// Stages del torneo
export const TOURNAMENT_STAGE = {
  GROUP_STAGE: 'GROUP_STAGE',
  ROUND_OF_16: 'ROUND_OF_16',
  QUARTER_FINALS: 'QUARTER_FINALS',
  SEMI_FINALS: 'SEMI_FINALS',
  THIRD_PLACE: 'THIRD_PLACE',
  FINAL: 'FINAL',
};
