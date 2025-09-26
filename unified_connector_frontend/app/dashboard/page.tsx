"use client";

import React, { useEffect, useState } from "react";
import { getConnectors, validateConnection, revokeConnection, ConnectorInfo } from "../../lib/api/connectors";
import ErrorBanner from "../../components/ErrorBanner";
import Spinner from "../../components/Spinner";

/**
 * Dashboard page showing connections for the tenant with validate, revoke and view actions.
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    const resp = await getConnectors();
    if (resp.status === "ok") {
      setConnectors(resp.data);
    } else {
      setError(resp.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onValidate(connectorId: string) {
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
      <header className="card">
        <div className="cardHeader">
          <div>
            <div className="small">Home / Dashboard</div>
            <h1 className="h1">Connections Dashboard</h1>
            <p className="lead">Manage your integrations from a central interface. Use the cards below to validate or revoke connections, or browse items.</p>
          </div>
          <a href="/(integrations)/wizard" className="btn btnPrimary">Create Connection</a>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small">Sort: Updated</span>
          <span className="small">Updated: just now</span>
        </div>
      </header>

      {error && <div style={{ marginTop: 12 }}><ErrorBanner message={error} onClose={() => setError(null)} /></div>}

      {loading ? (
        <div className="row" style={{ gap: 8, marginTop: 12 }}><Spinner /><span className="small">Loading…</span></div>
      ) : (
        <section className="grid2" style={{ marginTop: 12 }}>
          {connectors.map((c) => (
            <article key={c.id} className="card">
              <div className="cardHeader">
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <div aria-hidden style={{ width: 24, height: 24, borderRadius: 6, background: "#fff", border: "1px solid var(--border-subtle)" }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{c.display_name || c.id.toUpperCase()}</h3>
                  <span className={`statusPill ${c.connected ? "pillConnected" : "pillNotConnected"}`}>
                    {c.connected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                <a className="link small" href={`https://docs.example.com/${c.id}`} target="_blank" rel="noopener">Docs</a>
              </div>

              <div className="stack-12">
                <div className="row" style={{ gap: 8 }}>
                  <span className="small">Scopes:</span>
                  <span className="code small">{(c.required_scopes || []).join(", ") || "N/A"}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="small">Last Error:</span>
                  <span className="small">{c.connection?.last_error || "None"}</span>
                </div>
              </div>

              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn btnPrimary" onClick={() => onValidate(c.id)}>Validate</button>
                <a className="btn btnSecondary" href={`/connections/${encodeURIComponent(c.connection?.id || c.id)}`}>View</a>
                {c.connected && (
                  <button className="btn btnDangerGhost" onClick={() => onRevoke(c.id)}>Revoke</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="row" style={{ marginTop: 16, justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span className="small">All changes are saved automatically.</span>
        <div className="row" style={{ gap: 12 }}>
          <a className="link small" href="#">Terms & Conditions</a>
          <span aria-hidden>·</span>
          <a className="link small" href="#">Data Privacy & Security</a>
          <span aria-hidden>·</span>
          <a className="link small" href="#">System Status</a>
        </div>
      </footer>
    </div>
  );
}
