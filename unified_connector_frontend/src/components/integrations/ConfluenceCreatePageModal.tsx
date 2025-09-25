"use client";

import React, { useCallback, useMemo, useState } from "react";
import CreateModal from "./CreateModal";
import { apiPost } from "@/utils/api";

export type NormalizedConfluencePage = {
  id?: string;
  title?: string;
  url?: string;
  [k: string]: unknown;
};

export type ConfluenceCreatePageModalProps = {
  tenantId?: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (page: NormalizedConfluencePage) => void;
};

/**
 * PUBLIC_INTERFACE
 * ConfluenceCreatePageModal renders a modal to create a Confluence page via backend.
 * Normalized request body:
 *   { title: string, spaceKey?: string, parentId?: string, content?: string }
 * Response expected as normalized page object from backend.
 */
export default function ConfluenceCreatePageModal({
  tenantId,
  open,
  onClose,
  onCreated,
}: ConfluenceCreatePageModalProps) {
  const [title, setTitle] = useState("");
  const [spaceKey, setSpaceKey] = useState("");
  const [parentId, setParentId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const reset = useCallback(() => {
    setTitle("");
    setSpaceKey("");
    setParentId("");
    setContent("");
    setError(null);
    setStatus("idle");
  }, []);

  const doSubmit = useCallback(async () => {
    setError(null);
    if (!canSubmit) {
      setError("Title is required.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const body = {
        title: title.trim(),
        spaceKey: spaceKey.trim() || undefined,
        parentId: parentId.trim() || undefined,
        content: content.trim() || undefined,
      };
      const result = await apiPost<NormalizedConfluencePage, typeof body>(
        "/connectors/confluence/pages",
        body,
        tenantId
      );
      setStatus("success");
      onCreated?.(result);
      setTimeout(() => {
        onClose();
        reset();
      }, 800);
    } catch (e: unknown) {
      setStatus("error");
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
          ? String((e as Record<string, unknown>).message)
          : "Failed to create page.";
      setError(message);
    }
  }, [canSubmit, content, onClose, onCreated, parentId, reset, spaceKey, tenantId, title]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(reset, 50);
  }, [onClose, reset]);

  return (
    <CreateModal
      title="Create Confluence Page"
      open={open}
      onClose={handleClose}
      onSubmit={doSubmit}
      submitLabel="Create Page"
      error={error}
      status={status}
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          doSubmit();
        }}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            placeholder="Page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Space Key</label>
          <input
            type="text"
            placeholder="e.g., ENG"
            value={spaceKey}
            onChange={(e) => setSpaceKey(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Parent Page ID</label>
          <input
            type="text"
            placeholder="Optional parent id"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
          <textarea
            placeholder="Write content (plain text or simple markup)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        {!canSubmit && (
          <p className="text-xs text-red-600">Title is required to create a page.</p>
        )}
      </form>
    </CreateModal>
  );
}
