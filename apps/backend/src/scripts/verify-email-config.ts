import '../load-env.js';

import { env } from '../config/env.js';
import { getEmailConfigurationSummary, verifyEmailTransport } from '../lib/email.js';

function getMissingEmailEnvKeys() {
  const requiredKeys = [
    ['GMAIL_USER', env.gmailUser],
    ['GMAIL_APP_PASSWORD', env.gmailAppPassword],
    ['BACKEND_URL', env.backendUrl],
    ['FRONTEND_VERIFY_EMAIL_URL', env.frontendVerifyEmailUrl],
    ['FRONTEND_RESET_PASSWORD_URL', env.frontendResetPasswordUrl],
  ] as const;

  return requiredKeys.filter(([, value]) => !value).map(([key]) => key);
}

async function main() {
  console.info('Email configuration summary', getEmailConfigurationSummary());

  const missingKeys = getMissingEmailEnvKeys();

  if (missingKeys.length > 0) {
    console.error('Missing required email environment values', {
      missingKeys,
    });
    process.exitCode = 1;
    return;
  }

  try {
    await verifyEmailTransport();
    console.info('SMTP transport verification succeeded');
  } catch (error) {
    console.error('SMTP transport verification failed', {
      error,
    });
    process.exitCode = 1;
  }
}

void main();
