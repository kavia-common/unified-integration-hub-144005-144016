import React, { useMemo, useState } from "react";

/**
 * Ocean Professional theme tokens.
 * Using inline CSS variables for simplicity and zero extra deps.
 */
const theme = {
  primary: "#2563EB",
  secondary: "#F59E0B",
  success: "#F59E0B",
  error: "#EF4444",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
  borderSubtle: "#E5E7EB",
  borderStrong: "#D1D5DB",
  muted: "#6B7280",
  focus: "#2563EB",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Helpers
 */
function cls(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * PUBLIC_INTERFACE
 * HomePage: Ocean Professional UI. Sidebar/Main layout with forms to configure JIRA and Confluence.
 * Submits credentials to backend endpoints using runtime NEXT_PUBLIC_API_URL.
 */
export default function HomePage() {
  const [active, setActive] = useState<"dashboard" | "integrations" | "settings">("integrations");

  // Form states
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraMessage, setJiraMessage] = useState<string | null>(null);
  const [jiraError, setJiraError] = useState<string | null>(null);

  const [confUrl, setConfUrl] = useState("");
  const [confEmail, setConfEmail] = useState("");
  const [confToken, setConfToken] = useState("");
  const [confLoading, setConfLoading] = useState(false);
  const [confMessage, setConfMessage] = useState<string | null>(null);
  const [confError, setConfError] = useState<string | null>(null);

  const apiBase = useMemo(() => API_URL.replace(/\/+$/, ""), []);

  // PUBLIC_INTERFACE
  async function submitJira(e: React.FormEvent) {
    /** Submit JIRA credentials to backend API.
     * Body: { baseUrl, email, apiToken }
     * Endpoint: POST /api/integrations/jira
     */
    e.preventDefault();
    setJiraError(null);
    setJiraMessage(null);
    setJiraLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/integrations/jira`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: jiraUrl,
          email: jiraEmail,
          apiToken: jiraToken,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }
      setJiraMessage("JIRA configuration saved successfully.");
    } catch (err: any) {
      setJiraError(err?.message || "Failed to save JIRA configuration.");
    } finally {
      setJiraLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function submitConfluence(e: React.FormEvent) {
    /** Submit Confluence credentials to backend API.
     * Body: { baseUrl, email, apiToken }
     * Endpoint: POST /api/integrations/confluence
     */
    e.preventDefault();
    setConfError(null);
    setConfMessage(null);
    setConfLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/integrations/confluence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: confUrl,
          email: confEmail,
          apiToken: confToken,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }
      setConfMessage("Confluence configuration saved successfully.");
    } catch (err: any) {
      setConfError(err?.message || "Failed to save Confluence configuration.");
    } finally {
      setConfLoading(false);
    }
  }

  React.useEffect(() => {
    // Dev-time check: verify that only one global style tag exists and content matches.
    const id = "uc-global-styles";
    const nodes = typeof document !== "undefined" ? document.querySelectorAll(`style#${CSS.escape(id)}`) : null;
    if (nodes && nodes.length !== 1) {
      // eslint-disable-next-line no-console
      console.warn(`[HomePage] Expected 1 global style #${id}, found ${nodes.length}.`);
    } else if (nodes && nodes[0]) {
      const normalize = (s: string) => s.replace(/\r\n/g, "\n");
      const serverCss = normalize(nodes[0].textContent || "");
      const clientCss = normalize(globalCss);
      if (serverCss !== clientCss) {
        // eslint-disable-next-line no-console
        console.warn("[HomePage] Server/client CSS for global style differ; normalizing to client CSS.");
        nodes[0].textContent = clientCss;
      }
    }
  }, []);

  return (
    <div style={styles.appShell}>
      <GlobalStyle id="uc-global-styles" css={globalCss} />

      <aside style={styles.sidebar} role="navigation" aria-label="Primary">
        <div style={styles.brand}>
          <div style={styles.brandGlyph} aria-hidden />
          <span style={{ fontWeight: 700, color: theme.text }}>Unified Connector</span>
        </div>

        <nav aria-label="Sidebar">
          <SidebarItem
            label="Dashboard"
            active={active === "dashboard"}
            onClick={() => setActive("dashboard")}
          />
          <SidebarItem
            label="Integrations"
            active={active === "integrations"}
            onClick={() => setActive("integrations")}
          />
          <SidebarItem
            label="Settings"
            active={active === "settings"}
            onClick={() => setActive("settings")}
          />
        </nav>

        <div style={styles.sidebarFooter}>
          <button style={styles.feedbackBtn} aria-label="Send feedback">
            Feedback
          </button>
          <small style={{ color: theme.muted }}>© 2025 Unified Connector</small>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div style={{ color: theme.muted, fontSize: 12 }}>Home / Integrations</div>
          <div>
            <a
              href="https://docs.example.com"
              target="_blank"
              rel="noopener"
              style={styles.link}
            >
              Docs
            </a>
          </div>
        </header>

        <section style={styles.pageHeader}>
          <h1 style={styles.h1}>Integrations Setup</h1>
          <p style={styles.lead}>
            Enter your credentials to connect JIRA and Confluence. Your credentials are transmitted
            securely to the backend at:
            <code style={styles.code}> {apiBase}</code>
          </p>
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.h2}>Connect JIRA</h2>
              <span style={styles.updated} role="status">
                Updated: just now
              </span>
            </div>

            <form onSubmit={submitJira} aria-labelledby="jira-form-title">
              <div style={styles.methodBlock} aria-labelledby="jira-form-title">
                <div style={styles.methodHead}>
                  <span id="jira-form-title" style={styles.methodTitle}>
                    JIRA Credentials
                  </span>
                  <span style={styles.methodMeta}>Cloud or Server (PAT)</span>
                </div>

                <div style={styles.formRow}>
                  <FormField
                    id="jira-url"
                    label="JIRA URL"
                    placeholder="https://your-domain.atlassian.net"
                    value={jiraUrl}
                    onChange={(v) => setJiraUrl(v)}
                    required
                  />
                  <FormField
                    id="jira-email"
                    label="Username / Email"
                    placeholder="you@example.com"
                    value={jiraEmail}
                    onChange={(v) => setJiraEmail(v)}
                    required
                  />
                  <FormField
                    id="jira-token"
                    label="API Token"
                    placeholder="•••••••••••••••"
                    type="password"
                    value={jiraToken}
                    onChange={(v) => setJiraToken(v)}
                    required
                  />
                </div>

                <div style={styles.actions}>
                  <button
                    type="submit"
                    className={cls("btn", "btn-primary")}
                    disabled={jiraLoading}
                    aria-label="Save JIRA configuration"
                  >
                    {jiraLoading ? "Saving..." : "Save JIRA Configuration"}
                  </button>
                </div>

                {jiraMessage && <div style={styles.success}>{jiraMessage}</div>}
                {jiraError && <div style={styles.error}>{jiraError}</div>}
              </div>
            </form>
          </article>

          <article style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.h2}>Connect Confluence</h2>
              <span style={styles.updated} role="status">
                Updated: just now
              </span>
            </div>

            <form onSubmit={submitConfluence} aria-labelledby="conf-form-title">
              <div style={styles.methodBlock} aria-labelledby="conf-form-title">
                <div style={styles.methodHead}>
                  <span id="conf-form-title" style={styles.methodTitle}>
                    Confluence Credentials
                  </span>
                  <span style={styles.methodMeta}>Cloud or Server (PAT)</span>
                </div>

                <div style={styles.formRow}>
                  <FormField
                    id="conf-url"
                    label="Confluence URL"
                    placeholder="https://your-domain.atlassian.net/wiki"
                    value={confUrl}
                    onChange={(v) => setConfUrl(v)}
                    required
                  />
                  <FormField
                    id="conf-email"
                    label="Username / Email"
                    placeholder="you@example.com"
                    value={confEmail}
                    onChange={(v) => setConfEmail(v)}
                    required
                  />
                  <FormField
                    id="conf-token"
                    label="API Token"
                    placeholder="•••••••••••••••"
                    type="password"
                    value={confToken}
                    onChange={(v) => setConfToken(v)}
                    required
                  />
                </div>

                <div style={styles.actions}>
                  <button
                    type="submit"
                    className={cls("btn", "btn-primary")}
                    disabled={confLoading}
                    aria-label="Save Confluence configuration"
                  >
                    {confLoading ? "Saving..." : "Save Confluence Configuration"}
                  </button>
                </div>

                {confMessage && <div style={styles.success}>{confMessage}</div>}
                {confError && <div style={styles.error}>{confError}</div>}
              </div>
            </form>
          </article>
        </section>

        <footer style={styles.footerRow}>
          <span style={{ color: theme.muted }}>All changes are saved securely.</span>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.link}>
              Terms & Conditions
            </a>
            <span aria-hidden>·</span>
            <a href="#" style={styles.link}>
              Data Privacy & Security
            </a>
            <span aria-hidden>·</span>
            <a href="#" style={styles.link}>
              Need help? Contact support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

/**
 * Utilities and components
 */
/**
 * PUBLIC_INTERFACE
 * GlobalStyle: Injects raw CSS into a <style> tag using dangerouslySetInnerHTML to ensure the CSS
 * is not HTML-escaped between server and client. Use an id to avoid duplicate style tags.
 */
function GlobalStyle({ css, id }: { css: string; id?: string }) {
  /**
   * Ensure that exactly one style tag with the provided id exists on the client.
   * This guards against React 18 StrictMode double-invocation during development
   * that can momentarily render components twice.
   */
  React.useEffect(() => {
    if (!id || typeof document === "undefined") return;
    const all = Array.from(document.querySelectorAll<HTMLStyleElement>(`style#${CSS.escape(id)}`));
    if (all.length > 1) {
      // Keep the first, remove the rest to avoid double style blocks.
      for (let i = 1; i < all.length; i += 1) {
        all[i].parentElement?.removeChild(all[i]);
      }
    }
    // Verify server/client textContent match (dev aid)
    const el = document.getElementById(id) as HTMLStyleElement | null;
    if (el && typeof el.textContent === "string") {
      // Normalize endings to avoid platform newline differences
      const normalize = (s: string) => s.replace(/\r\n/g, "\n");
      const serverCss = normalize(el.textContent);
      const clientCss = normalize(css);
      if (serverCss !== clientCss) {
        // In dev, warn if a mismatch is detected.
        // This should not happen since we inject the same string on both sides.
        // eslint-disable-next-line no-console
        console.warn(`[GlobalStyle] CSS content mismatch for #${id}.`);
        // Align to client version to avoid hydration warning loops.
        el.textContent = clientCss;
      }
    }
  }, [css, id]);

  // Render a single <style> tag with raw CSS only, no quotes/arrays, once.
  return <style id={id} dangerouslySetInnerHTML={{ __html: css }} suppressHydrationWarning />;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cls("sidebar-item", active && "active")}
      aria-current={active ? "page" : undefined}
    >
      <span>{label}</span>
      <style jsx>{`
        .sidebar-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          color: ${theme.muted};
          background: transparent;
          cursor: pointer;
          font-weight: 600;
        }
        .sidebar-item:hover {
          background: #eef2ff;
          color: ${theme.primary};
        }
        .sidebar-item.active {
          background: #eef2ff;
          color: ${theme.primary};
          border-color: ${theme.primary}20;
        }
      `}</style>
    </button>
  );
}

function FormField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        style={styles.input}
      />
    </div>
  );
}

/**
 * Styles
 */
const styles: { [k: string]: React.CSSProperties } = {
  appShell: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "100vh",
    background: theme.background,
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif",
    color: theme.text,
  },
  sidebar: {
    background: theme.surface,
    borderRight: `1px solid ${theme.borderSubtle}`,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    marginBottom: 8,
  },
  brandGlyph: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}22)`,
    border: `1px solid ${theme.borderSubtle}`,
  },
  sidebarFooter: {
    marginTop: "auto",
    display: "flex",
    gap: 8,
    flexDirection: "column",
  },
  feedbackBtn: {
    height: 32,
    padding: "0 12px",
    borderRadius: 999,
    border: `1px solid ${theme.borderSubtle}`,
    background: "#F2F4F8",
    color: theme.text,
    fontWeight: 600,
    cursor: "pointer",
  },
  main: {
    padding: "24px 32px",
    maxWidth: 1240,
    width: "100%",
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageHeader: {
    marginBottom: 16,
  },
  h1: {
    fontSize: 24,
    lineHeight: "32px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  lead: {
    fontSize: 14,
    lineHeight: "22px",
    color: theme.muted,
    margin: 0,
  },
  code: {
    marginLeft: 6,
    padding: "2px 6px",
    borderRadius: 6,
    background: "#eef2ff",
    border: `1px solid ${theme.borderSubtle}`,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  card: {
    background: theme.surface,
    border: `1px solid ${theme.borderSubtle}`,
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  h2: {
    fontSize: 18,
    lineHeight: "26px",
    fontWeight: 600,
    margin: 0,
  },
  updated: {
    fontSize: 12,
    color: theme.muted,
  },
  methodBlock: {
    border: `1px solid ${theme.borderStrong}`,
    borderRadius: 10,
    padding: 12,
  },
  methodHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
  methodMeta: {
    fontSize: 12,
    color: theme.muted,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    marginBottom: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.muted,
  },
  input: {
    height: 40,
    borderRadius: 8,
    border: `1px solid ${theme.borderSubtle}`,
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-start",
  },
  success: {
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#ECFDF5",
    color: "#065F46",
    border: "1px solid #A7F3D0",
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FECACA",
    fontSize: 14,
  },
  footerRow: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  footerLinks: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  link: {
    color: theme.primary,
    textDecoration: "none",
    fontWeight: 600,
  },
};

/**
 * Global CSS for buttons and focus rings, plus responsive tweaks.
 */
const globalCss = `
  :root {
    --focus-ring: ${theme.focus};
  }
  *:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
  .btn {
    height: 36px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background-color 120ms ease-in-out, opacity 120ms ease-in-out;
  }
  .btn-primary {
    background: ${theme.primary};
    color: #fff;
  }
  .btn-primary:hover {
    background: #1E40AF;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 991px) {
    /* Stack grid to one column */
    main > section:nth-of-type(2) {
      display: grid !important;
      grid-template-columns: 1fr !important;
    }
  }
`;
