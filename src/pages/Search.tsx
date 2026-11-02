import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/anim'
import { euro, hoods, listings, type Kind } from '../data'
import { go, useRoute } from '../lib/router'
import { chat } from '../lib/store'
import { CityMap } from '../components/CityMap'
import { ListingCard } from '../components/ListingCard'
import { I } from '../components/Icons'

const KINDS: Kind[] = ['Apartment', 'Penthouse', 'House', 'Villa', 'Loft', 'Studio']
const SORTS = { new: 'Newest', low: 'Price ↑', high: 'Price ↓', area: 'Largest' } as const

export function Search() {
  const { query } = useRoute()
  const [hover, setHover] = useState<string | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [view, setView] = useState<'split' | 'list' | 'map'>('split')
  const root = useRef<HTMLElement>(null)

  const deal = query.get('deal') ?? ''
  const hood = query.get('hood') ?? ''
  const kind = query.get('kind') ?? ''
  const max = Number(query.get('max') ?? 0)
  const beds = Number(query.get('beds') ?? 0)
  const tag = query.get('tag') ?? ''
  const sort = (query.get('sort') ?? 'new') as keyof typeof SORTS

  // every filter lives in the URL so results are shareable and Back works
  const set = (k: string, v: string | number | null) => {
    const q = new URLSearchParams(query)
    if (v === null || v === '' || v === 0) q.delete(k)
    else q.set(k, String(v))
    if (k === 'deal') q.delete('max')
    go(`/search?${q}`)
  }

  const results = useMemo(() => {
    const r = listings.filter(
      (l) =>
        (!deal || l.deal === deal) &&
        (!hood || l.hood === hood) &&
        (!kind || l.kind === kind) &&
        (!max || l.price <= max) &&
        (!beds || l.beds >= beds) &&
        (!tag || l.tags.includes(tag)),
    )
    return r.sort((a, b) =>
      sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'area' ? b.area - a.area : a.listed - b.listed,
    )
  }, [deal, hood, kind, max, beds, tag, sort])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.res-grid .lcard', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 })
    }, root)
    return () => ctx.revert()
  }, [results])

  const budgets = deal === 'rent' ? [1500, 2500, 4000, 8000] : [500000, 1000000, 2000000, 5000000]
  const active = [deal, hood, kind, max, beds, tag].filter(Boolean).length
  const title = `${kind ? `${kind}s` : 'Homes'} ${deal === 'rent' ? 'to rent' : deal === 'buy' ? 'for sale' : ''} ${hood ? `in ${hoods.find((h) => h.id === hood)?.name}` : 'in Lisbon & Cascais'}`

  return (
    <main className={`page search view-${view}`} ref={root}>
      <div className="sr-bar wrap">
        <div className="sr-title">
          <h1 className="h-md">{title}</h1>
          <span className="mono muted">
            {results.length} {results.length === 1 ? 'home' : 'homes'}
          </span>
        </div>
        <div className="sr-filters">
          <div className="seg">
            {[
              ['', 'All'],
              ['buy', 'Buy'],
              ['rent', 'Rent'],
            ].map(([v, l]) => (
              <button key={l} className={deal === v ? 'is-on' : ''} onClick={() => set('deal', v)}>
                {l}
              </button>
            ))}
          </div>
          <select className="sel" value={hood} onChange={(e) => set('hood', e.target.value)} aria-label="Neighbourhood">
            <option value="">All areas</option>
            {hoods.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <select className="sel" value={max || ''} onChange={(e) => set('max', e.target.value)} aria-label="Budget">
            <option value="">Any price</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                ≤ {euro(b)}
                {deal === 'rent' ? '/mo' : ''}
              </option>
            ))}
          </select>
          <select className="sel" value={beds || ''} onChange={(e) => set('beds', e.target.value)} aria-label="Bedrooms">
            <option value="">Any beds</option>
            {[1, 2, 3, 4, 5].map((b) => (
              <option key={b} value={b}>
                {b}+ beds
              </option>
            ))}
          </select>
          <select className="sel" value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {active > 0 && (
            <button className="chip" onClick={() => go('/search')}>
              Clear ({active})
            </button>
          )}
          <div className="seg sr-view">
            {(
              [
                ['split', I.grid, 'Split'],
                ['list', I.grid, 'List'],
                ['map', I.map, 'Map'],
              ] as const
            ).map(([v, Icon, l]) => (
              <button key={v} className={view === v ? 'is-on' : ''} onClick={() => setView(v)} aria-label={`${l} view`}>
                {v === 'split' ? (
                  <>
                    <I.grid /> <I.map />
                  </>
                ) : (
                  <Icon />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="sr-kinds">
          {KINDS.map((k) => (
            <button key={k} className={`chip ${kind === k ? 'is-on' : ''}`} onClick={() => set('kind', kind === k ? '' : k)}>
              {k}
            </button>
          ))}
          <button className="chip sr-ai" onClick={() => chat.open()}>
            <I.spark /> Describe it to Arca AI
          </button>
        </div>
      </div>

      <div className="sr-body wrap">
        <div className="res-grid">
          {results.map((l) => (
            <ListingCard key={l.id} l={l} onHover={setHover} active={hover === l.id || sel === l.id} />
          ))}
          {results.length === 0 && (
            <div className="sr-empty">
              <h3 className="h-md">Nothing matches — yet.</h3>
              <p className="muted">Loosen a filter, or tell Arca AI what you’re after and it’ll suggest close alternatives.</p>
              <div>
                <button className="btn" onClick={() => go('/search')}>
                  Clear filters
                </button>
                <button className="btn is-accent" onClick={() => chat.open()}>
                  <I.spark /> Ask Arca AI
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="sr-map">
          <CityMap items={results} hover={hover} onHover={setHover} selected={sel} onSelect={setSel} />
        </aside>
      </div>
    </main>
  )
}
