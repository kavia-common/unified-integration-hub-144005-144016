"use client";

import React, { useEffect, useState } from "react";
import { createConfluencePage, listConfluenceSpaces } from "@/connectors/confluence";
import CreateModal from "./CreateModal";

/**
 * PUBLIC_INTERFACE
 * ConfluenceCreatePageModal
 * Modal for creating a Confluence page per backend OpenAPI:
 * Request payload: { space_key: string, title: string, body: string }
 */
export default function ConfluenceCreatePageModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (page: Record<string, unknown>) => void;
}) {
  const [spaces, setSpaces] = useState<Array<Record<string, unknown>>>([]);
  const [spaceKey, setSpaceKey] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await listConfluenceSpaces();
        setSpaces(res?.items || res || []);
      } catch (e) {
        console.error(e);
        setSpaces([]);
      }
    })();
  }, [open]);

  const canSubmit = Boolean(spaceKey && title && body);

  return (
    <CreateModal
      title="Create Confluence Page"
      open={open}
      onClose={onClose}
      onSubmit={async () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
          const payload = { space_key: spaceKey, title, body };
          const res = await createConfluencePage(payload);
          onCreated?.(res);
          onClose();
        } catch (e: unknown) {
          const msg =
            e && typeof e === "object" && "message" in (e as Record<string, unknown>)
              ? String((e as { message?: string }).message)
              : "Failed to create page";
          setError(msg);
        } finally {
          setSubmitting(false);
        }
      }}
      submitLabel={submitting ? "Creating…" : "Create"}
      status={submitting ? "submitting" : "idle"}
      error={error}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-700">Space key *</label>
          <select
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            value={spaceKey}
            onChange={(e) => setSpaceKey(e.target.value)}
            aria-required="true"
            aria-invalid={!spaceKey}
          >
            <option value="">Select space</option>
            {spaces.map((s) => (
              <option key={s.key || s.id} value={s.key || s.id}>
                {s.name} ({s.key})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-700">Title *</label>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
            aria-required="true"
            aria-invalid={!title}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-700">Body *</label>
          <textarea
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Page body (storage format)"
            aria-required="true"
            aria-invalid={!body}
          />
        </div>
        {!canSubmit && <p className="text-xs text-red-600">Space key, title, and body are required.</p>}
      </div>
    </CreateModal>
  );
}
