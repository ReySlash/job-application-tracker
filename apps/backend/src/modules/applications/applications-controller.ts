import type { RequestHandler } from 'express';
import z from 'zod';
import applicationsFormSchema from './applications-schema.js';
import { createApplication, getApplicationsList } from './applications-service.js';

// Handle for applications routes
export const getApplicationsListHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const applicationsList = await getApplicationsList(req.user.id);
    return res.status(200).json({ applicationsList });
  } catch (error) {
    console.error('Failed to fetch applications', error);
    return res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Handler for creating a new application
export const createApplicationHandler: RequestHandler = async (req, res) => {
  const validationResult = applicationsFormSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid application data',
      errors: z.flattenError(validationResult.error),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await createApplication(validationResult.data, req.user.id);
    return res.status(201).json({ message: 'Application created successfully' });
  } catch (error) {
    console.error('Failed to create application', error);
    return res.status(500).json({ message: 'Failed to create application' });
  }
};
