'use client';

import { apiFetch } from './api';

export type ConnectorStatus = {
  connectorId: string;
  connected: boolean;
  last_refresh?: string | null;
  metadata?: Record<string, unknown>;
  error?: string | null;
};

export type ConnectorStatusMap = Record<string, ConnectorStatus>;

/**
 * PUBLIC_INTERFACE
 * Fetch status for a single connector by id.
 */
export async function fetchConnectorStatus(connectorId: string): Promise<ConnectorStatus> {
  /**
   * This calls a conventional status endpoint if present; if not, it will try to infer from list endpoint.
   * Backend openapi doesn't explicitly provide status endpoint, so we first try `/connectors` to get `connected`
   * and then map minimal info. If backend later adds `/connectors/{id}/status`, we can switch here without touching UI.
   */
  // Try a direct status path first (best practice, may exist on backend)
  try {
    const data = await apiFetch<ConnectorStatus>(`/connectors/${encodeURIComponent(connectorId)}/status`, {
      method: 'GET',
      json: true,
    });
    return {
      connectorId,
      connected: Boolean(data?.connected),
      last_refresh: data?.last_refresh ?? null,
      metadata: data?.metadata ?? {},
      error: data?.error ?? null,
    };
  } catch {
    // Fallback: fetch list and infer
    const list = await apiFetch<unknown>(`/connectors`, { method: 'GET', json: true });

    type ConnectorListShape = { id?: unknown; connected?: unknown; last_refresh?: unknown; metadata?: unknown };
    const isConnector = (it: unknown): it is ConnectorListShape =>
      !!it && typeof it === 'object' && 'id' in (it as Record<string, unknown>);

    let entry: ConnectorListShape | null = null;
    if (Array.isArray(list)) {
      entry = (list.find((it) => isConnector(it) && String(it.id) === connectorId) as ConnectorListShape) ?? null;
    }
    return {
      connectorId,
      connected: Boolean(entry?.connected),
      last_refresh: (entry?.last_refresh as string | null) ?? null,
      metadata: (entry?.metadata as Record<string, unknown> | undefined) ?? {},
      error: null,
    };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch status for multiple connectors and return a keyed map.
 */
export async function fetchAllConnectorStatuses(connectorIds: string[]): Promise<ConnectorStatusMap> {
  const map: ConnectorStatusMap = {};
  // If we can get all from list at once, prefer it:
  try {
    const list = await apiFetch<unknown>(`/connectors`, { method: 'GET', json: true });
    if (Array.isArray(list)) {
      type ConnectorListShape = { id?: unknown; connected?: unknown; last_refresh?: unknown; metadata?: unknown };
      const isConnector = (it: unknown): it is ConnectorListShape =>
        !!it && typeof it === 'object' && 'id' in (it as Record<string, unknown>);
      for (const cid of connectorIds) {
        const entry = (list.find((it) => isConnector(it) && String(it.id) === cid) as ConnectorListShape | undefined) ?? null;
        map[cid] = {
          connectorId: cid,
          connected: Boolean(entry?.connected),
          last_refresh: (entry?.last_refresh as string | null) ?? null,
          metadata: (entry?.metadata as Record<string, unknown> | undefined) ?? {},
          error: null,
        };
      }
      return map;
    }
  } catch {
    // ignore and fallback to per-connector calls
  }

  // Fallback: serial fetch status per connector
  for (const cid of connectorIds) {
    try {
      map[cid] = await fetchConnectorStatus(cid);
    } catch (e) {
      map[cid] = {
        connectorId: cid,
        connected: false,
        last_refresh: null,
        metadata: {},
        error: e instanceof Error ? e.message : 'Failed to fetch status',
      };
    }
  }
  return map;
}
