import React from "react";

/**
 * PUBLIC_INTERFACE
 * LegacyLanding: Lightweight landing for the Pages Router that forwards users to App Router routes.
 */
export default function LegacyLanding() {
  return (
    <div style={{ padding: 24, fontFamily: "Inter, Helvetica Neue, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Unified Connector</h1>
      <p style={{ color: "#4B5563", marginTop: 0 }}>
        This project uses the Next.js App Router. Use the primary pages below:
      </p>
      <ul>
        <li><a href="/dashboard">/dashboard</a></li>
        <li><a href="/(integrations)/wizard">/(integrations)/wizard</a></li>
        <li><a href="/connections/demo-connection">/connections/[id]</a> (sample)</li>
      </ul>
      <p style={{ color: "#6B7280", fontSize: 12 }}>
        This legacy page remains for compatibility; it simply links to the new routes.
      </p>
    </div>
  );
}
