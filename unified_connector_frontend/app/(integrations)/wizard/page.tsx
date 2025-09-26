"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPatConnection, getConnectors, handleOAuthCallback, startOAuth, validateConnection, revokeConnection, ConnectorInfo } from "../../../lib/api/connectors";
import ConnectorCard from "../../../components/connectors/ConnectorCard";
import ConnectForm from "../../../components/ConnectForm";
import ErrorBanner from "../../../components/ErrorBanner";
import Spinner from "../../../components/Spinner";

/**
 * Integrations Wizard
 * - Lists Jira/Confluence connectors
 * - Start OAuth (redirect)
 * - Handle OAuth callback (state, code)
 * - PAT flows (save and validate)
 * - Revoke connection
 */
export default function WizardPage() {
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPatFormFor, setShowPatFormFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/(integrations)/wizard";
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    const resp = await getConnectors();
    if (resp.status === "ok") {
      // prefer only Jira and Confluence in this wizard
      setConnectors(resp.data.filter(c => ["jira","confluence"].includes(c.id)));
    } else {
      setError(resp.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  // Handle OAuth callback (if state&code present)
  useEffect(() => {
    const url = new URL(window.location.href);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    const conn = url.searchParams.get("connector");

    async function consume() {
      if (state && code && conn) {
        setError(null);
        setLoading(true);
        const resp = await handleOAuthCallback(conn, state, code);
        if (resp.status === "ok") {
          // Clear params after success
          url.searchParams.delete("state");
          url.searchParams.delete("code");
          url.searchParams.delete("connector");
          window.history.replaceState({}, "", url.toString());
          await refresh();
        } else {
          setError(resp.message || "OAuth callback failed.");
          setLoading(false);
        }
      }
    }
    void consume();
  }, []);

  async function onStartOAuth(connectorId: string) {
    setError(null);
    const resp = await startOAuth(connectorId, returnUrl + `?connector=${encodeURIComponent(connectorId)}`);
    if (resp.status === "ok") {
      window.location.href = resp.data.authorize_url;
      return;
    }
    setError(resp.message || "Failed to start OAuth.");
  }

  async function onPatSubmit(connectorId: string, vals: { site_url: string; email?: string; api_token: string }) {
    setSaving(true);
    setError(null);
    const resp = await createPatConnection(connectorId, vals);
    if (resp.status === "ok") {
      setShowPatFormFor(null);
      await refresh();
    } else {
      setError(resp.message || "Failed to save token.");
    }
    setSaving(false);
  }

  async function onValidate(connectorId: string) {
    setError(null);
    const resp = await validateConnection(connectorId);
    if (resp.status === "ok") {
      alert(`Validation: ${resp.data.status}`);
    } else {
      setError(resp.message || "Validation failed.");
    }
  }

  async function onRevoke(connectorId: string) {
    if (!confirm("Are you sure you want to revoke this connection?")) return;
    const resp = await revokeConnection(connectorId);
    if (resp.status === "ok") {
      await refresh();
    } else {
      setError(resp.message || "Failed to revoke connection.");
    }
  }

  return (
    <div className="section">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="cardHeader">
          <div>
            <h1 className="h1">Integrations Wizard</h1>
            <p className="lead">Connect Jira and Confluence using OAuth or Personal Access Tokens (PAT). Your tenant is scoped via X-Tenant-Id.</p>
          </div>
          <button className="btn btnSecondary" onClick={() => refresh()} aria-label="Refresh connectors">Refresh</button>
        </div>
        <div className="small">
          API base: <code className="code">{(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")}</code>
        </div>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="row" style={{ gap: 8 }}><Spinner /><span className="small">Loading connectors…</span></div>
      ) : (
        <div className="grid2">
          {connectors.map((c) => (
            <div key={c.id}>
              <ConnectorCard
                name={c.display_name || c.id.toUpperCase()}
                status={c.connected ? "connected" : "disconnected"}
                docsHref={`https://developer.atlassian.com/`}
                onStartOAuth={() => onStartOAuth(c.id)}
                onDisconnect={c.connected ? () => onRevoke(c.id) : undefined}
                patSummary={c.connected ? "API: •••• •••• ••••" : undefined}
                onAddPat={() => setShowPatFormFor(c.id)}
                onUpdatePat={() => setShowPatFormFor(c.id)}
                metaRight={<button className="btn btnPrimary" onClick={() => onValidate(c.id)}>Validate</button>}
              />

              {showPatFormFor === c.id && (
                <div className="card" style={{ marginTop: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Add/Update API Token</h3>
                  <p className="small">Provide your site URL and API token to connect without OAuth.</p>
                  <ConnectForm submitting={saving} onSubmit={(vals) => onPatSubmit(c.id, vals)} />
                  <div className="actions" style={{ marginTop: 8 }}>
                    <button className="btn btnSecondary" onClick={() => setShowPatFormFor(null)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
