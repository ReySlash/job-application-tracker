import prisma from '../../db.js';
import type { Application, ApplicationStatus as ApplicationStatusType } from '../../generated/prisma/client.js';
import { ApplicationStatus } from '../../generated/prisma/enums.js';
import type { ApplicationInput } from '../../types/application-input-type.js';

const applicationStatusMap: Record<ApplicationInput['status'], ApplicationStatusType> = {
  applied: ApplicationStatus.APPLIED,
  interview: ApplicationStatus.INTERVIEWING,
  offer: ApplicationStatus.OFFER,
  rejected: ApplicationStatus.REJECTED,
};

export async function getApplicationsList(): Promise<Application[]> {
  return prisma.application.findMany();
}

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
