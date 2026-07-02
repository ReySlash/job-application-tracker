import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { getFirebaseAdminAuth } from '../lib/firebase-admin.js';
import { verifyAccessToken } from '../lib/tokens.js';
import { syncFirebaseUser } from '../modules/auth/firebase-auth-service.js';

async function authenticateFirebaseToken(idToken: string) {
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
  const email = decodedToken.email;

  if (!email) {
    throw new Error('Firebase token is missing an email address');
  }

  if (!decodedToken.email_verified) {
    const error = new Error('Verify your email before continuing');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  const user = await syncFirebaseUser({
    uid: decodedToken.uid,
    email,
    emailVerified: decodedToken.email_verified,
  });

  return {
    id: user.id,
    email: user.email,
    firebaseUid: decodedToken.uid,
    isDemo: false,
  };
}

function authenticateLegacyDemoToken(accessToken: string) {
  const payload = verifyAccessToken(accessToken);

  if (!payload.isDemo) {
    throw new jwt.JsonWebTokenError('Only demo sessions can use legacy access tokens');
  }

  return {
    id: payload.userId,
    email: payload.email,
    isDemo: true,
  };
}

function getInvalidTokenResponse(error: unknown) {
  if ((error as { statusCode?: number } | undefined)?.statusCode === 403) {
    return { statusCode: 403, payload: { error: 'Verify your email before continuing' } };
  }

  if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
    return { statusCode: 401, payload: { error: 'Invalid or expired access token' } };
  }

  return { statusCode: 401, payload: { error: 'Invalid access token' } };
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authorizationHeader = req.header('authorization');

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  try {
    req.user = await authenticateFirebaseToken(token);
    return next();
  } catch (firebaseError) {
    try {
      req.user = authenticateLegacyDemoToken(token);
      return next();
    } catch (legacyError) {
      const response = getInvalidTokenResponse(
        (firebaseError as { statusCode?: number } | undefined)?.statusCode === 403
          ? firebaseError
          : legacyError,
      );
      return res.status(response.statusCode).json(response.payload);
    }
  }
};
