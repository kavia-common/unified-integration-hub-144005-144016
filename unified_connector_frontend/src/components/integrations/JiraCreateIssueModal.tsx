"use client";

import React, { useCallback, useMemo, useState } from "react";
import CreateModal from "./CreateModal";
import { apiPost } from "@/utils/api";

export type NormalizedJiraIssue = {
  id?: string;
  key?: string;
  title?: string;
  url?: string;
  [k: string]: unknown;
};

export type JiraCreateIssueModalProps = {
  tenantId?: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (issue: NormalizedJiraIssue) => void;
};

/**
 * PUBLIC_INTERFACE
 * JiraCreateIssueModal renders a modal to create a Jira issue via backend.
 * Normalized request body:
 *   { title: string, description?: string, projectKey?: string, issueType?: string }
 * Response expected as normalized issue object from backend.
 */
export default function JiraCreateIssueModal({
  tenantId,
  open,
  onClose,
  onCreated,
}: JiraCreateIssueModalProps) {
  const [title, setTitle] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [issueType, setIssueType] = useState("Task");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const reset = useCallback(() => {
    setTitle("");
    setProjectKey("");
    setIssueType("Task");
    setDescription("");
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
        description: description.trim() || undefined,
        projectKey: projectKey.trim() || undefined,
        issueType: issueType.trim() || undefined,
      };
      const result = await apiPost<NormalizedJiraIssue, typeof body>("/connectors/jira/issues", body, tenantId);
      setStatus("success");
      onCreated?.(result);
      // auto close after small delay
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
          : "Failed to create issue.";
      setError(message);
    }
  }, [canSubmit, description, issueType, onClose, onCreated, projectKey, reset, tenantId, title]);

  const handleClose = useCallback(() => {
    onClose();
    // reset state when closing
    setTimeout(reset, 50);
  }, [onClose, reset]);

  return (
    <CreateModal
      title="Create JIRA Issue"
      open={open}
      onClose={handleClose}
      onSubmit={doSubmit}
      submitLabel="Create Issue"
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
            placeholder="Short issue summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Project Key</label>
          <input
            type="text"
            placeholder="e.g., ABC"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Issue Type</label>
          <input
            type="text"
            placeholder="Task, Bug, Story..."
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        {!canSubmit && (
          <p className="text-xs text-red-600">Title is required to create an issue.</p>
        )}
      </form>
    </CreateModal>
  );
}
