'use client';

import React from 'react';
import { buildOAuthLoginUrl, getTenantId } from '@/utils/api';

type Props = {
  connectorId: 'jira' | 'confluence';
  className?: string;
  label?: string;
};

// PUBLIC_INTERFACE
export default function ConnectButton({ connectorId, className, label }: Props) {
  /** Button that starts OAuth login flow by redirecting to backend login endpoint. */
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onClick = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const tenantId = getTenantId();
      const url = buildOAuthLoginUrl(connectorId, tenantId);
      // Navigate to backend OAuth login (server will redirect to provider, then back to our callback)
      window.location.assign(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start OAuth flow';
      setError(msg);
      setLoading(false);
    }
  }, [connectorId]);

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={loading}
        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        aria-busy={loading}
      >
        {loading ? 'Redirecting...' : (label || 'Connect')}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
