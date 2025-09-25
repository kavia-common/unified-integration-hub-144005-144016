"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import { getAllConnectorClients } from "@/connectors";
import { ConnectorApi, ConnectorSummary } from "@/utils/api";
import ConnectorCard from "@/components/integrations/ConnectorCard";
import { ConnectorSelectModal } from "@/components/integrations";
import { useSearchParams, useRouter } from "next/navigation";

function IntegrationsPageInner() {
  const clients = useMemo(() => getAllConnectorClients(), []);
  const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [modalError, setModalError] = useState<string | null>(null);
  const search = useSearchParams();
  const router = useRouter();
  const [banner, setBanner] = useState<string | null>(null);

  // Load connectors and statuses
  const loadConnectors = React.useCallback(() => {
    return ConnectorApi.listConnectors()
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

  useEffect(() => {
    loadConnectors();
  }, [loadConnectors]);

  // Check for post-callback params to show success
  useEffect(() => {
    const connected = search.get("connected");
    const connector = search.get("connector");
    if (connected === "1" && connector) {
      setBanner(`Connected ${connector} successfully.`);
      // refresh list to reflect updated connected status
      loadConnectors();
      // Clean up the query params to avoid repeated banner on navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("connector");
      router.replace(url.pathname + url.search);
    }
  }, [search, router, loadConnectors]);

  // Start OAuth for selected connector
  const startOAuth = async (connectorId: string) => {
    try {
      setModalError(null);
      setModalStatus("submitting");
      // If already connected, show message and avoid re-link (basic UX).
      const existing = connectors.find((c) => String(c.id) === String(connectorId));
      if (existing?.connected) {
        setModalStatus("error");
        setModalError("This connector is already linked. Disconnect before linking again.");
        return;
      }

      const { auth_url } = await ConnectorApi.getOAuthLoginUrl(
        connectorId,
        // Redirect back to our oauth callback page with connector_id propagated for backend callback continuity
        typeof window !== "undefined"
          ? `${window.location.origin}/oauth/callback?connector_id=${encodeURIComponent(String(connectorId))}`
          : undefined,
        null
      );
      if (auth_url) {
        setModalStatus("success");
        // redirect to provider/back-end oauth login
        window.location.href = auth_url;
        return;
      }
      throw new Error("No authorization URL returned.");
    } catch (e) {
      const err = e as { message?: string };
      setModalStatus("error");
      setModalError(err?.message ?? "Failed to start OAuth flow");
    }
  };

  const onConnect = async (connectorId: string) => {
    // For direct card connect, just start oauth (same checks apply)
    await startOAuth(connectorId);
  };

  const onDisconnect = async (connectorId: string) => {
    try {
      await ConnectorApi.disconnect(connectorId, null);
      setConnectors((prev) => prev.map((c) => (c.id === connectorId ? { ...c, connected: false } : c)));
      setBanner(`Disconnected ${connectorId}.`);
      setTimeout(() => setBanner(null), 3000);
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
      onAction={() => {
        setModalStatus("idle");
        setModalError(null);
        setModalOpen(true);
      }}
    >
      {banner && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-green-800">
          {banner}
        </div>
      )}
      {error && <div className="alert-warn">{error}</div>}

      <section>
        <div className="grid grid-connectors">
          {connectors.map((c) => {
            const client = clients.find((cl) => cl.meta.id === c.id);
            const connected = Boolean(c.connected);
            return (
              <ConnectorCard
                key={c.id}
                connector={{
                  id: String(c.id),
                  name: c.name,
                  description: c.description ?? "",
                  connected,
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

      <ConnectorSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        connectors={clients}
        error={modalError}
        status={modalStatus}
        onSelect={async (id) => {
          await startOAuth(id);
        }}
      />
    </AppShell>
  );
}

export default function IntegrationsPage() {
  // Wrap inner client component with Suspense to satisfy useSearchParams requirement
  return (
    <Suspense
      fallback={
        <AppShell title="Integrations" subtitle="Loading connections...">
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        </AppShell>
      }
    >
      <IntegrationsPageInner />
    </Suspense>
  );
}
