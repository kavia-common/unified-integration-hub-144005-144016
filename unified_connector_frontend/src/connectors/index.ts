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
