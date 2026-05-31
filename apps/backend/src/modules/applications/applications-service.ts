import prisma from '../../db.js';
import type { Application, ApplicationStatus as ApplicationStatusType } from '../../generated/prisma/client.js';
import { ApplicationStatus } from '../../generated/prisma/enums.js';
import { AppError } from '../../lib/errors.js';
import type { ApplicationInput } from '../../types/application-input-type.js';

const applicationStatusMap: Record<ApplicationInput['status'], ApplicationStatusType> = {
  applied: ApplicationStatus.APPLIED,
  interview: ApplicationStatus.INTERVIEWING,
  offer: ApplicationStatus.OFFER,
  rejected: ApplicationStatus.REJECTED,
};

// Service function for fetching the list of applications for a user
export async function getApplicationsList(userId: string): Promise<Application[]> {
  return prisma.application.findMany({
    where: { userId },
  });
}

// Service function for creating a new application
export async function createApplication(data: ApplicationInput, userId: string): Promise<void> {
  await prisma.application.create({
    data: {
      company: data.company,
      role: data.role,
      status: applicationStatusMap[data.status],
      appliedAt: new Date(data.appliedAt),
      location: data.location,
      jobUrl: data.jobUrl ?? null,
      notes: data.notes ?? null,
      userId,
    },
  });
}

// Service function for fetching a specific application by ID
export async function getApplicationById(applicationId: string, userId: string): Promise<Application> {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  return application;
}

// Service function for updating an application by ID
export async function updateApplication(applicationId: string, data: ApplicationInput, userId: string): Promise<void> {
  const existingApplication = await getApplicationById(applicationId, userId);

  await prisma.application.update({
    where: {
      id: existingApplication.id,
    },
    data: {
      company: data.company,
      role: data.role,
      status: applicationStatusMap[data.status],
      appliedAt: new Date(data.appliedAt),
      location: data.location,
      jobUrl: data.jobUrl ?? null,
      notes: data.notes ?? null,
    },
  });
}

// Service function for deleting an application by ID
export async function deleteApplication(applicationId: string, userId: string): Promise<void> {
  const existingApplication = await getApplicationById(applicationId, userId);

  await prisma.application.delete({
    where: {
      id: existingApplication.id,
    },
  });
}
