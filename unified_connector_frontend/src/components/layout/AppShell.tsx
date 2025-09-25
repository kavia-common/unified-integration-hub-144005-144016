"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TenantSelector } from "@/utils/TenantContext";

/**
 * AppShell builds the fixed sidebar, sticky header, and scrollable main content
 * following the style guide and connections dashboard notes.
 */
export interface AppShellProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

// PUBLIC_INTERFACE
export default function AppShell({ title, subtitle, actionLabel, onAction, children }: AppShellProps) {
  const pathname = usePathname();
  const isActive = (href: string) => (pathname === href ? "active" : "");

  return (
    <div className="app-grid">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="sidebar-inner">
          <div className="sidebar-brand">Unified Connector</div>
          <nav className="sidebar-nav" role="navigation" aria-label="Main">
            <Link className={`sidebar-item ${isActive("/")}`} href="/">
              Dashboard
            </Link>
            <Link className={`sidebar-item ${isActive("/connectors")}`} href="/connectors">
              Connections
            </Link>
            <Link className={`sidebar-item ${isActive("/pipelines")}`} href="/pipelines">
              Pipelines
            </Link>
            <Link className={`sidebar-item ${isActive("/settings")}`} href="/settings">
              Settings
            </Link>
          </nav>
          <div className="sidebar-footer">© 2025</div>
        </div>
      </aside>

      <header className="app-header">
        <div className="header-left">
          <TenantSelector />
        </div>
        <div className="header-center">Welcome</div>
        <div className="header-right">
          {actionLabel ? (
            <button className="btn btn-primary" onClick={onAction} type="button">
              {actionLabel}
            </button>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        {title || subtitle ? (
          <div className="page-header">
            {title ? <h1 className="page-title">{title}</h1> : null}
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
