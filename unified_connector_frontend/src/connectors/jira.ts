"use client";

import { API_BASE } from "@/utils/api";

/**
 * PUBLIC_INTERFACE
 * listJiraProjects
 */
export async function listJiraProjects(tenantId?: string | null) {
  const res = await fetch(`${API_BASE}/connectors/jira/jira/projects`, {
    headers: { "Content-Type": "application/json", ...(tenantId ? { "x-tenant-id": tenantId } : {}) },
  });
  if (!res.ok) throw new Error("Failed to list projects");
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * createJiraIssue
 * Payload shape per OpenAPI:
 * {
 *   project_key: string (required)
 *   summary: string (required)
 *   issuetype?: string (default 'Task')
 *   description?: string | null
 * }
 */
export async function createJiraIssue(payload: { project_key: string; summary: string; issuetype?: string; description?: string | null }, tenantId?: string | null) {
  const res = await fetch(`${API_BASE}/connectors/jira/jira/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(tenantId ? { "x-tenant-id": tenantId } : {}) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail: unknown = undefined;
    try { detail = await res.json(); } catch {}
    const msg =
      detail && typeof detail === "object" && "message" in (detail as Record<string, unknown>)
        ? String((detail as { message?: string }).message)
        : "Failed to create issue";
    throw new Error(msg);
  }
  return res.json();
}
