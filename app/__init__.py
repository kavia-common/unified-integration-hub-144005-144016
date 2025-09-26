# PUBLIC_INTERFACE
"""
Frontend workspace 'app' package wrapper for CI/preview import resolution.

Purpose:
- Allow 'uvicorn app.server:app' to work when the working directory is the
  frontend workspace (unified-integration-hub-144005-144016).
- Dynamically loads the actual FastAPI app defined in
  ../unified-integration-hub-144005-144014/unified_connector_backend/app/main.py,
  avoiding code duplication.

Note:
- The real application code lives under 'unified-integration-hub-144005-144014/unified_connector_backend/app'.
"""
