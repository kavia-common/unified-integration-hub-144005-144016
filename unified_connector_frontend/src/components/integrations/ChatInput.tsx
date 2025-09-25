"use client";

import React from "react";
import LiveSearch, { LiveSearchItem } from "./LiveSearch";
import { useTenant } from "@/utils/TenantContext";

type Connector = {
  id: string;
  name: string;
  connected?: boolean;
  prefix?: string;
};

type ChipRef = {
  id: string;
  label: string;
  connectorId: string;
  url?: string;
};

export type ChatInputProps = {
  connectors?: Connector[]; // optional injected list; otherwise parse from message prefix
  onSend?: (payload: {
    message: string;
    connectorId?: string;
    references?: ChipRef[];
    parsedPrefix?: string;
  }) => void;
};

/**
 * PUBLIC_INTERFACE
 * ChatInput
 * Supports connector selection via typed prefixes (e.g., "jira:", "conf:").
 * Opens LiveSearch overlay with "@" and adds selected items as reference chips.
 */
export default function ChatInput({ connectors = [], onSend }: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const [selectedConnector, setSelectedConnector] = React.useState<Connector | undefined>(undefined);
  const [typedPrefix, setTypedPrefix] = React.useState<string>("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [references, setReferences] = React.useState<ChipRef[]>([]);
  const { tenantId } = useTenant();

  const defaultPrefixFor = (conn?: Connector) => {
    if (!conn) return "";
    const id = conn.id.toLowerCase();
    if (id.includes("jira")) return "jira:";
    if (id.includes("confluence")) return "conf:";
    return `${id}:`;
  };

  // detect typed prefixes at start of message
  React.useEffect(() => {
    const m = message.match(/^([a-z0-9_-]+:)/i);
    if (m && m[1]) {
      const p = m[1].toLowerCase();
      setTypedPrefix(p);
      const found =
        connectors.find((c) => (c.prefix || defaultPrefixFor(c)).toLowerCase() === p) ||
        (["jira:", "conf:"].includes(p)
          ? ({ id: p.startsWith("jira") ? "jira" : "confluence", name: p.startsWith("jira") ? "Jira" : "Confluence", prefix: p } as Connector)
          : undefined);
      if (found && found.id !== selectedConnector?.id) setSelectedConnector(found);
    } else {
      setTypedPrefix("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const removeRef = (r: ChipRef) => {
    setReferences((prev) => prev.filter((x) => !(x.connectorId === r.connectorId && x.id === r.id)));
  };

  const handleResultSelect = (item: LiveSearchItem) => {
    const label = item.title || item.key || item.name || "Selected";
    const id = (item.id as string) || label;
    const connId = selectedConnector?.id || "jira";
    setReferences((prev) => [...prev, { id, label, connectorId: connId, url: item.url }]);
    setShowSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "@") {
      if (selectedConnector?.id) {
        setShowSearch(true);
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend?.({
        message,
        connectorId: selectedConnector?.id,
        references,
        parsedPrefix: typedPrefix || selectedConnector?.prefix,
      });
      setMessage("");
      setReferences([]);
    }
  };

  return (
    <div className="relative">
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap gap-2">
          {references.map((r) => (
            <span
              key={`${r.connectorId}-${r.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-800"
            >
              {r.label}
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => removeRef(r)}
                aria-label={`Remove reference ${r.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <textarea
          className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Use prefixes like jira:, conf: then type your message. Use @ to attach related items."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
          rows={3}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Connector:</span>
            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              {typedPrefix ? `Prefix detected: ${typedPrefix}` : selectedConnector?.name || "Auto (from prefix)"}
            </span>
            <span className="text-[11px] text-gray-500">Tenant: {tenantId ?? "default"}</span>
          </div>
          <button
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            onClick={() => {
              onSend?.({
                message,
                connectorId: selectedConnector?.id,
                references,
                parsedPrefix: typedPrefix || selectedConnector?.prefix,
              });
              setMessage("");
              setReferences([]);
            }}
          >
            Send
          </button>
        </div>
      </div>
      <LiveSearch
        open={showSearch}
        onClose={() => setShowSearch(false)}
        query={message}
        connectorId={selectedConnector?.id}
        onResultSelect={handleResultSelect}
      />
    </div>
  );
}
