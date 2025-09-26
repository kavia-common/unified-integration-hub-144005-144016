"use client";

import React from "react";
import "./globals.css";

/**
 * Root layout for the App Router.
 * Provides Ocean Professional theme variables and the base app shell structure (sidebar + main).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Unified Connector</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="app">
          <aside className="sidebar" role="navigation" aria-label="Primary">
            <div className="brand">
              <div className="brandGlyph" aria-hidden />
              <span className="brandText">Unified Connector</span>
            </div>
            <nav className="navList" aria-label="Sidebar">
              <a className="navItem" href="/dashboard">Dashboard</a>
              <a className="navItem" href="/(integrations)/wizard">Connections</a>
              <a className="navItem" href="/connections/placeholder">Browse</a>
              <a className="navItem" href="https://docs.example.com" target="_blank" rel="noopener">Docs</a>
            </nav>
            <div className="sidebarFooter">
              <a className="feedbackBtn" href="mailto:support@example.com" aria-label="Send feedback">Feedback</a>
              <small className="copyright">© 2025 Unified Connector</small>
            </div>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
