import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startDemoUserCleanupScheduler } from '../src/demo/demo-cleanup-scheduler.js';

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('demo cleanup scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs cleanup immediately on startup', async () => {
    const cleanup = vi.fn().mockResolvedValue(2);
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const scheduler = startDemoUserCleanupScheduler(cleanup);
    await vi.runAllTicks();
    await Promise.resolve();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith('Demo user cleanup completed', {
      deletedCount: 2,
    });

    scheduler.stop();
  });

  it('runs cleanup again after one hour', async () => {
    const cleanup = vi.fn().mockResolvedValue(1);

    const scheduler = startDemoUserCleanupScheduler(cleanup);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(cleanup).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('skips overlapping cleanup runs', async () => {
    const firstRun = createDeferred<number>();
    const cleanup = vi
      .fn<() => Promise<number>>()
      .mockImplementationOnce(() => firstRun.promise)
      .mockResolvedValueOnce(1);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const scheduler = startDemoUserCleanupScheduler(cleanup);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Skipping demo user cleanup because a previous run is still in progress',
    );

    firstRun.resolve(3);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(cleanup).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('logs cleanup failures without throwing', async () => {
    const cleanup = vi.fn().mockRejectedValue(new Error('db unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const scheduler = startDemoUserCleanupScheduler(cleanup);
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith('Demo user cleanup failed', expect.any(Error));

    scheduler.stop();
  });
});
