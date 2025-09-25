"use client";

/**
 * API utility for communicating with the Unified Connector Backend.
 * Reads the backend base URL from NEXT_PUBLIC_BACKEND_URL environment variable.
 * Includes optional tenant header 'x-tenant-id' if provided via next-local storage or param.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  tenantId?: string | null;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
}

const getBackendBaseUrl = (): string => {
  // PUBLIC_INTERFACE
  /** Returns the backend base URL from env. */
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    // Provide a safe default for dev; can be overridden by env.
    return "http://localhost:3001";
  }
  return url.replace(/\/*$/, "");
};

// PUBLIC_INTERFACE
export function buildUrl(path: string, searchParams?: ApiOptions["searchParams"]): string {
  /** Build full URL with query string applied to provided path. */
  const base = getBackendBaseUrl();
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${clean}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/**
 * PUBLIC_INTERFACE
 * Generic API fetch wrapper.
 * - Adds JSON headers
 * - Adds optional tenant header
 * - Serializes body for non-GET methods
 */
export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, tenantId, searchParams } = options;

  const url = buildUrl(path, searchParams);

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (tenantId) {
    finalHeaders["x-tenant-id"] = tenantId;
  }

  const init: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (method !== "GET" && method !== "DELETE") {
    init.body = typeof body === "string" ? body : JSON.stringify(body ?? {});
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      /* ignore parse error */
    }
    const error: Error & { status?: number; detail?: unknown } = new Error(
      `API Error ${res.status} ${res.statusText}`
    );
    error.status = res.status;
    error.detail = detail;
    throw error;
  }

  // Try parse json; allow empty body
  const text = await res.text();
  try {
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  } catch {
    return text as unknown as T;
  }
}

/**
 * PUBLIC_INTERFACE
 * Helper: simple GET
 */
export async function apiGet<T = unknown>(
  path: string,
  tenantId?: string | null,
  searchParams?: ApiOptions["searchParams"]
) {
  return apiFetch<T>(path, { method: "GET", tenantId: tenantId ?? null, searchParams });
}

/**
 * PUBLIC_INTERFACE
 * Helper: simple POST with JSON body
 */
export async function apiPost<T = unknown, B = unknown>(
  path: string,
  body?: B,
  tenantId?: string | null,
  searchParams?: ApiOptions["searchParams"]
) {
  return apiFetch<T>(path, { method: "POST", body, tenantId: tenantId ?? null, searchParams });
}

/**
 * PUBLIC_INTERFACE
 * Backend-specific endpoints grouped under ConnectorApi.
 */
export const ConnectorApi = {
  /** List available connectors (backend may return array or { connectors: [] }) */
  async listConnectors(tenantId?: string | null) {
    const data = await apiFetch<ConnectorSummary[] | { connectors: ConnectorSummary[] }>("/connectors", {
      tenantId: tenantId ?? null,
    });
    if (Array.isArray(data)) return { connectors: data };
    if (data && typeof data === "object" && "connectors" in data) return data as { connectors: ConnectorSummary[] };
    return { connectors: [] };
  },

  /** Request OAuth login URL for a connector */
  async getOAuthLoginUrl(connectorId: string, redirectTo?: string, tenantId?: string | null) {
    return apiFetch<{ auth_url: string }>(`/connectors/${connectorId}/oauth/login`, {
      searchParams: { redirect_to: redirectTo },
      tenantId: tenantId ?? null,
    });
  },

  /** Connect using stored credentials (stub) */
  async connect(connectorId: string, tenantId?: string | null) {
    return apiFetch(`/connectors/${connectorId}/connect`, { method: "POST", tenantId: tenantId ?? null });
  },

  /** Disconnect and remove credentials (stub) */
  async disconnect(connectorId: string, tenantId?: string | null) {
    return apiFetch(`/connectors/${connectorId}/disconnect`, { method: "POST", tenantId: tenantId ?? null });
  },
};

/**
 * PUBLIC_INTERFACE
 * Complete OAuth callback using backend endpoint /connectors/{connector_id}/oauth/callback
 */
export async function completeOAuthCallback(
  connectorId: string,
  code: string,
  state?: string | null,
  tenantId?: string | null
) {
  return apiGet<unknown>(`/connectors/${encodeURIComponent(connectorId)}/oauth/callback`, tenantId ?? null, {
    code,
    state: state ?? undefined,
  });
}

/**
 * PUBLIC_INTERFACE
 * Perform search on a connector via /connectors/{id}/search with pagination/filtering options.
 */
export async function searchConnector(
  connectorId: string,
  q: string,
  options?: {
    resource_type?: string | null;
    page?: number;
    per_page?: number;
    filters?: Record<string, unknown>;
    tenantId?: string | null;
  }
) {
  const { resource_type, page, per_page, filters, tenantId } = options ?? {};
  return apiGet<unknown>(`/connectors/${encodeURIComponent(connectorId)}/search`, tenantId ?? null, {
    q,
    resource_type: resource_type ?? undefined,
    page,
    per_page,
    filters: filters ? JSON.stringify(filters) : undefined,
  });
}

export type ConnectorId = "jira" | "confluence";

export interface ConnectorSummary {
  id: ConnectorId | string;
  name: string;
  description?: string;
  connected?: boolean;
  category?: string;
  icon?: string;
}
