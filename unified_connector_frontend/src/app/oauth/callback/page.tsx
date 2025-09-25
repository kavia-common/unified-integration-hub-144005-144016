'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completeOAuthCallback } from '@/utils/api';

// PUBLIC_INTERFACE
function OAuthCallbackInner() {
  /**
   * Finalizes the OAuth flow by calling backend callback with code/state.
   * On success, redirects user to connectors page with success notice.
   */
  const search = useSearchParams();
  const router = useRouter();
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
    completeOAuthCallback(connectorId, code, state)
      .then((res) => {
        if (cancelled) return;
        setStatus('ok');
        setDetails(res);
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
  }, [search, router]);

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
    <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="rounded-md border bg-white p-4">Loading...</div></div>}>
      <OAuthCallbackInner />
    </React.Suspense>
  );
}
