/**
 * API utilities for communicating with the backend.
 * This centralizes base URL resolution and tenant-aware headers.
 */

export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export type ApiOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  // Use this to pass tenant id explicitly. If not provided, will try localStorage.
  tenantId?: string | null;
  // Set to true for JSON body and response handling
  json?: boolean;
  // Optional AbortSignal
  signal?: AbortSignal;
};

// PUBLIC_INTERFACE
export function getTenantId(): string | null {
  /** Returns the current tenant id from localStorage if available. */
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('x-tenant-id');
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setTenantId(id: string) {
  /** Persists the tenant id in localStorage for subsequent API calls. */
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('x-tenant-id', id);
  } catch {
    // ignore
  }
}

function getBaseUrl() {
  // Prefer NEXT_PUBLIC_BACKEND_URL if provided; else try relative path proxy (/api backend)
  // It's recommended to provide NEXT_PUBLIC_BACKEND_URL via env.
  const env = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (env) return env.replace(/\/+$/, '');
  return ''; // relative
}

// PUBLIC_INTERFACE
export type ApiError = Error & { status?: number; payload?: unknown };

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  /**
   * Generic fetch wrapper that attaches tenant-aware headers and JSON handling.
   * Throws an error for non-2xx responses.
   */
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers: Record<string, string> = {
    ...(opts.json ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers || {}),
  };

  const tenant = opts.tenantId ?? getTenantId();
  if (tenant) headers['x-tenant-id'] = tenant;

  // Prepare body with proper type for fetch
  let fetchBody: BodyInit | null | undefined = undefined;
  if (typeof opts.body !== 'undefined' && opts.body !== null) {
    if (opts.json) {
      fetchBody = JSON.stringify(opts.body);
    } else if (
      typeof opts.body === 'string' ||
      opts.body instanceof Blob ||
      opts.body instanceof ArrayBuffer ||
      ArrayBuffer.isView(opts.body) ||
      opts.body instanceof FormData ||
      opts.body instanceof URLSearchParams ||
      // @ts-expect-error ReadableStream is available in DOM lib
      opts.body instanceof ReadableStream
    ) {
      fetchBody = opts.body as unknown as BodyInit;
    } else {
      // If unknown non-JSON body, coerce to string as a safe fallback
      fetchBody = String(opts.body);
    }
  }

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: fetchBody,
    signal: opts.signal,
    redirect: 'follow',
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const errPayload: unknown = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
    const error = new Error(`API error: ${res.status}`) as ApiError;
    error.status = res.status;
    error.payload = errPayload;
    throw error;
  }

  if (isJson) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

// PUBLIC_INTERFACE
export function buildOAuthLoginUrl(connectorId: string, tenantId?: string | null, redirectTo?: string) {
  /**
   * Returns the backend OAuth login URL that the browser should navigate to.
   * We cannot set headers via location.href, so for tenant identification we append query param and rely on backend to read it
   * OR we recommend backend to accept header-less tenant via query; if not supported, proxy route might be needed.
   * Given OpenAPI allows x-tenant-id as header only, we will keep tenant in localStorage and backend state will be preserved via generated state.
   * We do include redirect_to param to ensure backend returns to our callback page.
   */
  const base = getBaseUrl();
  const callback = redirectTo || getDefaultCallbackUrl(connectorId);
  // Note: backend supports redirect_to query param per OpenAPI
  const url = new URL(`${base}/connectors/${connectorId}/oauth/login`);
  url.searchParams.set('redirect_to', callback);
  return url.toString();
}

// PUBLIC_INTERFACE
export function getDefaultCallbackUrl(connectorId: string) {
  /** Builds the default OAuth callback URL on the frontend for a specific connector. */
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return `${origin}/oauth/callback?connector_id=${encodeURIComponent(connectorId)}`;
}

// PUBLIC_INTERFACE
export type OAuthCallbackResponse = Record<string, unknown>;

export async function completeOAuthCallback(connectorId: string, code: string, state?: string | null): Promise<OAuthCallbackResponse> {
  /**
   * Calls the backend OAuth callback endpoint with code and optional state.
   * Returns backend response. Attaches x-tenant-id header if available.
   */
  const qp = new URLSearchParams({ code });
  if (state) qp.set('state', state);

  return apiFetch<OAuthCallbackResponse>(`/connectors/${encodeURIComponent(connectorId)}/oauth/callback?${qp.toString()}`, {
    method: 'GET',
    json: true,
  });
}

// PUBLIC_INTERFACE
export async function disconnectConnector(connectorId: string): Promise<void> {
  /**
   * Disconnects a connector and removes credentials.
   * Based on OpenAPI there is a POST /connectors/{connector_id}/disconnect (stub).
   * The task description mentions DELETE /connectors/{id}/connection; to support both, we attempt DELETE then fallback to POST.
   */
  // Try DELETE /connection
  try {
    await apiFetch(`/connectors/${encodeURIComponent(connectorId)}/connection`, {
      method: 'DELETE',
      json: true,
    });
    return;
  } catch (e: unknown) {
    // Fallback to POST /disconnect per backend spec
    if (e && typeof e === 'object' && 'status' in e) {
      const status = Number((e as { status?: number }).status ?? 0);
      if (status && status !== 404) {
        // If not found, try fallback. If other error, rethrow.
        throw e;
      }
    }
  }

  await apiFetch(`/connectors/${encodeURIComponent(connectorId)}/disconnect`, {
    method: 'POST',
    json: true,
  });
}

// PUBLIC_INTERFACE
export type ConnectorListItem = {
  id: string;
  connected?: boolean;
  [k: string]: unknown;
};

export async function getConnectors(): Promise<ConnectorListItem[] | unknown> {
  /** Fetches the list of connectors for dashboard. */
  return apiFetch<ConnectorListItem[] | unknown>('/connectors', { method: 'GET', json: true });
}

// PUBLIC_INTERFACE
export async function searchConnector(connectorId: string, q: string): Promise<unknown> {
  /** Search via connector. */
  const qp = new URLSearchParams({ q });
  return apiFetch<unknown>(`/connectors/${encodeURIComponent(connectorId)}/search?${qp.toString()}`, {
    method: 'GET',
    json: true,
  });
}

// PUBLIC_INTERFACE
export async function connectWithStoredCredentials(connectorId: string): Promise<unknown> {
  /** Attempts to connect using stored credentials (stubbed in backend). */
  return apiFetch<unknown>(`/connectors/${encodeURIComponent(connectorId)}/connect`, {
    method: 'POST',
    json: true,
  });
}
