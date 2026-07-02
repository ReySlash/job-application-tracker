type ApiErrorPayload = {
  error?: string;
  message?: string;
};

type ErrorKey = keyof ApiErrorPayload;

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
  errorKeys: ErrorKey[] = ['error', 'message'],
): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T | ApiErrorPayload) : null;

  if (!response.ok) {
    const errorMessage = getErrorMessage(payload as Record<string, unknown> | null, errorKeys) ?? fallbackMessage;
    throw new Error(errorMessage);
  }

  return payload as T;
}

function getErrorMessage(payload: Record<string, unknown> | null, errorKeys: ErrorKey[]) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  for (const key of errorKeys) {
    const value = payload[key];

    if (typeof value === 'string' && value) {
      return value;
    }
  }

  return null;
}
