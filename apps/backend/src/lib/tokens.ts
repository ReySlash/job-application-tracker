import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Define the payload structure for the access token
type AuthUserPayload = {
  userId: string;
  email: string;
  isDemo: boolean;
};

// Function to generate an access token
export function generateAccessToken(payload: AuthUserPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.accessTokenTtlSeconds,
  });
}

// Function to generate a secure random refresh token
export function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Function to hash the refresh token before storing it in the database
export function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
