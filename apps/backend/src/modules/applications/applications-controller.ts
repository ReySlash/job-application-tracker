import type { RequestHandler } from 'express';
import z from 'zod';
import { AppError } from '../../lib/errors.js';
import applicationsFormSchema from './applications-schema.js';
import { createApplication,
   getApplicationsList,
   getApplicationById,
   updateApplication,
   deleteApplication } from './applications-service.js';

// Handler for fetching the list of applications for the authenticated user
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

// Handler for fetching a specific application by ID
export const getApplicationByIdHandler: RequestHandler = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const applicationId = req.params.id as string;
      const application = await getApplicationById(applicationId, req.user.id);
      return res.status(200).json({ application });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      console.error('Failed to fetch application', error);
      return res.status(500).json({ message: 'Failed to fetch application' });
    }
}


// Handler for updating an application by ID
export const updateApplicationHandler: RequestHandler = async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const applicationId = req.params.id as string;
  const validationResult = applicationsFormSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid application data',
      errors: z.flattenError(validationResult.error),
    });
  }

  try {
    await updateApplication(applicationId, validationResult.data, req.user.id);
    return res.status(200).json({ message: 'Application updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Failed to update application', error);
    return res.status(500).json({ message: 'Failed to update application' });
  }
}

export const deleteApplicationHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const applicationId = req.params.id as string;

  try {
    await deleteApplication(applicationId, req.user.id);
    return res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Failed to delete application', error);
    return res.status(500).json({ message: 'Failed to delete application' });
  }
}
