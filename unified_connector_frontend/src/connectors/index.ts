"use client";

import { ConnectorApi, ConnectorSummary, ConnectorId } from "@/utils/api";

// Basic connector metadata contract
export interface ConnectorMeta {
  id: ConnectorId | string;
  name: string;
  description: string;
  category: "Atlassian" | "Docs" | "Project Management" | "Knowledge" | "Other";
  color: string; // accent color for UI card
  icon: string; // emoji or url to icon
}

export interface ConnectorClient {
  meta: ConnectorMeta;

  // PUBLIC_INTERFACE
  list(): Promise<ConnectorSummary[]>;

  // PUBLIC_INTERFACE
  getOAuthUrl(redirectTo?: string, tenantId?: string | null): Promise<string>;

  // PUBLIC_INTERFACE
  connect(tenantId?: string | null): Promise<void>;

  // PUBLIC_INTERFACE
  disconnect(tenantId?: string | null): Promise<void>;
}

// PUBLIC_INTERFACE
export function buildConnectorClient(meta: ConnectorMeta): ConnectorClient {
  /** Factory for connector client using common backend endpoints. */
  return {
    meta,
    async list() {
      const data = await ConnectorApi.listConnectors();
      return data?.connectors ?? [];
    },
    async getOAuthUrl(redirectTo?: string, tenantId?: string | null) {
      const data = await ConnectorApi.getOAuthLoginUrl(meta.id, redirectTo, tenantId);
      return data.auth_url;
    },
    async connect(tenantId?: string | null) {
      await ConnectorApi.connect(meta.id, tenantId);
    },
    async disconnect(tenantId?: string | null) {
      await ConnectorApi.disconnect(meta.id, tenantId);
    },
  };
}

// PUBLIC_INTERFACE
export function getAllConnectorClients(): ConnectorClient[] {
  /** Returns all known connector clients registered in the app. */
  return [jiraClient, confluenceClient];
}

// Jira client
export const jiraClient = buildConnectorClient({
  id: "jira",
  name: "Jira",
  description: "Plan, track, and manage your software projects.",
  category: "Atlassian",
  color: "#2563EB",
  icon: "🧩",
});

// Confluence client
export const confluenceClient = buildConnectorClient({
  id: "confluence",
  name: "Confluence",
  description: "Create, collaborate, and organize all your work in one place.",
  category: "Atlassian",
  color: "#0EA5E9",
  icon: "📘",
});
