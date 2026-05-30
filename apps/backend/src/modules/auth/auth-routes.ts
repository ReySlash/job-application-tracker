import express from 'express';
import { signupHandler } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupHandler);

export default authRouter;
