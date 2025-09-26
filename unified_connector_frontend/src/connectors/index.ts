import { jiraConnector } from './jira'
import { confluenceConnector } from './confluence'
import type { FrontendConnector } from './types'

export const registry: Record<string, FrontendConnector> = {
  jira: jiraConnector,
  confluence: confluenceConnector
}

export const connectors: FrontendConnector[] = [jiraConnector, confluenceConnector]
