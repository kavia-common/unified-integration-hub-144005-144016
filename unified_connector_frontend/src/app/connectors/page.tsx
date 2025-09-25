'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ConnectorCard from '@/components/integrations/ConnectorCard';
import { CONNECTORS } from '@/connectors';
import { getConnectors } from '@/utils/api';

// PUBLIC_INTERFACE
function ConnectorsPageInner() {
  /**
   * Displays available connectors (Jira, Confluence) and their connection state.
   * Loads connection status from backend and shows success/error/loading messages.
   */
  const qs = useSearchParams();
  const [connectedFlags, setConnectedFlags] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getConnectors()
      .then((data) => {
        if (cancelled) return;
        // Basic mapping: assume backend returns an array of connectors with id and connected fields if available.
        const map: Record<string, boolean> = {};
        if (Array.isArray(data)) {
          data.forEach((c) => {
            if (c && typeof c === 'object' && 'id' in c) {
              const id = String((c as { id: string }).id);
              const connected = Boolean((c as { connected?: boolean }).connected);
              map[id] = connected;
            }
          });
        }
        setConnectedFlags(map);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Failed to load connectors';
        setError(msg);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recentlyConnected = qs.get('connected') === '1';
  const connectorParam = qs.get('connector');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connectors</h1>
        <p className="text-gray-600">Manage integrations like JIRA and Confluence.</p>
        {recentlyConnected && connectorParam && (
          <div className="mt-3 rounded-md bg-green-50 p-3 text-green-700">
            Successfully connected {connectorParam}.
          </div>
        )}
        {error && <div className="mt-3 rounded-md bg-red-50 p-3 text-red-700">{error}</div>}
      </div>

      {loading ? (
        <div className="rounded-md border bg-white p-4">Loading connectors...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {CONNECTORS.map((c) => (
            <ConnectorCard
              key={c.id}
              connectorId={c.id}
              title={c.name}
              description={c.description}
              connected={connectedFlags[c.id]}
              onStatusChange={(isConnected) =>
                setConnectedFlags((prev) => ({ ...prev, [c.id]: isConnected }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConnectorsPage() {
  return (
    <React.Suspense fallback={<div className="rounded-md border bg-white p-4">Loading...</div>}>
      <ConnectorsPageInner />
    </React.Suspense>
  );
}
