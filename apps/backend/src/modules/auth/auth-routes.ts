import express from 'express';
import { requireAuth } from '../../middleware/auth-middleware.js';
import { loginHandler, logoutHandler, meHandler, refreshHandler, signupHandler } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupHandler);

authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.get('/me', requireAuth, meHandler);

export default authRouter;
