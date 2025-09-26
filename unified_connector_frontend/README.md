# Unified Connector Frontend

Next.js (TypeScript) frontend for managing integrations. Uses App Router and works independently from backend at install time.

## Scripts
- `npm run dev` — Start dev server at http://localhost:3000
- `npm run build` — Build production bundle
- `npm start` — Start production server at http://localhost:3000

## Environment Variables
Create a `.env.local` (do not commit) and set the following (or copy `.env.example`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_TENANT_ID=demo-tenant
```

During development, the backend is optional; the UI will render and surface friendly errors if API is unavailable.

## Notes
- No postinstall scripts perform network calls.
- API client reads `NEXT_PUBLIC_API_BASE_URL` at runtime and gracefully handles absence/errors with user-friendly banners.
- Primary pages:
  - `/dashboard` — connections overview
  - `/(integrations)/wizard` — connect Jira/Confluence
  - `/connections/[id]` — browse containers/items
