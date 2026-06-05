import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function importEnvModule() {
  vi.resetModules();
  return import('../src/config/env.js');
}

describe('config env', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it('derives frontend reset and verify URLs from a single frontend origin by default', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      FRONTEND_URL: 'https://frontend.example.com',
    };
    delete process.env.FRONTEND_RESET_PASSWORD_URL;
    delete process.env.FRONTEND_VERIFY_EMAIL_URL;

    const { env } = await importEnvModule();

    expect(env.frontendUrls).toEqual(['https://frontend.example.com']);
    expect(env.frontendResetPasswordUrl).toBe('https://frontend.example.com/reset-password');
    expect(env.frontendVerifyEmailUrl).toBe('https://frontend.example.com/verify-email');
  });

  it('uses the first frontend origin when FRONTEND_URL contains multiple comma-separated values', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      FRONTEND_URL: 'https://app.example.com, https://staging.example.com',
    };
    delete process.env.FRONTEND_RESET_PASSWORD_URL;
    delete process.env.FRONTEND_VERIFY_EMAIL_URL;

    const { env } = await importEnvModule();

    expect(env.frontendUrls).toEqual(['https://app.example.com', 'https://staging.example.com']);
    expect(env.frontendResetPasswordUrl).toBe('https://app.example.com/reset-password');
    expect(env.frontendVerifyEmailUrl).toBe('https://app.example.com/verify-email');
  });
});
