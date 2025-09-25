/**
 * Environment card that optionally allows viewing/setting tenant id locally.
 * If EnvCard already existed elsewhere, this file will serve as the actual component implementation.
 */
'use client';

import React from 'react';
import { getTenantId, setTenantId } from '@/utils/api';

export type ConnectorMeta = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  apiMasked?: string;
  lastSynced?: string;
  errorText?: string | null;
  actions?: Array<{ label: string; variant: 'primary' | 'outline' | 'danger' | 'cta'; onClick: () => void }>;
};

type EnvCardProps = {
  title?: string;
  onRefresh?: () => void;
  connectors?: ConnectorMeta[];
  loading?: boolean;
  error?: string | null;
};

export default function EnvCard({ title = 'Environment', onRefresh, connectors = [], loading, error }: EnvCardProps) {
  const [tenant, setTenant] = React.useState<string>('');

  React.useEffect(() => {
    const t = getTenantId();
    if (t) setTenant(t);
  }, []);

  const onSave = () => {
    if (tenant.trim().length > 0) {
      setTenantId(tenant.trim());
      alert('Tenant ID saved locally.');
    } else {
      alert('Please enter a tenant id value.');
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set a Tenant ID for API requests (added to x-tenant-id header).
          </p>
        </div>
        {onRefresh && (
          <button
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            onClick={onRefresh}
          >
            Refresh
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="tenant-123"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
        />
        <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={onSave}>
          Save
        </button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-800">Connectors</h4>
        {loading && <div className="mt-2 rounded border bg-white p-2 text-xs text-gray-600">Loading connector status...</div>}
        {error && <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</div>}
        {connectors.length > 0 && (
          <ul className="mt-2 space-y-2">
            {connectors.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.apiMasked ? `API: ${c.apiMasked}` : 'No API key'}
                    {c.lastSynced ? ` • Last synced: ${c.lastSynced}` : ''}
                  </p>
                  {c.status === 'error' && c.errorText && (
                    <p className="text-xs text-red-600 mt-1 line-clamp-2">{c.errorText}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      c.status === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.actions?.map((a) => (
                    <button
                      key={a.label}
                      onClick={a.onClick}
                      className={`px-2 py-1 text-xs rounded ${
                        a.variant === 'primary'
                          ? 'bg-blue-600 text-white'
                          : a.variant === 'danger'
                          ? 'bg-red-600 text-white'
                          : a.variant === 'cta'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
