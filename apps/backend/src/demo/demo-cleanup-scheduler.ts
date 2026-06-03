import { cleanupExpiredDemoUsers } from './demo-services.js';

const DEMO_USER_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

type CleanupFn = () => Promise<number | void>;

export function startDemoUserCleanupScheduler(cleanup: CleanupFn = cleanupExpiredDemoUsers) {
  let isRunning = false;

  const runCleanup = async () => {
    if (isRunning) {
      console.warn('Skipping demo user cleanup because a previous run is still in progress');
      return;
    }

    isRunning = true;

    try {
      const deletedCount = await cleanup();
      console.info('Demo user cleanup completed', {
        deletedCount: deletedCount ?? 0,
      });
    } catch (error) {
      console.error('Demo user cleanup failed', error);
    } finally {
      isRunning = false;
    }
  };

  void runCleanup();

  const interval = setInterval(() => {
    void runCleanup();
  }, DEMO_USER_CLEANUP_INTERVAL_MS);

  interval.unref?.();

  return {
    stop() {
      clearInterval(interval);
    },
  };
}
