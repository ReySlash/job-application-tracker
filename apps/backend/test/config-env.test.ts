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

  it('uses a single frontend origin by default', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      FRONTEND_URL: 'https://frontend.example.com',
    };

    const { env } = await importEnvModule();

    expect(env.frontendUrls).toEqual(['https://frontend.example.com']);
    expect(env.frontendUrl).toBe('https://frontend.example.com');
  });

  it('uses the first frontend origin when FRONTEND_URL contains multiple comma-separated values', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      FRONTEND_URL: 'https://app.example.com, https://staging.example.com',
    };

    const { env } = await importEnvModule();

    expect(env.frontendUrls).toEqual(['https://app.example.com', 'https://staging.example.com']);
    expect(env.frontendUrl).toBe('https://app.example.com');
  });
});
