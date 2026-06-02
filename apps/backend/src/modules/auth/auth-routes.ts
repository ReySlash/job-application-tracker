import express from 'express';
import { requireAuth } from '../../middleware/auth-middleware.js';
import {
  demoLoginHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  resetPasswordHandler,
  signupHandler,
  verifyEmailHandler,
} from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupHandler);
authRouter.get('/verify-email', verifyEmailHandler);

authRouter.post('/login', loginHandler);
authRouter.post('/demo-login', demoLoginHandler);
authRouter.post('/forgot-password', forgotPasswordHandler);
authRouter.post('/reset-password', resetPasswordHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.get('/me', requireAuth, meHandler);

export default authRouter;
