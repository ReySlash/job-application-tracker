import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let cachedAuth: ReturnType<typeof getAuth> | null = null;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  const missingKeys = [
    !apiKey && 'VITE_FIREBASE_API_KEY',
    !authDomain && 'VITE_FIREBASE_AUTH_DOMAIN',
    !projectId && 'VITE_FIREBASE_PROJECT_ID',
    !appId && 'VITE_FIREBASE_APP_ID',
  ].filter(Boolean);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase frontend configuration: ${missingKeys.join(', ')}`);
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
  };
}

export function getFirebaseAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(initializeApp(getFirebaseConfig()));
  return cachedAuth;
}
