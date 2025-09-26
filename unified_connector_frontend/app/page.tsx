"use client";

function Pill({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      fontSize: 12,
      fontWeight: 600,
      borderRadius: 999,
      background: "var(--badge-neutral-bg, #F2F4F8)",
      color: "var(--text-secondary, #4B5565)"
    }}>{label}</span>
  );
}

// PUBLIC_INTERFACE
export default function HomePage() {
  /** This is the public entry for the default route (/) in the Next.js app. */
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{
        background: "var(--bg-surface, #ffffff)",
        borderRight: "1px solid var(--border-subtle, #E5E7EB)",
        padding: 16
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Unified Connector</div>
        <nav style={{ display: "grid", gap: 8 }}>
          <a href="#" aria-current="page" style={{
            textDecoration: "none",
            color: "#111827",
            background: "var(--brand-primary-subtle, #EEF0FF)",
            padding: "8px 12px",
            borderRadius: 8
          }}>Dashboard</a>
          <a href="#" style={{ textDecoration: "none", color: "#4B5565", padding: "8px 12px", borderRadius: 8 }}>Connections</a>
          <a href="#" style={{ textDecoration: "none", color: "#4B5565", padding: "8px 12px", borderRadius: 8 }}>Pipelines</a>
          <a href="#" style={{ textDecoration: "none", color: "#4B5565", padding: "8px 12px", borderRadius: 8 }}>Settings</a>
        </nav>
      </aside>
      <main style={{ padding: "24px 32px" }}>
        <header style={{
          background: "var(--bg-surface, #ffffff)",
          border: "1px solid var(--border-subtle, #E5E7EB)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 2px rgba(16,24,40,0.06)"
        }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary, #6B7280)" }}>Welcome</div>
            <h1 style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>Connections Dashboard</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-secondary, #4B5563)" }}>
              Manage your integrations from a central interface. Start the frontend independently; backend URL is configurable.
            </p>
          </div>
          <button
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--btn-primary-bg, #2563EB)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
            aria-label="Create Connection"
          >
            Create Connection
          </button>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <article style={{
            background: "var(--bg-surface, #ffffff)",
            border: "1px solid var(--border-subtle, #E5E7EB)",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 2px rgba(16,24,40,0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>SaaS Connectors</h2>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Updated: just now</span>
            </div>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "#fff", border: "1px solid #E5E7EB" }} />
                  <strong>HubSpot</strong>
                  <Pill label="Not Connected" />
                </div>
                <a href="#" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none" }}>Docs</a>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600 }}>Start OAuth</button>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", color: "#111827", fontWeight: 600 }}>Import Now</button>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: "#F59E0B", color: "#fff", fontWeight: 700 }}>Create Pull</button>
              </div>
            </div>
          </article>

          <article style={{
            background: "var(--bg-surface, #ffffff)",
            border: "1px solid var(--border-subtle, #E5E7EB)",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 2px rgba(16,24,40,0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Database Connectors</h2>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Updated: just now</span>
            </div>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "#fff", border: "1px solid #E5E7EB" }} />
                  <strong>PostgreSQL</strong>
                  <Pill label="Not Configured" />
                </div>
                <a href="#" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none" }}>Docs</a>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600 }}>Test Connect</button>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", color: "#111827", fontWeight: 600 }}>Run Query</button>
                <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: "#F59E0B", color: "#fff", fontWeight: 700 }}>Create Pull</button>
              </div>
            </div>
          </article>
        </section>

        <footer style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "#6B7280", fontSize: 12 }}>Backend URL (configurable): {backendUrl}</span>
          <a href="#" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none" }}>Changelog</a>
          <a href="#" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none" }}>System Status</a>
          <a href="#" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none" }}>Docs</a>
        </footer>
      </main>
    </div>
  );
}
