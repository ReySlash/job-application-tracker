import express from 'express';
import { requireAuth } from '../../middleware/auth-middleware.js';
import { createApplicationHandler, getApplicationsListHandler, getApplicationByIdHandler } from './applications-controller.js';

const applicationsRouter = express.Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', getApplicationsListHandler);


applicationsRouter.post('/', createApplicationHandler);


// Get, update, and delete a specific application by ID
applicationsRouter.get('/:id', getApplicationByIdHandler);

// Update an application by ID
applicationsRouter.put('/:id', async (req, res) => {
  res.send(`Update application with ID: ${req.params.id}`);
});

// Delete an application by ID
applicationsRouter.delete('/:id', async (req, res) => {
  res.send(`Delete application with ID: ${req.params.id}`);
});

export default applicationsRouter;
