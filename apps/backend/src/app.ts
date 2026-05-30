import express from 'express';

import applicationsRouter from './modules/applications/applications-routes.js';
import usersRouter from './modules/users/users-routes.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Routers
  app.use('/api/applications', applicationsRouter);
  app.use('/api/users', usersRouter);


  return app;
}
