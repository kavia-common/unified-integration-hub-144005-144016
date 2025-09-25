"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import ConnectorCard from "@/components/integrations/ConnectorCard";
import { CONNECTORS } from "@/connectors";
import LiveSearch from "@/components/integrations/LiveSearch";
import JiraCreateIssueModal from "@/components/integrations/JiraCreateIssueModal";
import ConfluenceCreatePageModal from "@/components/integrations/ConfluenceCreatePageModal";
import { fetchAllConnectorStatuses } from "@/utils/status";

function ConnectorsPageInner() {
  const qs = useSearchParams();
  const [tenantId, setTenantId] = useState<string>("demo-tenant");
  const [connectedFlags, setConnectedFlags] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [showConfluenceModal, setShowConfluenceModal] = useState(false);
  type CreatedItem = { id?: string; key?: string; title?: string; url?: string; [k: string]: unknown };
  const [lastCreated, setLastCreated] = useState<CreatedItem | null>(null);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = CONNECTORS.map((c) => c.id);
      const map = await fetchAllConnectorStatuses(ids);
      const flags: Record<string, boolean> = {};
      ids.forEach((id) => {
        flags[id] = Boolean(map[id]?.connected);
      });
      setConnectedFlags(flags);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load connectors";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const recentlyConnected = qs.get("connected") === "1";
  const connectorParam = qs.get("connector");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connectors</h1>
          <p className="text-gray-600">Manage integrations like JIRA and Confluence.</p>
          {recentlyConnected && connectorParam && (
            <div className="mt-3 rounded-md bg-green-50 p-3 text-green-700">
              Successfully connected {connectorParam}.
            </div>
          )}
          {error && <div className="mt-3 rounded-md bg-red-50 p-3 text-red-700">{error}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            placeholder="Tenant Id"
            aria-label="Tenant Id"
          />
          <button
            onClick={() => void loadAll()}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
            aria-label="Refresh statuses"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => setShowJiraModal(true)}
        >
          + JIRA Issue
        </button>
        <button
          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          onClick={() => setShowConfluenceModal(true)}
        >
          + Confluence Page
        </button>
      </div>

      {lastCreated ? (
        <div className="mt-3 rounded-md bg-green-50 p-3 text-green-700">
          Created: {lastCreated?.key || lastCreated?.id || lastCreated?.title || "Item"}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-white p-4">Loading connectors...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {CONNECTORS.map((c) => (
              <ConnectorCard
                key={c.id}
                connectorId={c.id}
                title={c.name}
                description={c.description}
                connected={connectedFlags[c.id]}
                onStatusChange={(isConnected) =>
                  setConnectedFlags((prev) => ({ ...prev, [c.id]: isConnected }))
                }
              />
            ))}
          </div>

          <div className="mt-8">
            <LiveSearch connectorId="jira" />
          </div>
          <div className="mt-4">
            <LiveSearch connectorId="confluence" />
          </div>
        </>
      )}

      <JiraCreateIssueModal
        open={showJiraModal}
        onClose={() => setShowJiraModal(false)}
        tenantId={tenantId}
        onCreated={(issue) => setLastCreated(issue)}
      />
      <ConfluenceCreatePageModal
        open={showConfluenceModal}
        onClose={() => setShowConfluenceModal(false)}
        tenantId={tenantId}
        onCreated={(page) => setLastCreated(page)}
      />
    </div>
  );
}

export default function ConnectorsPage() {
  return (
    <React.Suspense fallback={<div className="rounded-md border bg-white p-4">Loading...</div>}>
      <ConnectorsPageInner />
    </React.Suspense>
  );
}
