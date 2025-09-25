"use client";

import { API_BASE } from "@/utils/api";

/**
 * PUBLIC_INTERFACE
 * listConfluenceSpaces
 */
export async function listConfluenceSpaces(tenantId?: string | null) {
  const res = await fetch(`${API_BASE}/connectors/confluence/confluence/spaces`, {
    headers: { "Content-Type": "application/json", ...(tenantId ? { "x-tenant-id": tenantId } : {}) },
  });
  if (!res.ok) throw new Error("Failed to list spaces");
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * createConfluencePage
 * Payload shape per OpenAPI:
 * {
 *   space_key: string (required)
 *   title: string (required)
 *   body: string (required)
 * }
 */
export async function createConfluencePage(payload: { space_key: string; title: string; body: string }, tenantId?: string | null) {
  const res = await fetch(`${API_BASE}/connectors/confluence/confluence/pages`, {
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
        : "Failed to create page";
    throw new Error(msg);
  }
  return res.json();
}
