"use client";

import React from "react";
import CreateModal from "./CreateModal";
import { ConnectorClient } from "@/connectors";

export type ConnectorSelectModalProps = {
  open: boolean;
  onClose: () => void;
  connectors: ConnectorClient[];
  onSelect: (connectorId: string) => Promise<void> | void;
  error?: string | null;
  status?: "idle" | "submitting" | "success" | "error";
};

/**
 * PUBLIC_INTERFACE
 * A modal to select which connector to add. Displays all available connectors and lets
 * the user pick one to initiate the OAuth flow. Supports loading/error presentation
 * via the underlying CreateModal wrapper.
 */
export default function ConnectorSelectModal({
  open,
  onClose,
  connectors,
  onSelect,
  error = null,
  status = "idle",
}: ConnectorSelectModalProps) {
  const [selected, setSelected] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;
    await onSelect(selected);
  };

  return (
    <CreateModal
      title="Add a new connection"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={selected ? "Continue" : "Select a connector"}
      error={error}
      status={status}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Choose a connector to link to your workspace. You may be redirected to the provider to authorize access.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connectors.map((c) => (
            <button
              key={c.meta.id}
              type="button"
              onClick={() => setSelected(String(c.meta.id))}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition hover:shadow-sm ${
                selected === c.meta.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
              }`}
              aria-pressed={selected === c.meta.id}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-md text-lg"
                style={{ backgroundColor: `${c.meta.color}1A`, color: c.meta.color }}
                aria-label={`${c.meta.name} icon`}
              >
                {c.meta.icon}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-gray-900">{c.meta.name}</span>
                <span className="block text-xs text-gray-500">{c.meta.category}</span>
              </span>
              {selected === c.meta.id ? (
                <span className="text-xs font-semibold text-blue-600">Selected</span>
              ) : (
                <span className="text-xs text-gray-400">Choose</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </CreateModal>
  );
}
