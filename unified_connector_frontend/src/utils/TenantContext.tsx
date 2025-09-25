"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TenantContextValue = {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
};

// PUBLIC_INTERFACE
export const TenantContext = createContext<TenantContextValue>({
  tenantId: null,
  setTenantId: () => {},
});

// PUBLIC_INTERFACE
export function useTenant() {
  /** Access the current tenant and setter */
  return useContext(TenantContext);
}

// PUBLIC_INTERFACE
export function TenantProvider({ children }: { children: React.ReactNode }) {
  /** Provides tenant across the app using localStorage persistence for session continuity. */
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("x-tenant-id");
      if (saved) setTenantIdState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    try {
      if (id) window.localStorage.setItem("x-tenant-id", id);
      else window.localStorage.removeItem("x-tenant-id");
    } catch {
      // ignore
    }
  };

  const value = useMemo(() => ({ tenantId, setTenantId }), [tenantId]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

// PUBLIC_INTERFACE
export function TenantSelector({ className }: { className?: string }) {
  /** Simple selector input for tenant header */
  const { tenantId, setTenantId } = useTenant();
  const [input, setInput] = useState(tenantId ?? "");

  useEffect(() => {
    setInput(tenantId ?? "");
  }, [tenantId]);

  return (
    <div className={className ?? ""} aria-label="Tenant selector">
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600" htmlFor="tenant-input">Tenant</label>
        <input
          id="tenant-input"
          className="h-8 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-blue-500"
          placeholder="Enter X-Tenant-ID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => setTenantId(input.trim() ? input.trim() : null)}
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setTenantId(input.trim() ? input.trim() : null)}
          aria-label="Apply tenant"
          title="Apply tenant"
        >
          Apply
        </button>
      </div>
      {tenantId ? (
        <p className="mt-1 text-[11px] text-gray-500">Using tenant: {tenantId}</p>
      ) : (
        <p className="mt-1 text-[11px] text-gray-400">Tenant not set</p>
      )}
    </div>
  );
}
