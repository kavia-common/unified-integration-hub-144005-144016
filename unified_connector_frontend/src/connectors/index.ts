/**
 * Connector registry to centralize connector IDs and labels.
 */

export type ConnectorDef = {
  id: 'jira' | 'confluence';
  name: string;
  description?: string;
};

export const CONNECTORS: ConnectorDef[] = [
  { id: 'jira', name: 'JIRA', description: 'Atlassian Jira integration' },
  { id: 'confluence', name: 'Confluence', description: 'Atlassian Confluence integration' },
];

export function getConnectorById(id: string) {
  return CONNECTORS.find(c => c.id === id);
}
