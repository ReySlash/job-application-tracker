export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firebaseUid?: string;
        isDemo: boolean;
      };
    }
  }
}
