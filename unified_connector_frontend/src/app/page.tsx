"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import LiveSearch from "@/components/integrations/LiveSearch";
import SearchResults from "@/components/integrations/SearchResults";
import JiraCreateIssueModal from "@/components/integrations/JiraCreateIssueModal";
import ConfluenceCreatePageModal from "@/components/integrations/ConfluenceCreatePageModal";

export default function HomePage() {
  const [tenantId, setTenantId] = useState<string>("demo-tenant");

  const [showJiraModal, setShowJiraModal] = useState(false);
  const [showConfluenceModal, setShowConfluenceModal] = useState(false);
  type CreatedItem = { id?: string; key?: string; title?: string; url?: string; [k: string]: unknown };
  const [lastCreated, setLastCreated] = useState<CreatedItem | null>(null);

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
        </div>
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
