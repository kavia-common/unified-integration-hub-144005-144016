'use client';

import React from 'react';
import { searchConnector } from '@/utils/api';
import SearchResults, { NormalizedResult } from './SearchResults';

type LiveSearchProps = {
  connectorId: 'jira' | 'confluence';
  placeholder?: string;
  minChars?: number;
  debounceMs?: number;
  resourceType?: string;
  perPage?: number;
};

type RawSearchItem = {
  id?: unknown;
  key?: unknown;
  pageId?: unknown;
  issueId?: unknown;
  title?: unknown;
  summary?: unknown;
  name?: unknown;
  url?: unknown;
  link?: unknown;
  self?: unknown;
  type?: unknown;
  kind?: unknown;
  issueType?: unknown;
  pageType?: unknown;
  status?: unknown;
  state?: unknown;
  lifecycleState?: unknown;
  project?: unknown;
  projectKey?: unknown;
  space?: unknown;
  spaceKey?: unknown;
  description?: unknown;
  excerpt?: unknown;
  [k: string]: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [];
  return [val as T];
}

function asString(u: unknown): string | undefined {
  if (typeof u === 'string') return u;
  if (typeof u === 'number' || typeof u === 'boolean') return String(u);
  return undefined;
}

function normalizeResults(raw: unknown): NormalizedResult[] {
  // Accept arrays or objects with "results" or "items" arrays; fallback safe mapping.
  const arrLike = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray((raw as Record<string, unknown>).results)
    ? (raw as Record<string, unknown>).results
    : isRecord(raw) && Array.isArray((raw as Record<string, unknown>).items)
    ? (raw as Record<string, unknown>).items
    : raw;

  const items = toArray<RawSearchItem>(arrLike);

  return items.map((it: RawSearchItem) => {
    const idStr = asString(it.id) ?? asString(it.key) ?? asString(it.pageId) ?? asString(it.issueId);
    const title =
      asString(it.title) ??
      asString(it.summary) ??
      asString(it.name) ??
      asString(it.key) ??
      (idStr ? `Item ${idStr}` : 'Item');
    const url = asString(it.url) ?? asString(it.link) ?? asString(it.self);
    const type =
      asString(it.type) ??
      asString(it.kind) ??
      asString(it.issueType) ??
      asString(it.pageType);
    const status =
      asString(it.status) ??
      asString(it.state) ??
      asString(it.lifecycleState);
    const project = asString(it.project) ?? asString(it.projectKey);
    const space = asString(it.space) ?? asString(it.spaceKey);
    const summary = asString(it.description) ?? asString(it.summary) ?? asString(it.excerpt);
    return { id: idStr, title, url, type, status, project, space, summary };
  });
}

/**
 * LiveSearch renders a search input and performs debounced calls to backend /connectors/{id}/search.
 * It shows loading, error, and normalized results in real time as the user types.
 */
// PUBLIC_INTERFACE
export default function LiveSearch({
  connectorId,
  placeholder,
  minChars = 2,
  debounceMs = 300,
  resourceType,
  perPage: perPageProp,
}: LiveSearchProps) {
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<NormalizedResult[]>([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState<number | null>(null);
  const perPage = perPageProp ?? 10;
  const abortRef = React.useRef<AbortController | null>(null);
  const debTimer = React.useRef<NodeJS.Timeout | null>(null);

  const performSearch = React.useCallback(
    async (query: string, pageNum?: number, perPageNum?: number) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const raw = await searchConnector(connectorId, query, {
          resource_type: resourceType,
          page: pageNum ?? page,
          per_page: perPageNum ?? perPage,
        });
        // accept shape { items/results, total, page, per_page } or array
        const list = normalizeResults(raw);
        setResults(list);
        const asObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
        const maybeTotal =
          asObj && typeof asObj.total === 'number'
            ? (asObj.total as number)
            : Array.isArray(raw)
            ? (raw as unknown[]).length
            : null;
        if (maybeTotal !== null) setTotal(maybeTotal);
      } catch (e: unknown) {
        const hasMessage = (v: unknown): v is { message: unknown } =>
          !!v && typeof v === 'object' && 'message' in (v as Record<string, unknown>);
        const msg =
          hasMessage(e) && typeof e.message === 'string' ? e.message : 'Search failed';
        setError(msg);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [connectorId, page, perPage, resourceType]
  );

  React.useEffect(() => {
    if (debTimer.current) {
      clearTimeout(debTimer.current);
    }
    if (!q || q.trim().length < minChars) {
      setResults([]);
      setError(null);
      setLoading(false);
      setTotal(null);
      setPage(1);
      return;
    }
    debTimer.current = setTimeout(() => {
      setPage(1);
      void performSearch(q.trim(), 1, perPage);
    }, debounceMs);
    return () => {
      if (debTimer.current) clearTimeout(debTimer.current);
    };
  }, [q, minChars, debounceMs, performSearch, perPage]);

  const canPrev = page > 1;
  const canNext = total !== null ? page * perPage < total : results.length >= perPage;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder={placeholder || `Search ${connectorId === 'jira' ? 'JIRA issues' : 'Confluence pages'}...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn btn-outline"
          onClick={() => {
            if (q.trim().length >= minChars) {
              setPage(1);
              void performSearch(q.trim(), 1, perPage);
            }
          }}
        >
          Search
        </button>
      </div>
      <SearchResults connectorId={connectorId} loading={loading} error={error} results={results} />
      {(results.length > 0 || total) && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Page {page}
            {total !== null ? ` • ${(page - 1) * perPage + 1}-${(page - 1) * perPage + results.length} of ${total}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline"
              disabled={!canPrev || loading}
              onClick={() => {
                if (!canPrev) return;
                const next = page - 1;
                setPage(next);
                void performSearch(q.trim(), next, perPage);
              }}
            >
              Previous
            </button>
            <button
              className="btn btn-outline"
              disabled={!canNext || loading}
              onClick={() => {
                if (!canNext) return;
                const next = page + 1;
                setPage(next);
                void performSearch(q.trim(), next, perPage);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
