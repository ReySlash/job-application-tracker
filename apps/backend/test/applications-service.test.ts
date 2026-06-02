import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/errors.js';
import { ApplicationStatus } from '../src/generated/prisma/enums.js';
import { applicationInput, applicationRecord } from './helpers/application-fixtures.js';

const { mockPrisma, mockResetDemoApplicationsForUser } = vi.hoisted(() => ({
  mockPrisma: {
    application: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockResetDemoApplicationsForUser: vi.fn(),
}));

vi.mock('../src/db.js', () => ({
  default: mockPrisma,
}));

vi.mock('../src/demo/demo-services.js', () => ({
  resetDemoApplicationsForUser: mockResetDemoApplicationsForUser,
}));

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsList,
  resetDemoApplications,
  updateApplication,
} from '../src/modules/applications/applications-service.js';

describe('applications-service', () => {
  beforeEach(() => {
    for (const group of Object.values(mockPrisma)) {
      for (const fn of Object.values(group)) {
        fn.mockReset();
      }
    }

    mockResetDemoApplicationsForUser.mockReset();
  });

  it('lists applications for the authenticated user only', async () => {
    mockPrisma.application.findMany.mockResolvedValue([applicationRecord]);

    const result = await getApplicationsList('user-1');

    expect(result).toEqual([applicationRecord]);
    expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('maps incoming application data before creating a record', async () => {
    mockPrisma.application.create.mockResolvedValue(applicationRecord);

    await createApplication(applicationInput, 'user-1');

    expect(mockPrisma.application.create).toHaveBeenCalledWith({
      data: {
        company: applicationInput.company,
        role: applicationInput.role,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(applicationInput.appliedAt),
        location: applicationInput.location,
        jobUrl: applicationInput.jobUrl,
        notes: applicationInput.notes,
        userId: 'user-1',
      },
    });
  });

  it('returns an application when the id belongs to the current user', async () => {
    mockPrisma.application.findFirst.mockResolvedValue(applicationRecord);

    const result = await getApplicationById('application-1', 'user-1');

    expect(result).toEqual(applicationRecord);
    expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'application-1',
        userId: 'user-1',
      },
    });
  });

  it('rejects application access when the id is not owned by the current user', async () => {
    mockPrisma.application.findFirst.mockResolvedValue(null);

    await expect(getApplicationById('application-2', 'user-1')).rejects.toMatchObject<AppError>({
      message: 'Application not found',
      statusCode: 404,
    });
  });

  it('updates an application only after verifying ownership', async () => {
    mockPrisma.application.findFirst.mockResolvedValue(applicationRecord);
    mockPrisma.application.update.mockResolvedValue(applicationRecord);

    await updateApplication('application-1', applicationInput, 'user-1');

    expect(mockPrisma.application.update).toHaveBeenCalledWith({
      where: {
        id: 'application-1',
      },
      data: {
        company: applicationInput.company,
        role: applicationInput.role,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(applicationInput.appliedAt),
        location: applicationInput.location,
        jobUrl: applicationInput.jobUrl,
        notes: applicationInput.notes,
      },
    });
  });

  it('deletes an application only after verifying ownership', async () => {
    mockPrisma.application.findFirst.mockResolvedValue(applicationRecord);
    mockPrisma.application.delete.mockResolvedValue(applicationRecord);

    await deleteApplication('application-1', 'user-1');

    expect(mockPrisma.application.delete).toHaveBeenCalledWith({
      where: {
        id: 'application-1',
      },
    });
  });

  it('delegates demo reset with the authenticated user context', async () => {
    mockResetDemoApplicationsForUser.mockResolvedValue(undefined);

    await resetDemoApplications('demo-user', true);

    expect(mockResetDemoApplicationsForUser).toHaveBeenCalledWith('demo-user', true);
  });
});
