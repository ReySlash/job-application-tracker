import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.gmailUser || !env.gmailAppPassword) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD are required');
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.gmailUser,
        pass: env.gmailAppPassword,
      },
    });
  }

  return cachedTransporter;
}

export function getEmailConfigurationSummary() {
  return {
    gmailUserConfigured: Boolean(env.gmailUser),
    gmailAppPasswordConfigured: Boolean(env.gmailAppPassword),
    emailFrom: env.emailFrom ?? env.gmailUser ?? null,
    backendUrl: env.backendUrl,
    frontendVerifyEmailUrl: env.frontendVerifyEmailUrl,
    frontendResetPasswordUrl: env.frontendResetPasswordUrl,
  };
}

export async function verifyEmailTransport() {
  await getTransporter().verify();
}

export async function sendEmail(options: SendEmailOptions) {
  await getTransporter().sendMail({
    from: env.emailFrom ?? env.gmailUser,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
