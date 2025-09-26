# Unified Connector Frontend (Next.js)

Admin UI to manage Jira/Confluence connections and a chat overlay that recognizes @jira_ / @confluence_ prefixes.

## Dev

1. Copy `.env.example` to `.env.local` and set NEXT_PUBLIC_API_URL
2. Install deps:

   npm install

3. Run:

   npm run dev

Open http://localhost:3000

## Pages

- `/` Admin dashboard for connectors
- `/chat` Chat input with selector overlay

## Registry

See `src/connectors/*` for registry definitions and fetch utilities.
