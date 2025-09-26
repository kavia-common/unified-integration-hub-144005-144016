"use client";

import React from "react";

export type ConnectorCardProps = {
  name: string;
  status: "connected" | "disconnected" | "error";
  docsHref?: string;
  onStartOAuth?: () => void;
  onDisconnect?: () => void;
  patSummary?: string; // masked info
  onAddPat?: () => void;
  onUpdatePat?: () => void;
  metaRight?: React.ReactNode;
};

/**
 * PUBLIC_INTERFACE
 * ConnectorCard: modern minimal card showing connector status and actions (OAuth and PAT).
 */
export default function ConnectorCard(props: ConnectorCardProps) {
  const {
    name,
    status,
    docsHref,
    onStartOAuth,
    onDisconnect,
    patSummary,
    onAddPat,
    onUpdatePat,
    metaRight,
  } = props;

  const pillClass =
    status === "connected"
      ? "statusPill pillConnected"
      : status === "disconnected"
      ? "statusPill pillNotConnected"
      : "statusPill pillNotConnected";

  return (
    <article className="card">
      <div className="cardHeader">
        <div className="row" style={{ gap: 8 }}>
          <div
            aria-hidden
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "#fff",
              border: "1px solid var(--border-subtle)",
            }}
          />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{name}</h3>
          <span className={pillClass} aria-label={`Status: ${status}`}>
            {status === "connected" ? "Connected" : status === "error" ? "Error" : "Not Connected"}
          </span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          {docsHref && (
            <a className="link small" href={docsHref} target="_blank" rel="noopener">
              Docs
            </a>
          )}
          {metaRight}
        </div>
      </div>

      <div className="methodBlock">
        <div className="methodHead">
          <span className="methodTitle">OAuth</span>
          <span className="methodMeta">
            {status === "connected" ? "Linked" : "Authenticate via browser"}
          </span>
        </div>
        <div className="actions">
          {!!onStartOAuth && (
            <button className="btn btnPrimary" onClick={onStartOAuth} aria-label={`Start OAuth for ${name}`}>
              {status === "connected" ? "Reconnect" : "Start OAuth"}
            </button>
          )}
          {!!onDisconnect && (
            <button className="btn btnDangerGhost" onClick={onDisconnect} aria-label={`Disconnect ${name}`}>
              Disconnect
            </button>
          )}
        </div>
      </div>

      <hr className="divider" />

      <div className="methodBlock">
        <div className="methodHead">
          <span className="methodTitle">API Token / PAT</span>
          <span className="methodMeta code">{patSummary || "API: •••• •••• ••••"}</span>
        </div>
        <div className="actions">
          {!!onAddPat && (
            <button className="btn btnSecondary" onClick={onAddPat} aria-label={`Add API key for ${name}`}>
              Add Keys
            </button>
          )}
          {!!onUpdatePat && (
            <button className="btn btnWarning" onClick={onUpdatePat} aria-label={`Update API key for ${name}`}>
              Update Keys
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
