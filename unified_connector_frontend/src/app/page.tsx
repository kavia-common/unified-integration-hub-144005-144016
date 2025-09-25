"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import LiveSearch from "@/components/integrations/LiveSearch";

import JiraCreateIssueModal from "@/components/integrations/JiraCreateIssueModal";
import ConfluenceCreatePageModal from "@/components/integrations/ConfluenceCreatePageModal";
import { CONNECTORS } from "@/connectors";
import { fetchAllConnectorStatuses } from "@/utils/status";

export default function HomePage() {
  const [tenantId, setTenantId] = useState<string>("demo-tenant");

  const [showJiraModal, setShowJiraModal] = useState(false);
  const [showConfluenceModal, setShowConfluenceModal] = useState(false);
  type CreatedItem = { id?: string; key?: string; title?: string; url?: string; [k: string]: unknown };
  const [lastCreated, setLastCreated] = useState<CreatedItem | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusFlags, setStatusFlags] = useState<Record<string, boolean>>({});

  const loadStatuses = React.useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const ids = CONNECTORS.map((c) => c.id);
      const map = await fetchAllConnectorStatuses(ids);
      const flags: Record<string, boolean> = {};
      ids.forEach((id) => (flags[id] = Boolean(map[id]?.connected)));
      setStatusFlags(flags);
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to load statuses");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStatuses();
  }, [loadStatuses]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Unified Connector Dashboard</h1>
        <div className="flex items-center gap-2">
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            placeholder="Tenant Id"
            aria-label="Tenant Id"
          />
          <button
            onClick={() => void loadStatuses()}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border bg-white p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Connection Status:
            {CONNECTORS.map((c) => (
              <span
                key={c.id}
                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  statusFlags[c.id] ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {c.name}: {statusFlags[c.id] ? "Connected" : "Disconnected"}
              </span>
            ))}
          </p>
          {statusLoading && <span className="text-xs text-gray-500">Refreshing...</span>}
        </div>
        {statusError && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {statusError}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Search JIRA</h2>
          <LiveSearch connectorId="jira" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Search Confluence</h2>
          <LiveSearch connectorId="confluence" />
        </div>
      </div>

      <JiraCreateIssueModal
        open={showJiraModal}
        onClose={() => setShowJiraModal(false)}
        tenantId={tenantId}
        onCreated={(issue) => {
          setLastCreated(issue);
        }}
      />
      <ConfluenceCreatePageModal
        open={showConfluenceModal}
        onClose={() => setShowConfluenceModal(false)}
        tenantId={tenantId}
        onCreated={(page) => {
          setLastCreated(page);
        }}
      />
    </AppShell>
  );
}
