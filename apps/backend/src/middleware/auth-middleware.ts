import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../lib/tokens.js';


// Middleware to require authentication for protected routes
export const requireAuth: RequestHandler = (req, res, next) => {
  const authorizationHeader = req.header('authorization');

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  // Expecting header format: "Bearer <token>"
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  // Verify the access token and attach user info to the request object
  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      isDemo: payload.isDemo,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }

    return res.status(401).json({ error: 'Invalid access token' });
  }
};
