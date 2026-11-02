import { useEffect, useRef, useState } from 'react'
import { go, useRoute } from '../lib/router'
import { chat, toggleMode, useMode, useSaved } from '../lib/store'
import { I, Logo } from './Icons'

const NAV = [
  { label: 'Buy', to: '/search?deal=buy' },
  { label: 'Rent', to: '/search?deal=rent' },
  { label: 'Neighbourhoods', to: '/#hoods' },
  { label: 'Agents', to: '/agents' },
  { label: 'App', to: '/app' },
]

export function Header() {
  const route = useRoute()
  const mode = useMode()
  const saved = useSaved()
  const [menu, setMenu] = useState(false)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    let last = 0
    const on = () => {
      const y = window.scrollY
      root.current!.classList.toggle('is-scrolled', y > 20)
      root.current!.classList.toggle('is-hidden', y > last && y > 400 && !menu)
      last = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [menu])

  useEffect(() => setMenu(false), [route.raw])

  const isOn = (to: string) => {
    const [p, q] = to.split('?')
    if (p !== route.path) return false
    return !q || route.query.get('deal') === new URLSearchParams(q).get('deal')
  }

  const nav = (to: string) => {
    if (to === '/#hoods') {
      if (route.path !== '/') go('/')
      window.setTimeout(() => document.getElementById('hoods')?.scrollIntoView({ behavior: 'smooth' }), route.path === '/' ? 0 : 700)
      return
    }
    go(to)
  }

  return (
    <header className={`hdr ${menu ? 'menu-open' : ''}`} ref={root}>
      <div className="hdr-bar">
        <a href="#/" className="hdr-logo" aria-label="Arca home">
          <Logo />
          <span>arca</span>
        </a>
        <nav className="hdr-nav">
          {NAV.map((n) => (
            <button key={n.label} className={isOn(n.to) ? 'is-on' : ''} onClick={() => nav(n.to)}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hdr-tools">
          <button
            className="icon-btn"
            onClick={(e) => toggleMode({ x: e.clientX, y: e.clientY })}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
          >
            {mode === 'dark' ? <I.sun /> : <I.moon />}
          </button>
          <a href="#/saved" className="icon-btn hdr-saved" aria-label={`Saved homes (${saved.length})`}>
            <I.heart />
            {saved.length > 0 && <b>{saved.length}</b>}
          </a>
          <button className="btn is-sm is-accent hdr-ai" onClick={() => chat.open()}>
            <I.spark /> Ask Arca AI
          </button>
          <button className="icon-btn hdr-burger" onClick={() => setMenu((v) => !v)} aria-label="Menu" aria-expanded={menu}>
            {menu ? <I.close /> : <I.menu />}
          </button>
        </div>
      </div>
      <div className="hdr-sheet" aria-hidden={!menu}>
        {NAV.map((n, i) => (
          <button key={n.label} onClick={() => nav(n.to)} style={{ transitionDelay: `${0.05 * i + 0.1}s` }}>
            {n.label}
            <I.arrowUR />
          </button>
        ))}
        <a href="#/saved">Saved ({saved.length})</a>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-top wrap">
        <div className="ftr-cta">
          <span className="mono eyebrow">Selling in Lisbon?</span>
          <h2 className="h-lg">
            List with Arca, <span className="serif">sell</span> with confidence.
          </h2>
          <div className="ftr-actions">
            <button className="btn is-accent" onClick={() => chat.open('I want to sell my apartment in Lisbon — what would you need from me and how do you price it?')}>
              Get a free valuation <I.arrow />
            </button>
            <a href="#/agents" className="btn is-ghost">
              Talk to an agent
            </a>
          </div>
        </div>
        <div className="ftr-cols">
          <div>
            <span className="mono muted">Explore</span>
            <a href="#/search?deal=buy">Homes for sale</a>
            <a href="#/search?deal=rent">Homes to rent</a>
            <a href="#/search?kind=Villa">Villas</a>
            <a href="#/search?tag=New build">New builds</a>
          </div>
          <div>
            <span className="mono muted">Arca</span>
            <a href="#/agents">Our agents</a>
            <a href="#/app">Mobile app</a>
            <a href="#/saved">Saved homes</a>
            <button onClick={() => chat.open()}>AI concierge</button>
          </div>
          <div>
            <span className="mono muted">Office</span>
            <span>Rua Garrett 74, Chiado</span>
            <span>1200-204 Lisboa</span>
            <a href="mailto:hello@arca.homes">hello@arca.homes</a>
            <span>+351 21 000 0000</span>
          </div>
        </div>
      </div>
      <div className="ftr-word" aria-hidden>
        arca
      </div>
      <div className="ftr-bottom wrap mono">
        <span>© {new Date().getFullYear()} Arca Homes · AMI 00000 (sample)</span>
        <span>Privacy · Terms · Cookies</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
      </div>
    </footer>
  )
}
