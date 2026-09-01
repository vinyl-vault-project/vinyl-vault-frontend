const API_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  status: number;
  fields: Record<string, string[]>;
  constructor(
    status: number,
    fields: Record<string, string[]>,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

type TokenReader = () => string | null;
type RefreshHandler = () => Promise<boolean>;
let tokenReader: TokenReader = () => null;
let refreshHandler: RefreshHandler | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function configureApiAuth(
  getAccessToken: TokenReader,
  refresh: RefreshHandler,
) {
  tokenReader = getAccessToken;
  refreshHandler = refresh;
}
function getBaseUrl() {
  if (!API_URL) throw new Error('VITE_API_URL is not configured');
  if (API_URL.startsWith('/')) {
    if (import.meta.env.PROD) {
      throw new Error('VITE_API_URL must be an HTTPS URL in production');
    }
    return API_URL.replace(/\/$/, '');
  }
  const url = new URL(API_URL);
  if (import.meta.env.PROD && url.protocol !== 'https:') {
    throw new Error('VITE_API_URL must use HTTPS in production');
  }
  return url.toString().replace(/\/$/, '');
}
function toFields(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      Array.isArray(item) ? item.map(String) : [String(item)],
    ]),
  );
}
async function request<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  if (!path.startsWith('/')) {
    throw new Error('API paths must start with a slash');
  }
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  const token = tokenReader();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(
    () => timeoutController.abort(),
    REQUEST_TIMEOUT_MS,
  );
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutController.signal])
    : timeoutController.signal;
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers,
      signal,
    });
  } catch (error) {
    if (timeoutController.signal.aborted) {
      throw new Error('The request timed out. Please try again.', {
        cause: error,
      });
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
  if (
    response.status === 401 &&
    !retried &&
    refreshHandler &&
    shouldRefreshSession(path)
  ) {
    refreshPromise ??= refreshHandler().finally(() => {
      refreshPromise = null;
    });
    if (await refreshPromise) return request<T>(path, init, true);
  }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') ?? '';
  const payload: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const fields = toFields(payload);
    const message =
      fields.detail?.[0] ??
      fields.non_field_errors?.[0] ??
      `Request failed (${response.status})`;
    throw new ApiError(response.status, fields, message);
  }
  return payload as T;
}
function shouldRefreshSession(path: string) {
  return ![
    '/auth/login/',
    '/auth/register/',
    '/auth/logout/',
    '/auth/token/refresh/',
  ].includes(path);
}
export function apiGet<T>(path: string, init?: RequestInit) {
  return request<T>(path, init);
}
export function apiPost<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
export function apiPatch<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}
export function apiDelete(path: string) {
  return request<void>(path, { method: 'DELETE' });
}
export interface HealthStatus {
  status: string;
}
export function getHealthStatus() {
  return apiGet<HealthStatus>('/health/');
}
