# Unified Connector Frontend (Next.js)

Frontend UI for connecting and managing integrations (Jira, Confluence). Provides:
- Connector dashboard with live connection status
- OAuth login/callback flow
- Search interfaces for Jira and Confluence
- Create modals (Jira issue, Confluence page)
- Multi-tenant support via x-tenant-id header

## Quick Start

Prerequisites:
- Node.js 18+ and npm (or pnpm/yarn)
- A running backend (FastAPI) that implements the OpenAPI spec exposed at /openapi.json
- Backend URL (publicly reachable or reachable from the browser)

Install and run:
```bash
# from unified-integration-hub-144005-144016/unified_connector_frontend
npm install
# set env (see .env.example below)
npm run dev
# open http://localhost:3000/connectors
```

Build for production:
```bash
npm run build
npm run start
```

## Environment Variables

Create a `.env.local` (or use your deployment platform’s env settings).

Recommended variables:
- NEXT_PUBLIC_BACKEND_URL: Base URL for backend API, e.g. https://your-backend.example.com

Example `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=https://vscode-internal-11312-beta.beta01.cloud.kavia.ai:3001
```

Notes:
- We never hardcode secrets in code. Configure backend credentials in the backend’s environment (server-side).
- Tenant ID is read from localStorage key x-tenant-id and also overridable per call in code.

## Multi-Tenant Behavior

- The UI sends x-tenant-id header on API calls if present in localStorage.
- You can also specify tenant per operation (e.g., Create modals accept tenantId props).
- On the Connectors page, you can type a tenant id in the input to use for create actions (and you can set localStorage manually if needed):
  - In browser console: localStorage.setItem('x-tenant-id', 'demo-tenant')

Important: Because OAuth login is performed by redirecting the browser to the backend, we cannot attach headers at navigation time. The backend should persist tenant context using its own state (e.g., via generated OAuth state param that is mapped to the tenant server-side). The callback API call from the frontend includes x-tenant-id via headers. Ensure backend maps OAuth session/tenant accordingly.

## OAuth Flow

- Connect button navigates to: GET /connectors/{connector_id}/oauth/login?redirect_to={our_callback}
- Provider redirects back to frontend: /oauth/callback?connector_id=...&code=...&state=...
- Frontend completes via GET /connectors/{connector_id}/oauth/callback?code=...&state=...
- On success, user is redirected to /connectors with a success banner.

Callback page: src/app/oauth/callback/page.tsx
Login URL build: src/utils/api.ts buildOAuthLoginUrl

## Connection Status Sync

- On /connectors, we load all connector statuses with fetchAllConnectorStatuses.
- Each ConnectorCard also loads its specific status and shows:
  - Status pill (Connected / Disconnected / Checking…)
  - Optional metadata and last refresh time if provided by backend
  - Error states inline
- Disconnect uses DELETE /connectors/{id}/connection (if available) with fallback to POST /connectors/{id}/disconnect per backend spec.
- After connect (OAuth success) and disconnect, the UI refreshes status.

## Search and Create

- LiveSearch calls GET /connectors/{id}/search?q=... and normalizes results for a consistent UI.
- Create modals:
  - Jira: POST /connectors/jira/issues with normalized body { title, description?, projectKey?, issueType? }
  - Confluence: POST /connectors/confluence/pages with normalized body { title, spaceKey?, parentId?, content? }
- Success and error feedback is shown in the modal; after success the modal auto-closes.

## Production Readiness Checklist

- Configure NEXT_PUBLIC_BACKEND_URL to point to your backend.
- Ensure backend handles:
  - x-tenant-id header
  - OAuth login and callback endpoints
  - Connect/Disconnect endpoints
  - Search endpoints for jira/confluence
  - Create endpoints used by the UI (as above)
- Confirm CORS and cookies (if any) are allowed from frontend origin.
- Validate that OAuth redirect URL configured at the provider includes:
  - https://<frontend-domain>/oauth/callback
- Confirm tenant isolation: Using different tenant ids yields separate stored credentials and search results.

## Developer Onboarding

Key files:
- src/utils/api.ts: API wrapper (tenant handling, JSON, OAuth helpers).
- src/utils/status.ts: Status fetchers (per-connector and bulk).
- src/connectors/index.ts: Registry and docs for normalized endpoints.
- src/components/integrations/*: UI components (connector card, connect button, search, modals).
- src/app/connectors/page.tsx: Dashboard page.
- src/app/oauth/callback/page.tsx: OAuth callback page.

Run local with a live backend:
1) Start backend (see backend README).
2) Set NEXT_PUBLIC_BACKEND_URL in frontend.
3) Open /connectors and perform flows end-to-end.

## Basic Manual QA Guide

1) Connect Flow:
- Click Connect on Jira / Confluence
- Complete provider auth
- On callback, confirm success and redirect to /connectors with banner
- Status pill should show Connected

2) Disconnect Flow:
- Click Disconnect on a connected connector
- Confirm status switches to Disconnected; Refresh status works

3) OAuth Roundtrip:
- Ensure code/state query params arrive
- Callback completes and persists connection server-side

4) Search:
- Type a query (>=2 chars)
- Observe loading, results or errors; results normalized with title/link/status/type

5) Create:
- Jira Issue: title required; show validation if missing; on success show confirmation
- Confluence Page: title required; same behavior

6) Multi-tenant:
- Change tenant id (localStorage or UI input for create)
- Validate connections, search and create are isolated per tenant

7) Error and Loading:
- Disconnect while not connected shows friendly error
- Backend errors display clear messages; loading indicators appear appropriately

## License

Internal / project license.
