import express from 'express';
import { signupHandler, loginHandler } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupHandler);

authRouter.post('/login', loginHandler);

export default authRouter;
