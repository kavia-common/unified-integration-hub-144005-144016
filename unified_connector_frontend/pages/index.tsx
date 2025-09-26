import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * HomePage component: A minimal landing page that verifies the frontend runs.
 * It reads NEXT_PUBLIC_API_URL at runtime but does not require the backend to be running for build/install.
 */
export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "Inter, Helvetica Neue, Arial, sans-serif" }}>
      <h1>Unified Connector Frontend</h1>
      <p>Next.js app is running.</p>
      <p>Backend API URL (runtime env): <code>{API_URL}</code></p>
      <p style={{ color: "#6B7280", fontSize: 14 }}>
        Tip: Set NEXT_PUBLIC_API_URL in .env.local for local development. This app does not require the backend during install.
      </p>
    </main>
  );
}
