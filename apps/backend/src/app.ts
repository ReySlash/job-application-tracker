import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import applicationsRouter from './modules/applications/applications-routes.js';
import authRouter from './modules/auth/auth-routes.js';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(env.frontendUrls);

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

  // Routers
  app.use('/api/applications', applicationsRouter);
  app.use('/api/auth', authRouter);


  return app;
}
