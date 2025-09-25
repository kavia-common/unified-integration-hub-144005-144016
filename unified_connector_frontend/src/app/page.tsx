"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import EnvCard, { ConnectorMeta } from "@/components/dashboard/EnvCard";
import { ChatInput } from "@/components/integrations";

export default function Home() {
  const [banner, setBanner] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<null | string>(null);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === "object" && "message" in (err as Record<string, unknown>)) {
      const msgVal = (err as { message?: unknown }).message;
      return typeof msgVal === "string" ? msgVal : fallback;
    }
    return fallback;
  };

  const openPortal = async (connectorId: string) => {
    try {
      setBusy(`Opening portal for ${connectorId}...`);
      // Try to fetch a portal URL for known connectors; if absent, navigate to connectors list as a fallback.
      const res = await import("@/utils/api").then((m) => m.ConnectorApi.getPortalUrl(connectorId));
      if (res?.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
        setBanner(`Opened portal for ${connectorId} in a new tab.`);
      } else {
        // Fallback: route user to /connectors page with a notice
        setBanner("Portal not supported by backend. Redirecting to Connections page.");
        window.location.href = "/connectors";
      }
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to open portal.");
      alert(msg);
    } finally {
      setBusy(null);
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const rotateKey = async (connectorId: string) => {
    try {
      setBusy(`Rotating key for ${connectorId}...`);
      const api = await import("@/utils/api").then((m) => m.ConnectorApi);
      await api.rotateKey(connectorId);
      setBanner(`Rotated key for ${connectorId}.`);
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to rotate key.");
      alert(msg);
    } finally {
      setBusy(null);
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const disconnect = async (connectorId: string) => {
    try {
      setBusy(`Disconnecting ${connectorId}...`);
      const api = await import("@/utils/api").then((m) => m.ConnectorApi);
      await api.disconnect(connectorId);
      setBanner(`Disconnected ${connectorId}.`);
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to disconnect.");
      alert(msg);
    } finally {
      setBusy(null);
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const makeActions = (status: ConnectorMeta["status"], connectorName?: string): ConnectorMeta["actions"] => {
    if (status === "connected") {
      const id = (connectorName || "").toLowerCase();
      return [
        { label: busy ? busy : "Open Portal", variant: "primary", onClick: () => openPortal(id) },
        { label: busy ? busy : "Rotate Key", variant: "outline", onClick: () => rotateKey(id) },
        { label: busy ? busy : "Disconnect", variant: "danger", onClick: () => disconnect(id) },
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
    { name: "GitHub", status: "connected", apiMasked: "****-****-gH8", lastSynced: "2h ago", actions: makeActions("connected", "GitHub") },
    { name: "Slack", status: "connected", apiMasked: "****-****-SkC", lastSynced: "10m ago", actions: makeActions("connected", "Slack") },
    { name: "Notion", status: "disconnected", actions: makeActions("disconnected", "Notion") },
  ];

  const prodConnectors: ConnectorMeta[] = [
    { name: "Jira", status: "connected", apiMasked: "****-****-JrA", lastSynced: "1h ago", actions: makeActions("connected", "Jira") },
    { name: "Confluence", status: "error", apiMasked: "****-****-CnF", lastSynced: "1d ago", actions: makeActions("error", "Confluence") },
  ];

  return (
    <AppShell
      title="Connections Dashboard"
      subtitle="Manage your integrations from a central interface. Monitor status, rotate keys, and open portals for each connection."
      actionLabel="Create new connection"
      onAction={() => alert("Create new connection")}
    >
      {banner ? (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-800">
          {banner}
        </div>
      ) : null}
      <div className="env-columns">
        <EnvCard title="Current Dev" onRefresh={() => alert("Refreshing Dev")} connectors={devConnectors} />
        <EnvCard title="Current Prod" onRefresh={() => alert("Refreshing Prod")} connectors={prodConnectors} />
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Quick Chat</h2>
        <p className="text-sm text-gray-600 mb-3">
          Ask questions and attach references using @. Try @ to search and link results from your integrations.
        </p>
        <div className="max-w-2xl">
          <ChatInput
            placeholder="Ask a question... Use @ to attach pages or issues"
            onSend={(msg) => {
              const refs = (msg.references || []).map((r) => r.label).join(", ");
              alert(
                `Message sent:\n${msg.message}\nConnector: ${msg.connectorId ?? "auto"}\nPrefix: ${
                  msg.parsedPrefix ?? "-"
                }\nRefs: ${refs}`
              );
            }}
          />
        </div>
      </div>

      <div className="footer-links">
        <a href="#" className="link">Documentation and Support</a>
        <a href="#" className="link">Having trouble? Contact us</a>
      </div>
    </AppShell>
  );
}
