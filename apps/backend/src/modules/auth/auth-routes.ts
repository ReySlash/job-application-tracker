import express from 'express';
import { loginHandler, refreshHandler, signupHandler } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupHandler);

authRouter.post('/login', loginHandler);
authRouter.post('/refresh', refreshHandler);

export default authRouter;
