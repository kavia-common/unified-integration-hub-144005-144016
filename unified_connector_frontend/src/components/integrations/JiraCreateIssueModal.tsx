"use client";

import React, { useEffect, useState } from "react";
import { createJiraIssue, listJiraProjects } from "@/connectors/jira";
import CreateModal from "./CreateModal";

/**
 * PUBLIC_INTERFACE
 * JiraCreateIssueModal
 * Modal for creating a Jira issue per backend OpenAPI:
 * Request payload: { project_key: string, summary: string, issuetype?: string, description?: string | null }
 */
export default function JiraCreateIssueModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (issue: Record<string, unknown>) => void;
}) {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [projectKey, setProjectKey] = useState("");
  const [summary, setSummary] = useState("");
  const [issuetype, setIssuetype] = useState("Task");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await listJiraProjects();
        const items = (Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []) as Array<Record<string, unknown>>;
        setProjects(items);
      } catch (e) {
        console.error(e);
        setProjects([]);
      }
    })();
  }, [open]);

  const canSubmit = Boolean(projectKey && summary);

  return (
    <CreateModal
      title="Create Jira Issue"
      open={open}
      onClose={onClose}
      onSubmit={async () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
          const payload = {
            project_key: projectKey,
            summary,
            issuetype,
            description: description || undefined,
          };
          const res = await createJiraIssue(payload);
          onCreated?.(res as Record<string, unknown>);
          onClose();
        } catch (e: unknown) {
          const msg =
            e && typeof e === "object" && "message" in (e as Record<string, unknown>)
              ? String((e as { message?: string }).message)
              : "Failed to create issue";
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
          <label className="mb-1 block text-xs text-gray-700">Project Key *</label>
          <select
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            aria-required="true"
            aria-invalid={!projectKey}
          >
            <option value="">Select project</option>
            {projects.map((p, idx) => {
              const key = String((p.key as string) ?? (p.id as string) ?? idx);
              const name = String((p.name as string) ?? key);
              const val = String((p.key as string) ?? (p.id as string) ?? "");
              return (
                <option key={key} value={val}>
                  {name} ({String(p.key ?? "")})
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-700">Summary *</label>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Issue summary"
            aria-required="true"
            aria-invalid={!summary}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-700">Issue type</label>
          <select
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            value={issuetype}
            onChange={(e) => setIssuetype(e.target.value)}
          >
            <option>Task</option>
            <option>Bug</option>
            <option>Story</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-700">Description (optional)</label>
          <textarea
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
          />
        </div>
        {!canSubmit && <p className="text-xs text-red-600">Project key and summary are required.</p>}
      </div>
    </CreateModal>
  );
}
