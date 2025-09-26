import { apiDelete, apiGet, apiPost } from '@/utils/api'
import type { FrontendConnector, NormalizedItem } from './types'

export const confluenceConnector: FrontendConnector = {
  id: 'confluence',
  label: 'Confluence',
  prefix: '@confluence_',
  async search(q: string): Promise<NormalizedItem[]> {
    const res = await apiGet<{ items: NormalizedItem[] }>('/connectors/confluence/search', { q, resource: 'page', page: 1, per_page: 10 })
    return res.items
  },
  async create(payload: { space_key: string; title: string; body?: string }) {
    return apiPost('/connectors/confluence/pages', payload)
  },
  async startOAuth() {
    return apiGet<{ authorize_url: string; state: string }>('/connectors/confluence/oauth/login')
  },
  async disconnect() {
    await apiDelete('/connectors/confluence/connection')
  }
}
