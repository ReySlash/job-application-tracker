import cookieParser from 'cookie-parser';
import express from 'express';

import applicationsRouter from './modules/applications/applications-routes.js';
import authRouter from './modules/auth/auth-routes.js';

export function createApp() {
  const app = express();

  // Middleware
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
