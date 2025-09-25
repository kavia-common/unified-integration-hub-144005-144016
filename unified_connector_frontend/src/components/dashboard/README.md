# Dashboard Components

This directory contains reusable dashboard UI pieces like env cards and summaries.

Notes:
- ChatInput supports typed prefixes like `jira:` and `conf:` to auto-select connectors. Users may also type `@` to open LiveSearch and add results as reference chips.
- Jira and Confluence modals send payloads matching backend OpenAPI:
  - Jira: { project_key, summary, issuetype?, description? }
  - Confluence: { space_key, title, body }
- LiveSearch overlay includes ARIA roles and keyboard navigation (↑/↓/Enter, Esc to close) for accessibility.
