"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { getAllConnectorClients } from "@/connectors";
import { ConnectorApi, ConnectorSummary } from "@/utils/api";
import ConnectorCard from "@/components/integrations/ConnectorCard";

export default function IntegrationsPage() {
  const clients = useMemo(() => getAllConnectorClients(), []);
  const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ConnectorApi.listConnectors()
      .then((data) => {
        if (data?.connectors?.length) {
          setConnectors(data.connectors);
        } else {
          setConnectors(
            clients.map((c) => ({
              id: c.meta.id,
              name: c.meta.name,
              description: c.meta.description,
              connected: false,
              category: c.meta.category,
              icon: c.meta.icon,
            }))
          );
        }
      })
      .catch(() => {
        setConnectors(
          clients.map((c) => ({
            id: c.meta.id,
            name: c.meta.name,
            description: c.meta.description,
            connected: false,
            category: c.meta.category,
            icon: c.meta.icon,
          }))
        );
        setError("Backend not reachable. Showing local connector catalog. Set NEXT_PUBLIC_BACKEND_URL in environment.");
      });
  }, [clients]);

  const onConnect = async (connectorId: string) => {
    try {
      const { auth_url } = await ConnectorApi.getOAuthLoginUrl(
        connectorId,
        typeof window !== "undefined" ? window.location.href : undefined,
        null
      );
      if (auth_url) {
        window.location.href = auth_url;
      }
    } catch (e) {
      const err = e as { message?: string };
      alert(err?.message ?? "Failed to start OAuth flow");
    }
  };

  const onDisconnect = async (connectorId: string) => {
    try {
      await ConnectorApi.disconnect(connectorId, null);
      setConnectors((prev) => prev.map((c) => (c.id === connectorId ? { ...c, connected: false } : c)));
    } catch (e) {
      const err = e as { message?: string };
      alert(err?.message ?? "Failed to disconnect");
    }
  };

  return (
    <AppShell
      title="Integrations"
      subtitle="Connect your tools to the Unified Integration Hub. Use the buttons below to link or unlink integrations."
      actionLabel="Add connector"
      onAction={() => alert("Add connector")}
    >
      {error && <div className="alert-warn">{error}</div>}

      <section>
        <div className="grid grid-connectors">
          {connectors.map((c) => {
            const client = clients.find((cl) => cl.meta.id === c.id);
            return (
              <ConnectorCard
                key={c.id}
                connector={{
                  id: String(c.id),
                  name: c.name,
                  description: c.description ?? "",
                  connected: Boolean(c.connected),
                  category: c.category ?? "Other",
                  icon: c.icon ?? (client?.meta.icon || "🔗"),
                  color: client?.meta.color || "#2563EB",
                }}
                onConnect={() => onConnect(String(c.id))}
                onDisconnect={() => onDisconnect(String(c.id))}
              />
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
