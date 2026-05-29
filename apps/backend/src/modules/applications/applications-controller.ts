import prisma from '../../db.js';
import type { Application, ApplicationStatus as ApplicationStatusType } from '../../generated/prisma/client.js';
import { ApplicationStatus } from '../../generated/prisma/enums.js';
import applicationsFormSchema from './applications-schema.js';
import type { ApplicationInput } from '../../types/application-input-type.js'

const applicationStatusMap: Record<ApplicationInput['status'], ApplicationStatusType> = {
  applied: ApplicationStatus.APPLIED,
  interview: ApplicationStatus.INTERVIEWING,
  offer: ApplicationStatus.OFFER,
  rejected: ApplicationStatus.REJECTED,
};


// Get all applications
export async function getApplicationsList() {
  const applicationsList: Application[] = await prisma.application.findMany();
  return applicationsList;
}

// Validate request payloads before mapping them into database writes.
export function validateApplicationData(data: unknown) {
  return applicationsFormSchema.safeParse(data);
}

// Create a new application
export async function createApplication(data: ApplicationInput, userId: string) {
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

/*
Example ApplicationInput JSON for testing:
{
  "company": "Google",
  "role": "Senior Software Engineer",
  "status": "applied",
  "appliedAt": "2024-01-15",
  "location": "Mountain View, CA",
  "jobUrl": "https://careers.google.com/jobs/results/...",
  "notes": "Applied through referral"
}
*/

