import { apiDelete, apiGet, apiPost } from '@/utils/api'
import type { FrontendConnector, NormalizedItem } from './types'

export const jiraConnector: FrontendConnector = {
  id: 'jira',
  label: 'Jira',
  prefix: '@jira_',
  async search(q: string): Promise<NormalizedItem[]> {
    const res = await apiGet<{ items: NormalizedItem[] }>('/connectors/jira/search', { q, resource: 'issue', page: 1, per_page: 10 })
    return res.items
  },
  async create(payload: { project_key: string; summary: string; description?: string }) {
    return apiPost('/connectors/jira/issues', payload)
  },
  async startOAuth() {
    return apiGet<{ authorize_url: string; state: string }>('/connectors/jira/oauth/login')
  },
  async disconnect() {
    await apiDelete('/connectors/jira/connection')
  }
}
