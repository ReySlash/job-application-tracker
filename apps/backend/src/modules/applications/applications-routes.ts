import express from 'express';
import { createApplicationHandler, getApplicationsListHandler } from './applications-controller.js';

const applicationsRouter = express.Router();

applicationsRouter.get('/', getApplicationsListHandler);


applicationsRouter.post('/', createApplicationHandler);


// Get, update, and delete a specific application by ID
applicationsRouter.get('/:id', async (req, res) => {
  res.send(`Get application with ID: ${req.params.id}`);
});

// Update an application by ID
applicationsRouter.put('/:id', async (req, res) => {
  res.send(`Update application with ID: ${req.params.id}`);
});

// Delete an application by ID
applicationsRouter.delete('/:id', async (req, res) => {
  res.send(`Delete application with ID: ${req.params.id}`);
});

export default applicationsRouter;
