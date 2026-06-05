import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { checkDatabaseConnection } from './db.js';
import applicationsRouter from './modules/applications/applications-routes.js';
import authRouter from './modules/auth/auth-routes.js';

type CreateAppOptions = {
  readinessCheck?: () => Promise<void>;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const allowedOrigins = new Set(env.frontendUrls);
  const readinessCheck = options.readinessCheck ?? checkDatabaseConnection;

  // Middleware
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/ready', async (_req, res) => {
    try {
      await readinessCheck();
      res.status(200).json({ status: 'ok', database: 'ok' });
    } catch (error) {
      console.error('Database readiness check failed', error);
      res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  // Routers
  app.use('/api/applications', applicationsRouter);
  app.use('/api/auth', authRouter);

  return app;
}
