'use client';

import React from 'react';
import ConnectButton from './ConnectButton';
import { disconnectConnector } from '@/utils/api';

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

  const handleDisconnect = async () => {
    setError(null);
    setBusy(true);
    try {
      await disconnectConnector(connectorId);
      setIsConnected(false);
      onStatusChange?.(false);
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

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <div className="text-sm">
          <span className={`inline-flex items-center rounded-full px-2 py-1 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={busy}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? 'Disconnecting...' : 'Disconnect'}
          </button>
        ) : (
          <ConnectButton connectorId={connectorId} />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
