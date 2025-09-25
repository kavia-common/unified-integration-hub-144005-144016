"use client";

import React from "react";
import LiveSearch from "./LiveSearch";
import { NormalizedResult } from "./SearchResults";
import { useTenant } from "@/utils/TenantContext";

type QuickAction = {
  id: string;
  label: string;
  hint?: string;
  onRun: (text: string) => string;
};

const DEFAULT_ACTIONS: QuickAction[] = [
  { id: "summarize", label: "Summarize", hint: "Summarize selected references", onRun: (t) => `Summarize: ${t}` },
  { id: "create_issue", label: "Create JIRA Issue", hint: "Draft and create", onRun: (t) => `Create Jira issue: ${t}` },
  { id: "create_page", label: "Create Confluence Page", hint: "Draft and publish", onRun: (t) => `Create Confluence page: ${t}` },
];

export type ChatInputProps = {
  connectorId: "jira" | "confluence";
  placeholder?: string;
  onSend?: (message: { text: string; references: NormalizedResult[] }) => void;
  actions?: QuickAction[];
};

/**
 * PUBLIC_INTERFACE
 * ChatInput with @-trigger search typeahead overlay, keyboard navigation, ARIA roles,
 * chip insertion for selected references, and quick actions. Integrates LiveSearch for results preview.
 */
export default function ChatInput({ connectorId, placeholder, onSend, actions = DEFAULT_ACTIONS }: ChatInputProps) {
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = React.useState("");
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [overlayTriggerPos, setOverlayTriggerPos] = React.useState<number>(-1);
  const [references, setReferences] = React.useState<NormalizedResult[]>([]);
  const [activeTab, setActiveTab] = React.useState<"search" | "actions">("search");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const { tenantId } = useTenant();

  // Track caret position to detect @ trigger
  const onChange = (val: string) => {
    setText(val);
    const caret = taRef.current?.selectionStart ?? val.length;
    const at = val.lastIndexOf("@", caret - 1);
    if (at >= 0 && (at === 0 || /\s|[([{"'-]/.test(val[at - 1] ?? " "))) {
      setOverlayTriggerPos(at);
      setShowOverlay(true);
      setActiveTab("search");
    } else if (!val.includes("@")) {
      setShowOverlay(false);
      setOverlayTriggerPos(-1);
    }
  };

  // Insert selected reference as a chip-like markdown bracket and space
  const insertReference = (res: NormalizedResult | QuickAction) => {
    const start = overlayTriggerPos >= 0 ? overlayTriggerPos : text.length;
    const caret = taRef.current?.selectionStart ?? text.length;
    const before = text.slice(0, start);
    const after = text.slice(caret);
    if ("id" in res && (res as NormalizedResult).title !== undefined) {
      const r = res as NormalizedResult;
      const chip = `[ref:${r.id ?? r.url ?? r.title}] `;
      setText(before + chip + after);
      setReferences((prev) => [...prev, r]);
    } else {
      const act = res as QuickAction;
      const updated = act.onRun(text);
      setText(updated);
    }
    setShowOverlay(false);
    setOverlayTriggerPos(-1);
    setHighlightIndex(0);
    setActiveTab("search");
    requestAnimationFrame(() => taRef.current?.focus());
  };

  // Keyboard navigation within overlay
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showOverlay) return;
    if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "Escape") {
        setShowOverlay(false);
        return;
      }
      if (e.key === "Tab") {
        setActiveTab((t) => (t === "search" ? "actions" : "search"));
        setHighlightIndex(0);
        return;
      }
      if (e.key === "ArrowDown") {
        setHighlightIndex((i) => i + 1);
        return;
      }
      if (e.key === "ArrowUp") {
        setHighlightIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter") {
        // Enter on overlay -> accept first highlight; since LiveSearch managed list isn't here,
        // we provide simple accept of top action if actions tab, else close overlay.
        if (activeTab === "actions") {
          insertReference(actions[Math.min(highlightIndex, actions.length - 1)]);
        } else {
          // Let user select from UI panel below (click). If none, close.
          setShowOverlay(false);
        }
      }
    }
  };

  const removeReference = (id?: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSend = () => {
    const payload = { text: text.trim(), references };
    if (!payload.text && references.length === 0) return;
    onSend?.(payload);
    setText("");
    setReferences([]);
  };

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2 mb-2">
        {references.map((r) => (
          <span key={r.id ?? r.url ?? r.title} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
            {r.title ?? r.id ?? "ref"}
            <button
              aria-label="Remove reference"
              className="ml-1 text-gray-500 hover:text-gray-700"
              onClick={() => removeReference(r.id)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <textarea
          ref={taRef}
          rows={3}
          className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder={placeholder || "Type a message... Use @ to search and attach references"}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-label="Chat input"
        />
        {showOverlay && (
          <div
            role="dialog"
            aria-label="Typeahead"
            className="absolute left-0 right-0 z-20 mt-2 rounded-lg border bg-white shadow-lg"
          >
            <div className="flex items-center border-b">
              <span className="sr-only" aria-live="polite">
                {activeTab === "search" ? "Search results tab" : "Quick actions tab"}
              </span>
              <button
                className={`px-3 py-2 text-xs font-semibold ${activeTab === "search" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                onClick={() => setActiveTab("search")}
              >
                Search
              </button>
              <button
                className={`px-3 py-2 text-xs font-semibold ${activeTab === "actions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                onClick={() => setActiveTab("actions")}
              >
                Quick actions
              </button>
              <div className="ml-auto px-3 py-2 text-[11px] text-gray-500">
                Tab to switch • Esc to close
              </div>
            </div>
            <div className="p-3">
              {activeTab === "search" ? (
                <div>
                  <LiveSearch connectorId={connectorId} placeholder={`Search ${connectorId}...`} />
                  <p className="mt-2 text-[11px] text-gray-500">
                    Results will open in a new tab. Click a result to open, or paste links to attach manually.
                  </p>
                </div>
              ) : (
                <ul role="listbox" aria-label="Quick actions" className="space-y-1">
                  {actions.map((a, idx) => (
                    <li key={a.id}>
                      <button
                        role="option"
                        aria-selected={highlightIndex === idx}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                          highlightIndex === idx ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                        onClick={() => insertReference(a)}
                      >
                        <div className="font-medium text-gray-900">{a.label}</div>
                        {a.hint ? <div className="text-xs text-gray-500">{a.hint}</div> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          Press @ to search {connectorId}. Tenant: {tenantId ?? "default"}
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
