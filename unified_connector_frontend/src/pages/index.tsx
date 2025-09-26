import { useMemo, useState } from 'react'
import Link from 'next/link'
import { connectors } from '@/connectors'
import { apiGet } from '@/utils/api'

type ConnectorInfo = {
  id: string
  display_name: string
  supports_oauth: boolean
  required_scopes: string[]
}

export default function Home() {
  const [available, setAvailable] = useState<ConnectorInfo[] | null>(null)
  const [loading, setLoading] = useState(false)

  useMemo(() => {
    setLoading(true)
    apiGet<ConnectorInfo[]>('/connectors')
      .then(setAvailable)
      .catch(() => setAvailable([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div style={{fontWeight:700, marginBottom:12}}>Unified Connector</div>
        <nav>
          <div style={{padding:'8px 10px', background:'var(--brand-primary-subtle)', borderRadius:8, color:'var(--brand-primary)', fontWeight:600}}>Dashboard</div>
          <div style={{padding:'8px 10px', color:'var(--text-secondary)'}}>Connections</div>
          <div style={{padding:'8px 10px', color:'var(--text-secondary)'}}>Pipelines</div>
          <div style={{padding:'8px 10px', color:'var(--text-secondary)'}}>Settings</div>
        </nav>
      </aside>
      <main>
        <div className="header">
          <div style={{fontSize:12, color:'var(--text-tertiary)'}}>Welcome</div>
          <button className="btn btn-primary">Create Connection</button>
        </div>
        <div className="content">
          <section className="page-header">
            <h1 style={{fontSize:24, lineHeight:'32px', fontWeight:700, margin:'0 0 8px'}}>Connections Dashboard</h1>
            <p style={{fontSize:14, lineHeight:'22px', color:'var(--text-secondary)', margin:'0 0 16px'}}>Manage your integrations from a central interface. Use the flows below to connect via OAuth or API keys.</p>
          </section>

          <section className="connections-grid">
            <article className="connector-card">
              <div className="card-header">
                <h2 style={{fontSize:18, fontWeight:600, margin:0}}>Jira</h2>
                <Link href="https://developer.atlassian.com/cloud/jira/platform" target="_blank" className="small-link">Docs</Link>
              </div>
              <div className="method-block">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <span style={{fontSize:14, fontWeight:600}}>OAuth</span>
                  <span style={{fontSize:12, color:'var(--text-tertiary)'}}>Authenticate via browser</span>
                </div>
                <div className="actions">
                  <OAuthButton connectorId="jira" />
                  <DisconnectButton connectorId="jira" />
                </div>
              </div>
              <div className="method-block">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <span style={{fontSize:14, fontWeight:600}}>Quick Actions</span>
                  <span style={{fontSize:12, color:'var(--text-tertiary)'}}>Create issue</span>
                </div>
                <div className="actions">
                  <CreateJiraIssueButton />
                </div>
              </div>
            </article>

            <article className="connector-card">
              <div className="card-header">
                <h2 style={{fontSize:18, fontWeight:600, margin:0}}>Confluence</h2>
                <Link href="https://developer.atlassian.com/cloud/confluence" target="_blank" className="small-link">Docs</Link>
              </div>
              <div className="method-block">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <span style={{fontSize:14, fontWeight:600}}>OAuth</span>
                  <span style={{fontSize:12, color:'var(--text-tertiary)'}}>Authenticate via browser</span>
                </div>
                <div className="actions">
                  <OAuthButton connectorId="confluence" />
                  <DisconnectButton connectorId="confluence" />
                </div>
              </div>
              <div className="method-block">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <span style={{fontSize:14, fontWeight:600}}>Quick Actions</span>
                  <span style={{fontSize:12, color:'var(--text-tertiary)'}}>Create page</span>
                </div>
                <div className="actions">
                  <CreateConfluencePageButton />
                </div>
              </div>
            </article>
          </section>

          <footer style={{marginTop:16, display:'flex', gap:16, color:'var(--text-tertiary)', fontSize:12}}>
            <span>© 2025 Unified Connector</span>
            <Link href="#" className="small-link">Terms & Conditions</Link>
            <Link href="#" className="small-link">Data Privacy & Security</Link>
            <Link href="#" className="small-link">Need help? Contact support</Link>
          </footer>
        </div>
      </main>
    </div>
  )
}

function OAuthButton({ connectorId }: { connectorId: 'jira' | 'confluence' }) {
  const [busy, setBusy] = useState(false)
  return (
    <button className="btn btn-primary" disabled={busy} onClick={async ()=>{
      setBusy(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/connectors/${connectorId}/oauth/login`)
        const data = await res.json()
        window.location.href = data.authorize_url
      } finally { setBusy(false) }
    }}>{busy ? 'Redirecting...' : 'Start OAuth'}</button>
  )
}

function DisconnectButton({ connectorId }: { connectorId: 'jira' | 'confluence' }) {
  const [busy, setBusy] = useState(false)
  return (
    <button className="btn btn-danger-ghost" disabled={busy} onClick={async ()=>{
      setBusy(true)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/connectors/${connectorId}/connection`, { method:'DELETE' })
        alert('Disconnected')
      } finally { setBusy(false) }
    }}>Disconnect</button>
  )
}

function CreateJiraIssueButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button className="btn btn-secondary" disabled={busy} onClick={async ()=>{
      setBusy(true)
      try {
        const summary = prompt('Issue summary?') || 'Demo Issue'
        const project_key = prompt('Project key?') || 'DEMO'
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/connectors/jira/issues`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ project_key, summary })
        })
        const data = await res.json()
        alert(`Created issue ${data.id}`)
      } finally { setBusy(false) }
    }}>Create Issue</button>
  )
}

function CreateConfluencePageButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button className="btn btn-secondary" disabled={busy} onClick={async ()=>{
      setBusy(true)
      try {
        const space_key = prompt('Space key?') || 'DEMO'
        const title = prompt('Page title?') || 'Demo Page'
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/connectors/confluence/pages`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ space_key, title, body: 'Hello from Unified Connector' })
        })
        const data = await res.json()
        alert(`Created page ${data.id}`)
      } finally { setBusy(false) }
    }}>Create Page</button>
  )
}
