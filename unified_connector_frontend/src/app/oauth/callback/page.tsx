'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completeOAuthCallback } from '@/utils/api';
import { useTenant } from '@/utils/TenantContext';

/**
 * PUBLIC_INTERFACE
 * OAuthCallbackPage
 * Completes the OAuth flow by calling backend /connectors/{connector_id}/oauth/callback with code/state.
 * On success, redirects to /connectors with a success banner.
 */
function OAuthCallbackInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { tenantId } = useTenant();
  const [status, setStatus] = React.useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = React.useState<string>('Finalizing OAuth...');

  React.useEffect(() => {
    const connectorId = search.get('connector_id') || '';
    const code = search.get('code') || '';
    const state = search.get('state');

    if (!connectorId || !code) {
      setStatus('error');
      setMessage('Missing connector_id or code');
      return;
    }

    let cancelled = false;
    completeOAuthCallback(connectorId, code, state, tenantId ?? null)
      .then(() => {
        if (cancelled) return;
        setStatus('ok');
        setMessage('Connected successfully. Redirecting…');
        setTimeout(() => {
          router.replace('/connectors?connected=1&connector=' + encodeURIComponent(connectorId));
        }, 800);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        const msg =
          err && typeof err === 'object' && 'message' in (err as Record<string, unknown>)
            ? String((err as { message?: string }).message)
            : 'OAuth completion failed';
        setMessage(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [search, router, tenantId]);

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-lg font-semibold">OAuth Callback</h1>
      {status === 'working' && <p role="status" aria-live="polite">{message}</p>}
      {status === 'ok' && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status" aria-live="polite">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {message}. Please close this window and try connecting again from the Connectors page.
        </div>
      )}
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg p-6">Preparing…</div>}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
