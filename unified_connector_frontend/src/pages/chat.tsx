import { useEffect, useMemo, useRef, useState } from 'react'
import { connectors } from '@/connectors'
import type { NormalizedItem } from '@/connectors/types'
import clsx from 'clsx'

export default function Chat() {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<NormalizedItem[]>([])
  const [active, setActive] = useState(0)
  const [currentPrefix, setCurrentPrefix] = useState<'@jira_' | '@confluence_' | null>(null)
  const delayRef = useRef<number | null>(null)

  useEffect(()=>{
    const match = text.match(/(@jira_|@confluence_)([^\s]{2,})$/)
    if (match) {
      const prefix = match[1] as '@jira_' | '@confluence_'
      const q = match[2]
      setCurrentPrefix(prefix)
      setOpen(true)
      if (delayRef.current) window.clearTimeout(delayRef.current)
      delayRef.current = window.setTimeout(async ()=>{
        const connector = connectors.find(c => c.prefix === prefix)
        if (connector) {
          try {
            const items = await connector.search(q)
            setResults(items)
            setActive(0)
          } catch {
            setResults([])
          }
        }
      }, 250) as unknown as number
    } else {
      setOpen(false)
      setResults([])
    }
  }, [text])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a+1, results.length-1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a-1, 0)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) {
        insertChip(results[active])
      }
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const insertChip = (item: NormalizedItem)=>{
    if (!currentPrefix) return
    const before = text.replace(/(@jira_|@confluence_)[^\s]*$/, '')
    const chip = `[${item.type.toUpperCase()} ${item.id}]`
    setText(before + chip + ' ')
    setOpen(false)
  }

  return (
    <div className="content">
      <h1>Chat with Connectors</h1>
      <p style={{color:'var(--text-secondary)'}}>Type @jira_ or @confluence_ then your query to search and insert references.</p>
      <div style={{position:'relative', marginTop:12}}>
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Try: @jira_login"
          style={{width:'100%', height:120, border:'1px solid var(--border-subtle)', borderRadius:8, padding:12, fontSize:14}}
        />
        {open && (
          <div className="overlay" role="dialog" aria-label="Search results">
            <div className="overlay-list">
              {results.map((r, idx)=>(
                <div key={r.id} className={clsx('overlay-item', idx===active && 'active')} onMouseDown={(e)=>{e.preventDefault(); insertChip(r)}}>
                  <div style={{fontWeight:600}}>{r.title}</div>
                  <div style={{fontSize:12, color:'var(--text-tertiary)'}}>{r.subtitle || r.type} {r.url ? `• ${r.url}` : ''}</div>
                </div>
              ))}
              {results.length===0 && <div style={{fontSize:14, color:'var(--text-tertiary)'}}>No results</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
