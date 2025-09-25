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
   * Backend OpenAPI does not declare a status endpoint; infer from /connectors list.
   * Keep a defensive attempt for a possible future /status endpoint without breaking.
   */
  // Try direct status endpoint first (non-fatal if missing)
  try {
    const data = await apiFetch<Partial<ConnectorStatus>>(`/connectors/${encodeURIComponent(connectorId)}/status`, {
      method: 'GET',
    });
    return {
      connectorId,
      connected: Boolean(data?.connected),
      last_refresh: data?.last_refresh ?? null,
      metadata: data?.metadata ?? {},
      error: data?.error ?? null,
    };
  } catch {
    // ignore and fallback to list
  }

  // Fallback: fetch list and infer
  const list = await apiFetch<unknown>(`/connectors`, { method: 'GET' });

  type ConnectorListShape = { id?: unknown; connected?: unknown; last_refresh?: unknown; metadata?: unknown };
  const isConnector = (it: unknown): it is ConnectorListShape =>
    !!it && typeof it === 'object' && 'id' in (it as Record<string, unknown>);

  // Support either array response or { connectors: [] }
  let connectorsArr: unknown = list;
  if (!Array.isArray(list) && list && typeof list === 'object' && 'connectors' in (list as Record<string, unknown>)) {
    connectorsArr = (list as Record<string, unknown>)['connectors'];
  }

  let entry: ConnectorListShape | null = null;
  if (Array.isArray(connectorsArr)) {
    entry = (connectorsArr.find((it) => isConnector(it) && String(it.id) === connectorId) as ConnectorListShape) ?? null;
  }

  return {
    connectorId,
    connected: Boolean(entry?.connected),
    last_refresh: (entry?.last_refresh as string | null) ?? null,
    metadata: (entry?.metadata as Record<string, unknown> | undefined) ?? {},
    error: null,
  };
}

/**
 * PUBLIC_INTERFACE
 * Fetch status for multiple connectors and return a keyed map.
 */
export async function fetchAllConnectorStatuses(connectorIds: string[]): Promise<ConnectorStatusMap> {
  const map: ConnectorStatusMap = {};
  // Try to get all from list at once
  try {
    const list = await apiFetch<unknown>(`/connectors`, { method: 'GET' });

    // Normalize to array
    let connectorsArr: unknown = list;
    if (!Array.isArray(list) && list && typeof list === 'object' && 'connectors' in (list as Record<string, unknown>)) {
      connectorsArr = (list as Record<string, unknown>)['connectors'];
    }

    if (Array.isArray(connectorsArr)) {
      type ConnectorListShape = { id?: unknown; connected?: unknown; last_refresh?: unknown; metadata?: unknown };
      const isConnector = (it: unknown): it is ConnectorListShape =>
        !!it && typeof it === 'object' && 'id' in (it as Record<string, unknown>);
      for (const cid of connectorIds) {
        const entry =
          (connectorsArr.find((it) => isConnector(it) && String(it.id) === cid) as ConnectorListShape | undefined) ??
          null;
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
    // ignore and fallback
  }

  // Fallback: fetch per-connector
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
