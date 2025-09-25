"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import EnvCard, { ConnectorMeta } from "@/components/dashboard/EnvCard";
import LiveSearch from "@/components/integrations/LiveSearch";
import { JIRA_CONNECTOR_ID } from "@/connectors/jira";
import { CONFLUENCE_CONNECTOR_ID } from "@/connectors/confluence";

export default function Home() {
  const makeActions = (status: ConnectorMeta["status"]): ConnectorMeta["actions"] => {
    if (status === "connected") {
      return [
        { label: "Open Portal", variant: "primary", onClick: () => alert("Opening portal...") },
        { label: "Rotate Key", variant: "outline", onClick: () => alert("Rotating key...") },
        { label: "Disconnect", variant: "danger", onClick: () => alert("Disconnecting...") },
      ];
    }
    if (status === "error") {
      return [
        { label: "Retry", variant: "cta", onClick: () => alert("Retrying...") },
        { label: "Details", variant: "outline", onClick: () => alert("Showing details...") },
      ];
    }
    return [
      { label: "Connect", variant: "cta", onClick: () => alert("Connecting...") },
      { label: "Docs", variant: "outline", onClick: () => alert("Opening docs...") },
    ];
  };

  const devConnectors: ConnectorMeta[] = [
    { name: "GitHub", status: "connected", apiMasked: "****-****-gH8", lastSynced: "2h ago", actions: makeActions("connected") },
    { name: "Slack", status: "connected", apiMasked: "****-****-SkC", lastSynced: "10m ago", actions: makeActions("connected") },
    { name: "Notion", status: "disconnected", actions: makeActions("disconnected") },
  ];

  const prodConnectors: ConnectorMeta[] = [
    { name: "Jira", status: "connected", apiMasked: "****-****-JrA", lastSynced: "1h ago", actions: makeActions("connected") },
    { name: "Confluence", status: "error", apiMasked: "****-****-CnF", lastSynced: "1d ago", actions: makeActions("error") },
  ];

  return (
    <AppShell
      title="Connections Dashboard"
      subtitle="Manage your integrations from a central interface. Monitor status, rotate keys, and open portals for each connection."
      actionLabel="Create new connection"
      onAction={() => alert("Create new connection")}
    >
      <div className="env-columns">
        <EnvCard title="Current Dev" onRefresh={() => alert("Refreshing Dev")} connectors={devConnectors} />
        <EnvCard title="Current Prod" onRefresh={() => alert("Refreshing Prod")} connectors={prodConnectors} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Search JIRA</h2>
          <LiveSearch connectorId={JIRA_CONNECTOR_ID} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Search Confluence</h2>
          <LiveSearch connectorId={CONFLUENCE_CONNECTOR_ID} />
        </div>
      </div>

      <div className="footer-links">
        <a href="#" className="link">Documentation and Support</a>
        <a href="#" className="link">Having trouble? Contact us</a>
      </div>
    </AppShell>
  );
}
