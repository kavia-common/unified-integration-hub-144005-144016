"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllConnectorClients } from "@/connectors";
import { ConnectorApi, ConnectorSummary } from "@/utils/api";
import ConnectorCard from "@/components/integrations/ConnectorCard";

/**
 * Integrations page
 * - Lists available connectors from backend (or local registry if backend not reachable)
 * - Provides connect / disconnect actions
 * - Styled using Ocean Professional theme notes (rounded corners, subtle shadows, blue/amber accents)
 */

export default function IntegrationsPage() {
  const clients = useMemo(() => getAllConnectorClients(), []);
  const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If backend is down or not configured, fallback to registry metadata
    ConnectorApi.listConnectors()
      .then((data) => {
        if (data?.connectors?.length) {
          setConnectors(data.connectors);
        } else {
          // fallback
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
        setError(
          "Backend not reachable. Showing local connector catalog. Set NEXT_PUBLIC_BACKEND_URL in environment."
        );
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
      setConnectors((prev) =>
        prev.map((c) => (c.id === connectorId ? { ...c, connected: false } : c))
      );
    } catch (e) {
      const err = e as { message?: string };
      alert(err?.message ?? "Failed to disconnect");
    }
  };

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#111827]">Integrations</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect your tools to the Unified Integration Hub. Use the buttons below to link or unlink integrations.
          </p>
          {error && (
            <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
              {error}
            </div>
          )}
        </div>

        <section>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <footer className="mt-12 text-xs text-gray-500">
          <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-gray-50 p-4">
            <p>
              Need help? Visit{" "}
              <Link className="text-blue-600 underline" href="/">
                the docs
              </Link>{" "}
              or contact your administrator.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
