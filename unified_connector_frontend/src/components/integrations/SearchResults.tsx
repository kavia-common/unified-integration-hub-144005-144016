'use client';

import React from 'react';

export type NormalizedResult = {
  id?: string;
  title?: string;
  url?: string;
  type?: string; // e.g., "issue" or "page"
  summary?: string;
  status?: string;
  project?: string;
  space?: string;
  [k: string]: unknown;
};

type SearchResultsProps = {
  connectorId: 'jira' | 'confluence';
  loading: boolean;
  error: string | null;
  results: NormalizedResult[];
};

function typeBadge(type?: string) {
  if (!type) return null;
  const badgeClass =
    type.toLowerCase() === 'issue'
      ? 'bg-blue-50 text-blue-700'
      : type.toLowerCase() === 'page'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
      {type}
    </span>
  );
}

/**
 * Renders normalized search results in a clean block style with loading and error states.
 */
// PUBLIC_INTERFACE
export default function SearchResults({ connectorId, loading, error, results }: SearchResultsProps) {
  return (
    <div className="mt-3">
      {loading && (
        <div className="rounded-md border bg-white p-3 text-sm text-gray-700">Searching {connectorId}...</div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && results.length === 0 && (
        <div className="rounded-md border bg-white p-3 text-sm text-gray-500">No results.</div>
      )}
      <ul className="space-y-2">
        {results.map((r, idx) => {
          const key = r.id || r.url || String(idx);
          return (
            <li key={key} className="rounded-md border bg-white p-3 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={r.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-gray-900 hover:underline truncate"
                      title={r.title}
                    >
                      {r.title || 'Untitled'}
                    </a>
                    {typeBadge(r.type)}
                    {r.status && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {r.status}
                      </span>
                    )}
                  </div>
                  {r.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{r.summary}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {r.project && <span>Project: {r.project}</span>}
                    {r.space && <span>Space: {r.space}</span>}
                    {r.id && <span>ID: {r.id}</span>}
                  </div>
                </div>
                {r.url && (
                  <a
                    className="shrink-0 btn btn-outline"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
