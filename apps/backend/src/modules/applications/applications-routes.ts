import express from 'express';
import { requireAuth } from '../../middleware/auth-middleware.js';
import { createApplicationHandler, 
  getApplicationsListHandler, 
  getApplicationByIdHandler,
  updateApplicationHandler,
  deleteApplicationHandler } from './applications-controller.js';

const applicationsRouter = express.Router();


// Apply authentication middleware to all routes in this router
applicationsRouter.use(requireAuth);

// Handler for fetching the list of applications for the authenticated user
applicationsRouter.get('/', getApplicationsListHandler);

// Handler for creating a new application
applicationsRouter.post('/', createApplicationHandler);

// Get, update, and delete a specific application by ID
applicationsRouter.get('/:id', getApplicationByIdHandler);

// Update an application by ID
applicationsRouter.put('/:id', updateApplicationHandler);

// Delete an application by ID
applicationsRouter.delete('/:id', deleteApplicationHandler);

export default applicationsRouter;
