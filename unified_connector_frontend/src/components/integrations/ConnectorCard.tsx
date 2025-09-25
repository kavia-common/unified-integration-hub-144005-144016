'use client';

import React from 'react';
import ConnectButton from './ConnectButton';
import { disconnectConnector } from '@/utils/api';
import { fetchConnectorStatus, ConnectorStatus } from '@/utils/status';

type Props = {
  connectorId: 'jira' | 'confluence';
  title: string;
  description?: string;
  connected?: boolean;
  onStatusChange?: (connected: boolean) => void;
};

// PUBLIC_INTERFACE
export default function ConnectorCard({ connectorId, title, description, connected, onStatusChange }: Props) {
  /** Card displaying one connector with Connect/Disconnect actions and state. */
  const [isConnected, setIsConnected] = React.useState<boolean>(!!connected);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ConnectorStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = React.useState<boolean>(false);

  const loadStatus = React.useCallback(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const s = await fetchConnectorStatus(connectorId);
      setStatus(s);
      setIsConnected(Boolean(s.connected));
      onStatusChange?.(Boolean(s.connected));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load status';
      setError(msg);
    } finally {
      setLoadingStatus(false);
    }
  }, [connectorId, onStatusChange]);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleDisconnect = async () => {
    setError(null);
    setBusy(true);
    try {
      await disconnectConnector(connectorId);
      setIsConnected(false);
      onStatusChange?.(false);
      // Reload status after disconnect
      await loadStatus();
    } catch (e: unknown) {
      let msg = 'Failed to disconnect';
      if (e && typeof e === 'object' && 'message' in e) {
        msg = String((e as { message?: string }).message) || msg;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const statusPill = (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 ${
        isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}
      aria-busy={loadingStatus}
      title={
        status?.last_refresh ? `Last refresh: ${status.last_refresh}` : isConnected ? 'Connected' : 'Disconnected'
      }
    >
      {loadingStatus ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
    </span>
  );

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          {status?.last_refresh && (
            <p className="text-xs text-gray-500 mt-1">Last refresh: {status.last_refresh}</p>
          )}
        </div>
        <div className="text-sm">{statusPill}</div>
      </div>

      {status?.metadata && Object.keys(status.metadata).length > 0 && (
        <div className="mt-3 rounded border bg-gray-50 p-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Metadata</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(status.metadata).slice(0, 6).map(([k, v]) => (
              <div key={k} className="text-xs text-gray-700 truncate">
                <span className="font-medium">{k}:</span> <span title={String(v)}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status?.error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {status.error}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        {isConnected ? (
          <>
            <button
              onClick={handleDisconnect}
              disabled={busy}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? 'Disconnecting...' : 'Disconnect'}
            </button>
            <button
              onClick={() => void loadStatus()}
              disabled={loadingStatus}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              {loadingStatus ? 'Refreshing...' : 'Refresh status'}
            </button>
          </>
        ) : (
          <ConnectButton connectorId={connectorId} />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
