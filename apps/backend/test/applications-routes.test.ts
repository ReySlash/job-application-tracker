import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/errors.js';
import { generateAccessToken } from '../src/lib/tokens.js';
import { applicationInput, applicationRecord } from './helpers/application-fixtures.js';

const {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsList,
  resetDemoApplications,
  updateApplication,
} = vi.hoisted(() => ({
  createApplication: vi.fn(),
  deleteApplication: vi.fn(),
  getApplicationById: vi.fn(),
  getApplicationsList: vi.fn(),
  resetDemoApplications: vi.fn(),
  updateApplication: vi.fn(),
}));

vi.mock('../src/modules/applications/applications-service.js', () => ({
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsList,
  resetDemoApplications,
  updateApplication,
}));

import { createApp } from '../src/app.js';

const app = createApp();
const accessToken = generateAccessToken({
  userId: 'user-1',
  email: 'verified@example.com',
  isDemo: false,
});
const serializedApplicationRecord = {
  ...applicationRecord,
  appliedAt: applicationRecord.appliedAt.toISOString(),
  createdAt: applicationRecord.createdAt.toISOString(),
  updatedAt: applicationRecord.updatedAt.toISOString(),
};

describe('applications routes', () => {
  beforeEach(() => {
    createApplication.mockReset();
    deleteApplication.mockReset();
    getApplicationById.mockReset();
    getApplicationsList.mockReset();
    resetDemoApplications.mockReset();
    updateApplication.mockReset();
  });

  it('returns the authenticated user application list', async () => {
    getApplicationsList.mockResolvedValue([applicationRecord]);

    const response = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ applicationsList: [serializedApplicationRecord] });
  });

  it('creates an application with valid payload', async () => {
    createApplication.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(applicationInput);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Application created successfully' });
  });

  it('rejects invalid application payloads', async () => {
    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...applicationInput, company: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid application data');
  });

  it('returns a single application for a valid id', async () => {
    getApplicationById.mockResolvedValue(applicationRecord);

    const response = await request(app)
      .get('/api/applications/application-1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ application: serializedApplicationRecord });
  });

  it('maps not-found application errors to 404', async () => {
    getApplicationById.mockRejectedValue(new AppError('Application not found', 404));

    const response = await request(app)
      .get('/api/applications/missing-id')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Application not found' });
  });

  it('updates an application when the payload is valid', async () => {
    updateApplication.mockResolvedValue(undefined);

    const response = await request(app)
      .put('/api/applications/application-1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(applicationInput);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Application updated successfully' });
  });

  it('deletes an application by id', async () => {
    deleteApplication.mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/applications/application-1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Application deleted successfully' });
  });

  it('resets demo applications for authenticated demo users', async () => {
    resetDemoApplications.mockResolvedValue(undefined);
    const demoAccessToken = generateAccessToken({
      userId: 'demo-user',
      email: 'demo@example.com',
      isDemo: true,
    });

    const response = await request(app)
      .post('/api/applications/demo-reset')
      .set('Authorization', `Bearer ${demoAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Demo data restored successfully' });
  });

  it('rejects application routes without an access token', async () => {
    const response = await request(app).get('/api/applications');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Missing authorization header' });
  });
});
