"use client";

import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ConnectForm: small inline form for PAT/API token-based connections.
 */
export default function ConnectForm({
  onSubmit,
  submitting,
  initial = { site_url: "", email: "", api_token: "" },
}: {
  onSubmit: (vals: { site_url: string; email?: string; api_token: string }) => Promise<void> | void;
  submitting?: boolean;
  initial?: { site_url: string; email?: string; api_token: string };
}) {
  const [siteUrl, setSiteUrl] = useState(initial.site_url);
  const [email, setEmail] = useState(initial.email || "");
  const [token, setToken] = useState(initial.api_token);

  return (
    <form
      className="stack-12"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ site_url: siteUrl, email, api_token: token });
      }}
    >
      <div className="field">
        <label className="label" htmlFor="site-url">Site URL</label>
        <input className="input" id="site-url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://your-domain.atlassian.net" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="email">Username / Email (optional)</label>
        <input className="input" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label className="label" htmlFor="token">API Token</label>
        <input className="input" id="token" value={token} onChange={(e) => setToken(e.target.value)} type="password" placeholder="•••••••••••••••" required />
      </div>

      <div className="actions">
        <button className="btn btnWarning" type="submit" disabled={submitting} aria-label="Save API token">
          {submitting ? "Saving..." : "Save Token"}
        </button>
      </div>
    </form>
  );
}
