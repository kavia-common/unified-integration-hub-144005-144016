# Unified Connector Frontend (App Router)

This Next.js (App Router) frontend provides:
- Integrations Wizard to connect Jira and Confluence via OAuth or PAT
- Dashboard listing connections with validate/revoke/view actions
- Connection browser to view containers, items, detail, comments, and raw JSON

Quick start
1) Install dependencies
   npm install
2) Create a .env.local using .env.example
3) Run the dev server
   npm run dev
4) Open http://localhost:3000/dashboard or http://localhost:3000/(integrations)/wizard

Environment variables
- NEXT_PUBLIC_API_BASE_URL: Base URL of backend REST API (e.g., http://localhost:3001)
- NEXT_PUBLIC_TENANT_ID: Tenant identifier to use in X-Tenant-Id header

Pages
- /dashboard
- /(integrations)/wizard
- /connections/[id]

Notes
- All API calls include X-Tenant-Id
- Errors are surfaced via ErrorBanner
- OAuth returns to the wizard page; callback is handled from URL params
- The UI degrades gracefully if backend is not available (shows banner errors)
