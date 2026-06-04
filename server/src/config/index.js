import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // APIs externas
  footballData: {
    baseUrl: 'https://api.football-data.org/v4',
    apiKey: process.env.FOOTBALL_DATA_API_KEY || '',
    competitionCode: 'WC',
    rateLimit: 10,  // requests por minuto (free tier)
  },

  oddsApi: {
    baseUrl: 'https://api.the-odds-api.com/v4',
    apiKey: process.env.ODDS_API_KEY || '',
    sportKey: 'soccer_fifa_world_cup',
    regions: 'eu',
    oddsFormat: 'decimal',
    monthlyCredits: 500,  // free tier
  },

  // Intervalos del worker (Fase 2)
  worker: {
    matchDayIntervalMs: 5 * 60 * 1000,   // 5 min durante partidos
    offDayIntervalMs: 60 * 60 * 1000,     // 1 hora fuera de partidos
  },
};

export default config;
