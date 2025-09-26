# Unified Connector Frontend

Next.js (TypeScript) frontend for managing integrations. This scaffold avoids any backend dependency during `npm install` and can start independently.

## Scripts
- `npm run dev` — Start dev server at http://localhost:3000
- `npm run build` — Build production bundle
- `npm start` — Start production server at http://localhost:3000

## Environment Variables
Create a `.env.local` (do not commit) and set the following (example):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

During development, the backend is optional; the UI will render without it.

## Notes
- No postinstall scripts perform network calls.
- API client code should read `NEXT_PUBLIC_API_URL` at runtime and handle backend being absent gracefully.
