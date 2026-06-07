import express from 'express';
import { requireAuth } from '../../middleware/auth-middleware.js';
import {
  demoLoginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
} from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/demo-login', demoLoginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.get('/me', requireAuth, meHandler);

export default authRouter;
