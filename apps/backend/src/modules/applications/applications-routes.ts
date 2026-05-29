import express from 'express';
import * as z from 'zod';
import { getApplicationsList, validateApplicationData, createApplication } from './applications-controller.js';

const applicationsRouter = express.Router();

// Get all applications
applicationsRouter.get('/', async (req, res) => {
  try {
    const applicationsList = await getApplicationsList();
    return res.status(200).json({ applicationsList });
  } catch (error) {
    console.error('Failed to fetch applications', error);
    return res.status(500).json({ message: 'Failed to fetch applications' });
  }
});


// Create a new application
applicationsRouter.post('/', async (req, res) => {
  const validationResult = validateApplicationData(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid application data',
      errors: z.flattenError(validationResult.error),
    });
  }

  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ message: 'Missing user id' });
  }

  const validData = validationResult.data;

  try {
    await createApplication(validData, userId);
    return res.status(201).json({ message: 'Application created successfully' });
  } catch (error) {
    console.error('Failed to create application', error);
    return res.status(500).json({ message: 'Failed to create application' });
  }
});


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
