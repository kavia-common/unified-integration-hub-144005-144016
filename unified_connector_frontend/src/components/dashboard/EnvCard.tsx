"use client";

import React from "react";

export interface ConnectorAction {
  label: string;
  variant?: "primary" | "cta" | "outline" | "danger";
  onClick: () => void;
}

export interface ConnectorMeta {
  name: string;
  status: "connected" | "disconnected" | "error";
  apiMasked?: string;
  lastSynced?: string;
  actions: ConnectorAction[];
}

export interface EnvCardProps {
  title: string;
  onRefresh?: () => void;
  connectors: ConnectorMeta[];
}

// PUBLIC_INTERFACE
export default function EnvCard({ title, onRefresh, connectors }: EnvCardProps) {
  return (
    <section className="env-card">
      <header className="env-card__header">
        <h2>{title}</h2>
        <button type="button" className="btn btn-link" onClick={onRefresh}>
          Refresh
        </button>
      </header>

      <div className="env-card__list">
        {connectors.map((c, idx) => (
          <article className="connector-block" key={`${c.name}-${idx}`}>
            <div className="connector-block__left">
              <h3>{c.name}</h3>
              <div className="meta">
                <span className="status">
                  <span
                    className={`dot ${
                      c.status === "connected" ? "dot--green" : c.status === "error" ? "dot--red" : "dot--gray"
                    }`}
                  />
                  {c.status === "connected" ? "Connected" : c.status === "error" ? "Error" : "Disconnected"}
                </span>
                {c.apiMasked ? <span className="api-chip">API: {c.apiMasked}</span> : null}
                {c.lastSynced ? <span className="last-synced">Last synced {c.lastSynced}</span> : null}
              </div>
            </div>
            <div className="connector-block__actions">
              {c.actions.map((a, i) => (
                <button
                  key={`${a.label}-${i}`}
                  type="button"
                  className={`btn ${variantToClass(a.variant)}`}
                  onClick={a.onClick}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function variantToClass(v?: ConnectorAction["variant"]) {
  switch (v) {
    case "cta":
      return "btn-cta";
    case "outline":
      return "btn-outline";
    case "danger":
      return "btn-outline-red";
    default:
      return "btn-primary";
  }
}
