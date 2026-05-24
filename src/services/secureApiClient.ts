import { SECURITY_CONFIG } from '../config/security';
import { recordClientAudit } from '../security/auditClient';
import { buildSignedHeaders, signRequestPayload } from '../security/payloadIntegrity';
import { secureLogger } from '../security/secureLogger';
import { RateLimiter } from '../utils/validation';
import { ApiError, getPublicErrorMessage, retryWithBackoff } from '../utils/errorHandler';
import { authService } from './authService';

const rateLimiter = new RateLimiter(30, 60000);

function assertSecureUrl(url: string) {
  const ok = url.startsWith('https://') || url.includes('localhost') || url.includes('127.0.0.1');
  if (!ok) throw new ApiError('Use HTTPS em produção', 403, 'INSECURE_URL');
}

export async function secureRequest<T>(
  path: string,
  config: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    requiresAuth?: boolean;
    signPayload?: boolean;
    retries?: number;
  } = {}
): Promise<T> {
  const method = config.method ?? 'GET';
  const requiresAuth = config.requiresAuth ?? true;
  const signPayload = config.signPayload ?? method !== 'GET';
  const url = `${SECURITY_CONFIG.apiBaseUrl}${path}`;
  assertSecureUrl(url);

  if (!rateLimiter.isAllowed(`${method}:${path}`)) {
    throw new ApiError(getPublicErrorMessage(429), 429, 'CLIENT_RATE_LIMIT');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    let token = await authService.getAccessToken();
    if (!token) token = await authService.refreshAccessToken();
    if (!token) throw new ApiError(getPublicErrorMessage(401), 401, 'UNAUTHORIZED');
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: string | undefined;
  if (signPayload && method !== 'GET') {
    const signed = await signRequestPayload(config.body ?? {});
    Object.assign(headers, buildSignedHeaders(signed.signature, signed.timestamp));
    requestBody = signed.serialized;
  } else if (method !== 'GET') {
    requestBody = JSON.stringify(config.body ?? {});
  }

  const run = async () => {
    const res = await fetch(url, { method, headers, body: method === 'GET' ? undefined : requestBody });
    if (res.status === 401 && requiresAuth) {
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${refreshed}`;
        const retry = await fetch(url, { method, headers, body: method === 'GET' ? undefined : requestBody });
        if (!retry.ok) throw new ApiError(getPublicErrorMessage(retry.status), retry.status);
        return (await retry.json()) as T;
      }
    }
    if (!res.ok) {
      recordClientAudit('auth_failure', { path, status: res.status });
      throw new ApiError(getPublicErrorMessage(res.status), res.status);
    }
    return (await res.json()) as T;
  };

  try {
    return await retryWithBackoff(run, config.retries ?? 2);
  } catch (error) {
    secureLogger.error('secure_request_failed', { path, method });
    throw error;
  }
}
