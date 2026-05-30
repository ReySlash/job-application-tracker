import express from 'express';
import { createUserHandler } from './users-controller.js';

const usersRouter = express.Router();

usersRouter.post('/create', createUserHandler);


export default usersRouter;
