import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import groupsRouter from './routes/groups.routes.js';
import teamsRouter from './routes/teams.routes.js';
import predictionsRouter from './routes/predictions.routes.js';
import adminRouter from './routes/admin.routes.js';

const app = express();

// ── Middleware global ───────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── Healthcheck ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:      'ok',
    timestamp:   new Date().toISOString(),
    environment: config.nodeEnv,
    version:     '0.2.0-mvp',
  });
});

// ── Rutas de la API ─────────────────────────────────────
app.use('/api/groups',      groupsRouter);
app.use('/api/teams',       teamsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/admin',       adminRouter);

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: `Ruta no encontrada: ${req.path}` } });
});

// ── Manejo de errores ───────────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ────────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ⚽ App Mundial Server v0.2.0 MVP
  ────────────────────────────────────
  Puerto:     ${config.port}
  Entorno:    ${config.nodeEnv}
  ────────────────────────────────────
  GET  /api/health
  GET  /api/groups
  GET  /api/teams
  GET  /api/teams/:id
  POST /api/predictions/calculate
  POST /api/admin/scrape  (requiere ADMIN_TOKEN)
  ────────────────────────────────────
  `);
});

export default app;
