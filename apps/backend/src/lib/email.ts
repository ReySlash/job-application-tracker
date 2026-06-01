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
  if (!env.smtpUrl) {
    throw new Error('SMTP_URL is not configured');
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(env.smtpUrl);
  }

  return cachedTransporter;
}

export async function sendEmail(options: SendEmailOptions) {
  if (!env.emailFrom) {
    throw new Error('EMAIL_FROM is not configured');
  }

  await getTransporter().sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}