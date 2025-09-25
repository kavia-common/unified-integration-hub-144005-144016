"use client";

/**
 * PUBLIC_INTERFACE
 * API base URL. Configure via NEXT_PUBLIC_API_BASE; falls back to http://localhost:8000.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/**
 * PUBLIC_INTERFACE
 * apiFetch
 * Wrapper around fetch that attaches JSON headers and optional tenant id.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  tenantId?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (tenantId) headers["x-tenant-id"] = tenantId;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      (detail &&
        typeof detail === "object" &&
        ("message" in (detail as Record<string, unknown>) || "detail" in (detail as Record<string, unknown>))) ?
        String(((detail as { message?: unknown; detail?: unknown }).message ?? (detail as { detail?: unknown }).detail) as unknown) :
      `API error: ${res.status}`;
    throw new Error(message);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * PUBLIC_INTERFACE
 * listConnectors
 */
export async function listConnectors(tenantId?: string | null) {
  return apiFetch(`/connectors`, {}, tenantId ?? undefined);
}

/**
 * PUBLIC_INTERFACE
 * oauthLogin
 */
export async function oauthLogin(connectorId: string, redirectTo?: string, tenantId?: string | null) {
  const q = new URLSearchParams();
  if (redirectTo) q.set("redirect_to", String(redirectTo));
  return apiFetch<{ auth_url: string }>(
    `/connectors/${encodeURIComponent(connectorId)}/oauth/login?${q.toString()}`,
    {},
    tenantId ?? undefined
  );
}

/**
 * PUBLIC_INTERFACE
 * completeOAuthCallback
 */
export async function completeOAuthCallback(
  connectorId: string,
  code: string,
  state?: string | null,
  tenantId?: string | null
) {
  const q = new URLSearchParams();
  q.set("code", code);
  if (state) q.set("state", state);
  return apiFetch(`/connectors/${encodeURIComponent(connectorId)}/oauth/callback?${q.toString()}`, {}, tenantId ?? undefined);
}

/**
 * PUBLIC_INTERFACE
 * searchConnector
 */
export async function searchConnector(connectorId: string, q: string, options?: {
  resource_type?: string | null;
  page?: number;
  per_page?: number;
  filters?: Record<string, unknown>;
  tenantId?: string | null;
}) {
  const qs = new URLSearchParams();
  qs.set("q", q);
  if (options?.resource_type) qs.set("resource_type", options.resource_type);
  if (options?.page) qs.set("page", String(options.page));
  if (options?.per_page) qs.set("per_page", String(options.per_page));
  if (options?.filters) qs.set("filters", JSON.stringify(options.filters));
  return apiFetch(`/connectors/${encodeURIComponent(connectorId)}/search?${qs.toString()}`, {}, options?.tenantId ?? undefined);
}

/**
 * PUBLIC_INTERFACE
 * ConnectorApi: common endpoints to manage connections
 */
export const ConnectorApi = {
  async listConnectors(tenantId?: string | null): Promise<{ connectors: ConnectorSummary[] }> {
    const data = await apiFetch<ConnectorSummary[] | { connectors: ConnectorSummary[] }>(`/connectors`, {}, tenantId ?? undefined);
    if (Array.isArray(data)) {
      return { connectors: data };
    }
    if (data && typeof data === "object" && "connectors" in data) {
      return data as { connectors: ConnectorSummary[] };
    }
    return { connectors: [] };
  },
  async getOAuthLoginUrl(connectorId: string, redirectTo?: string, tenantId?: string | null) {
    return oauthLogin(connectorId, redirectTo, tenantId ?? undefined);
  },
  async connect(connectorId: string, tenantId?: string | null) {
    return apiFetch(`/connectors/${encodeURIComponent(connectorId)}/connect`, { method: "POST" }, tenantId ?? undefined);
  },
  async disconnect(connectorId: string, tenantId?: string | null) {
    return apiFetch(`/connectors/${encodeURIComponent(connectorId)}/disconnect`, { method: "POST" }, tenantId ?? undefined);
  },
  // PUBLIC_INTERFACE
  async rotateKey(connectorId: string, tenantId?: string | null) {
    // Not present in backend OpenAPI; attempt a conventional endpoint and fail gracefully.
    try {
      return await apiFetch(
        `/connectors/${encodeURIComponent(connectorId)}/rotate-key`,
        { method: "POST" },
        tenantId ?? undefined
      );
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in (e as Record<string, unknown>)
          ? String((e as Record<string, unknown>).message)
          : "Rotate key not supported for this connector.";
      throw new Error(msg);
    }
  },
  // PUBLIC_INTERFACE
  async getPortalUrl(connectorId: string, tenantId?: string | null): Promise<{ url?: string }> {
    // No backend spec; try a conventional endpoint for portal link.
    try {
      const res = await apiFetch<{ url?: string }>(
        `/connectors/${encodeURIComponent(connectorId)}/portal`,
        { method: "GET" },
        tenantId ?? undefined
      );
      return res;
    } catch {
      // Fallback: not supported
      return { url: undefined };
    }
  },
};

export type ConnectorSummary = {
  id: string;
  name: string;
  description?: string;
  connected?: boolean;
  category?: string;
  icon?: string;
};
