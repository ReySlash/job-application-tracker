import { describe, expect, it } from 'vitest';
import { parseApiResponse } from './http';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('parseApiResponse', () => {
  it('returns parsed JSON for successful responses', async () => {
    await expect(parseApiResponse<{ ok: boolean }>(jsonResponse({ ok: true }), 'fallback')).resolves.toEqual({
      ok: true,
    });
  });

  it('prefers the first matching error key from the payload', async () => {
    await expect(
      parseApiResponse(jsonResponse({ message: 'Message error', error: 'Error field' }, { status: 500 }), 'fallback', [
        'message',
        'error',
      ]),
    ).rejects.toThrow('Message error');
  });

  it('uses the fallback when the response body has no error text', async () => {
    await expect(parseApiResponse(jsonResponse({}, { status: 500 }), 'fallback')).rejects.toThrow('fallback');
    await expect(parseApiResponse(new Response(null, { status: 500 }), 'empty fallback')).rejects.toThrow(
      'empty fallback',
    );
  });
});
