'use client';

import React from 'react';
import { searchConnector } from '@/utils/api';

export type LiveSearchItem = {
  id?: string;
  title?: string;
  key?: string;
  name?: string;
  subtitle?: string;
  summary?: string;
  url?: string;
  [k: string]: unknown;
};

type LiveSearchProps = {
  query: string;
  connectorId?: string;
  onResultSelect?: (item: LiveSearchItem) => void;
  open: boolean;
  onClose: () => void;
};

function labelFor(item: LiveSearchItem) {
  return item.title || item.key || item.name || 'Result';
}

/**
 * PUBLIC_INTERFACE
 * LiveSearch
 * An overlay list that fetches connector search results and supports keyboard navigation.
 * Props:
 * - query: search query string
 * - connectorId: selected connector id to route the search
 * - onResultSelect: callback when a result is chosen
 * - open: whether overlay is visible
 * - onClose: close the overlay
 */
export default function LiveSearch({
  query,
  connectorId,
  onResultSelect,
  open,
  onClose,
}: LiveSearchProps) {
  const [results, setResults] = React.useState<LiveSearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fetch results when open + query + connectorId
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!open || !query || !connectorId) {
        setResults([]);
        setActiveIndex(-1);
        return;
      }
      try {
        setLoading(true);
        const res = (await searchConnector(connectorId, query)) as unknown;
        const obj = (res && typeof res === 'object' ? (res as Record<string, unknown>) : null);
        const items: LiveSearchItem[] = ((obj?.items as unknown) ||
          (obj?.results as unknown) ||
          res ||
          []) as LiveSearchItem[];
        if (!cancelled) {
          setResults(items);
          setActiveIndex(items.length ? 0 : -1);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setResults([]);
          setActiveIndex(-1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, query, connectorId]);

  // Close on Escape or clicking outside
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onDocClick);
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open, onClose]);

  // Keyboard navigation
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (!results.length) return;
      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < results.length) {
          onResultSelect?.(results[activeIndex]);
        }
      }
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, results, activeIndex, onResultSelect]);

  if (!open) return null;

  return (
    <div
      className="absolute z-50 mt-2 w-full"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Live search results"
    >
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
        <div className="px-3 py-2 text-xs text-gray-500" aria-live="polite" aria-atomic="true">
          {loading ? 'Searching…' : results.length ? 'Results' : 'No results'}
        </div>
        <ul
          className="max-h-64 overflow-auto outline-none"
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? `livesearch-option-${activeIndex}` : undefined}
          tabIndex={-1}
        >
          {results.map((item, idx) => {
            const label = labelFor(item);
            const sub = item.subtitle || item.summary;
            const active = idx === activeIndex;
            return (
              <li
                key={item.id || `${label}-${idx}`}
                id={`livesearch-option-${idx}`}
                role="option"
                aria-selected={active}
                className={`cursor-pointer px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 ${
                  active ? 'bg-blue-50' : ''
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => onResultSelect && onResultSelect(item)}
              >
                <div className="text-sm font-medium text-gray-900">{label}</div>
                {sub ? <div className="text-xs text-gray-600">{sub}</div> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
