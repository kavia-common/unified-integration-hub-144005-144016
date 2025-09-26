# Unified Connector Frontend

This is a minimal Next.js app that can start independently of backend and database containers.
It removes implicit dependencies on a `db_visualizer` directory and on `unified_connector_backend` during startup.

How to run locally:
1) Copy `.env.example` to `.env` and set NEXT_PUBLIC_BACKEND_URL as needed (do not commit secrets).
2) Install dependencies:
   npm install
3) Start dev server:
   npm run dev
   The app will be available at http://localhost:3000

Build and start (production):
- Build: npm run build
- Start: npm start

Notes:
- No configuration is hardcoded in code. All backend URLs must come from environment variables.
- The frontend init scripts are fixed to run within this directory, so it won't attempt to cd into other containers or missing paths such as unified_connector_database/db_visualizer.
