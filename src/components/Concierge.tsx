import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { byId, hoodOf, img, priceLabel } from '../data'
import { answerLocal, SUGGESTIONS } from '../lib/concierge-local'
import { go } from '../lib/router'
import { chat, useChatOpen } from '../lib/store'
import { reducedMotion } from '../lib/anim'
import '../styles/concierge.css'

type Msg = { role: 'user' | 'assistant'; content: string }
type Engine = 'unknown' | 'claude' | 'offline'

const STORE = 'arca-chat'
const loadMsgs = (): Msg[] => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) ?? '[]')
  } catch {
    return []
  }
}

/* ---------------- rich text: **bold**, "- " lists, [[listing:id]] cards ---------------- */

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  )
}

function ListingCard({ id }: { id: string }) {
  const l = byId(id)
  if (!l) return null
  return (
    <button
      className="cc-card"
      onClick={() => {
        go(`/listing/${l.id}`)
        if (window.matchMedia('(max-width: 640px)').matches) chat.close()
      }}
    >
      <img src={img(l.photos[0], 400)} alt="" loading="lazy" />
      <span className="cc-card-body">
        <span className="cc-card-title">{l.title}</span>
        <span className="cc-card-meta">
          {hoodOf(l.hood).name} · {l.beds ? `${l.beds} bd` : 'Studio'} · {l.area} m²
        </span>
        <span className="cc-card-price">{priceLabel(l)}</span>
      </span>
      <span className="cc-card-go" aria-hidden>
        ↗
      </span>
    </button>
  )
}

function Rich({ text }: { text: string }) {
  // hide a half-streamed token like "[[listing:pn-"
  const clean = text.replace(/\[\[[^\]]*\]?$/, '')
  const blocks: ReactNode[] = []
  let list: string[] = []
  const flush = () => {
    if (!list.length) return
    blocks.push(
      <ul key={`ul${blocks.length}`}>
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    )
    list = []
  }
  clean.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    const card = line.match(/^\[\[listing:([\w-]+)\]\]$/)
    if (/^[-*•]\s+/.test(line)) {
      list.push(line.replace(/^[-*•]\s+/, ''))
      return
    }
    flush()
    if (card) blocks.push(<ListingCard key={`c${i}`} id={card[1]} />)
    else if (line) blocks.push(<p key={`p${i}`}>{inline(line.replace(/\[\[listing:[\w-]+\]\]/g, ''))}</p>)
  })
  flush()
  return <>{blocks}</>
}

function Orb({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`cc-orb is-${size}`} aria-hidden>
      <i />
    </span>
  )
}

/* ---------------- component ---------------- */

export function Concierge() {
  const open = useChatOpen()
  const [msgs, setMsgs] = useState<Msg[]>(loadMsgs)
  const [engine, setEngine] = useState<Engine>('unknown')
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const abort = useRef<AbortController | null>(null)
  const timer = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs))
    } catch {
      /* storage blocked */
    }
  }, [msgs])

  // keep the newest message in view while streaming
  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, open])

  const appendToLast = (t: string) =>
    setMsgs((m) => {
      const next = m.slice()
      const last = next[next.length - 1]
      next[next.length - 1] = { ...last, content: last.content + t }
      return next
    })

  /** Type out an offline reply word by word so it feels like the live model. */
  const typeOut = (reply: string) =>
    new Promise<void>((done) => {
      if (reducedMotion()) {
        appendToLast(reply)
        return done()
      }
      const parts = reply.match(/\S+\s*|\s+/g) ?? [reply]
      let i = 0
      const tick = () => {
        if (i >= parts.length) return done()
        appendToLast(parts.slice(i, i + 3).join(''))
        i += 3
        timer.current = window.setTimeout(tick, 28)
      }
      timer.current = window.setTimeout(tick, 380)
    })

  const send = useCallback(
    async (text: string) => {
      const q = text.trim()
      if (!q || busy) return
      const history: Msg[] = [...msgs, { role: 'user', content: q }]
      setMsgs([...history, { role: 'assistant', content: '' }])
      setDraft('')
      setBusy(true)

      const offline = async () => {
        setEngine('offline')
        await typeOut(answerLocal(history))
      }

      try {
        if (engine === 'offline') return await offline()
        const ctrl = new AbortController()
        abort.current = ctrl
        const res = await fetch('/api/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        })
        if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('text/event-stream')) return await offline()

        setEngine('claude')
        const reader = res.body.getReader()
        const dec = new TextDecoder()
        let buf = ''
        let got = false
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const events = buf.split('\n\n')
          buf = events.pop() ?? ''
          for (const ev of events) {
            const data = ev.replace(/^data:\s*/, '')
            if (!data) continue
            const msg = JSON.parse(data) as { t?: string; done?: boolean; error?: string }
            if (msg.t) {
              got = true
              appendToLast(msg.t)
            }
            if (msg.error) appendToLast(got ? '\n\n_Connection dropped — ask again to continue._' : '')
            if (msg.error && !got) return await offline()
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        await offline()
      } finally {
        abort.current = null
        setBusy(false)
      }
    },
    [busy, msgs, engine],
  )

  const stop = () => {
    abort.current?.abort()
    window.clearTimeout(timer.current)
    setBusy(false)
  }

  // open: focus + optional seeded question; Esc closes
  useEffect(() => {
    if (!open) return
    const seed = chat.takeSeed()
    if (seed) void send(seed)
    window.setTimeout(() => input.current?.focus(), 350)
    const key = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && chat.close()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(draft)
    }
  }

  const reset = () => {
    stop()
    setMsgs([])
  }

  const status = engine === 'claude' ? 'Claude-powered' : engine === 'offline' ? 'Offline mode' : 'Online · replies in seconds'
  const last = msgs[msgs.length - 1]
  const waiting = busy && last?.role === 'assistant' && !last.content

  return (
    <>
      <button className={`cc-launch ${open ? 'is-hidden' : ''}`} onClick={() => chat.open()} aria-label="Open the Arca Concierge">
        <Orb size="sm" />
        <span>Ask Arca</span>
        <span className="cc-launch-ai mono">AI</span>
      </button>

      <section className={`cc-panel ${open ? 'is-open' : ''}`} role="dialog" aria-label="Arca Concierge" aria-hidden={!open}>
        <header className="cc-head">
          <Orb />
          <div className="cc-head-text">
            <b>Arca Concierge</b>
            <span className={`cc-status is-${engine}`}>
              <i />
              {status}
            </span>
          </div>
          {msgs.length > 0 && (
            <button className="cc-icon" onClick={reset} aria-label="Start a new conversation" title="New chat">
              <svg viewBox="0 0 24 24">
                <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
              </svg>
            </button>
          )}
          <button className="cc-icon" onClick={() => chat.close()} aria-label="Close the concierge">
            <svg viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="cc-scroll" ref={scroller} data-lenis-prevent>
          {msgs.length === 0 ? (
            <div className="cc-empty">
              <Orb size="lg" />
              <h3>
                Hello. <span className="serif">What are you looking for?</span>
              </h3>
              <p className="muted">
                I know every home on Arca, the neighbourhoods, and how buying and renting work in Portugal.
              </p>
              <div className="cc-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="cc-list" aria-live="polite">
              {msgs.map((m, i) => (
                <li key={i} className={`cc-msg is-${m.role}`}>
                  {m.role === 'assistant' ? (
                    <>
                      {i === msgs.length - 1 && waiting ? (
                        <span className="cc-dots" aria-label="Thinking">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <div className="cc-rich">
                          <Rich text={m.content} />
                          {busy && i === msgs.length - 1 && <span className="cc-caret" aria-hidden />}
                        </div>
                      )}
                    </>
                  ) : (
                    <p>{m.content}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <form
          className="cc-input"
          onSubmit={(e) => {
            e.preventDefault()
            void send(draft)
          }}
        >
          <textarea
            ref={input}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={busy ? 'Arca is replying…' : 'Ask about homes, areas, prices…'}
            disabled={busy}
            aria-label="Message the concierge"
          />
          {busy ? (
            <button type="button" className="cc-send is-stop" onClick={stop} aria-label="Stop">
              <i />
            </button>
          ) : (
            <button type="submit" className="cc-send" disabled={!draft.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </form>
        <p className="cc-fine mono">AI can make mistakes · verify with an agent</p>
      </section>
    </>
  )
}
