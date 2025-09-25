/**
 * Connector registry to centralize connector IDs and labels.
 */

// PUBLIC_INTERFACE
export type ConnectorDef = {
  id: 'jira' | 'confluence';
  name: string;
  description?: string;
};

// PUBLIC_INTERFACE
export const CONNECTORS: ConnectorDef[] = [
  { id: 'jira', name: 'JIRA', description: 'Atlassian Jira integration' },
  { id: 'confluence', name: 'Confluence', description: 'Atlassian Confluence integration' },
];

// PUBLIC_INTERFACE
export function getConnectorById(id: string) {
  /** Gets connector definition by id. */
  return CONNECTORS.find(c => c.id === id);
}

/**
 * Normalized Create API endpoints used by UI:
 * - POST /connectors/jira/issues
 *   Body: { title: string, description?: string, projectKey?: string, issueType?: string }
 *   Returns: normalized issue object
 *
 * - POST /connectors/confluence/pages
 *   Body: { title: string, spaceKey?: string, parentId?: string, content?: string }
 *   Returns: normalized page object
 *
 * Both require optional 'x-tenant-id' header.
 */
