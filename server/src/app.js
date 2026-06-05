import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import groupsRouter from './routes/groups.routes.js';
import predictionsRouter from './routes/predictions.routes.js';

const app = express();

// ── Middleware global ───────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Healthcheck ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ── Rutas de la API ─────────────────────────────────────
app.use('/api/groups', groupsRouter);
app.use('/api/predictions', predictionsRouter);

// ── Manejo de errores ───────────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ────────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ⚽ App Mundial Server
  ────────────────────────
  Puerto:     ${config.port}
  Entorno:    ${config.nodeEnv}
  Health:     http://localhost:${config.port}/api/health
  ────────────────────────
  `);
});

export default app;
