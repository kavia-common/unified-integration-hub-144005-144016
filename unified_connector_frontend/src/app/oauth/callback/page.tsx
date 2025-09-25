'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completeOAuthCallback } from '@/utils/api';
import { useTenant } from '@/utils/TenantContext';

function OAuthCallbackInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { tenantId } = useTenant();
  const [status, setStatus] = React.useState<'idle' | 'working' | 'ok' | 'error'>('idle');
  const [message, setMessage] = React.useState<string>('Finalizing OAuth...');
  const [details, setDetails] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    const connectorId = search.get('connector_id') || '';
    const code = search.get('code') || '';
    const state = search.get('state');

    if (!connectorId) {
      setStatus('error');
      setMessage('Missing connector_id');
      return;
    }
    if (!code) {
      setStatus('error');
      setMessage('Missing OAuth code');
      return;
    }

    let cancelled = false;
    setStatus('working');
    completeOAuthCallback(connectorId, code, state, tenantId ?? null)
      .then((res) => {
        if (cancelled) return;
        setStatus('ok');
        const obj = res && typeof res === 'object' ? (res as Record<string, unknown>) : null;
        setDetails(obj);
        setMessage('Connected successfully. Redirecting...');
        // Redirect back to connectors dashboard after a short delay
        setTimeout(() => {
          router.replace('/connectors?connected=1&connector=' + encodeURIComponent(connectorId));
        }, 800);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        let reason = 'OAuth completion failed';
        if (err && typeof err === 'object' && 'message' in err) {
          reason = String((err as { message?: string }).message || reason);
        }
        setMessage(reason);
      });

    return () => {
      cancelled = true;
    };
  }, [search, router, tenantId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-gray-900">OAuth Callback</h1>
        <p className="mt-2 text-gray-700">{message}</p>
        {status === 'working' && (
          <p className="mt-3 text-sm text-gray-500">Please wait while we finalize your connection...</p>
        )}
        {status === 'ok' && (
          <p className="mt-3 text-sm text-green-700">Success! You will be redirected shortly.</p>
        )}
        {status === 'error' && (
          <div className="mt-3 text-sm text-red-700">
            <p>Something went wrong. You can close this page and try again.</p>
          </div>
        )}
        {details ? (
          <pre className="mt-4 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
            {JSON.stringify(details, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md w-full rounded-lg border bg-white p-6 shadow">
            <h1 className="text-xl font-semibold text-gray-900">OAuth Callback</h1>
            <p className="mt-2 text-gray-700">Preparing...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
