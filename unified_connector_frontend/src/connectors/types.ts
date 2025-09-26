export type NormalizedItem = {
  id: string;
  title: string;
  url?: string;
  type: string;
  subtitle?: string;
};

export type FrontendConnector = {
  id: 'jira' | 'confluence';
  label: string;
  prefix: '@jira_' | '@confluence_';
  search: (q: string) => Promise<NormalizedItem[]>;
  create?: (payload: any) => Promise<any>;
  startOAuth: () => Promise<{ authorize_url: string; state: string }>;
  disconnect: () => Promise<void>;
};
