import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/anim'
import { agentOf, byId, euro, hoodOf, img, listings, priceLabel, type Listing } from '../data'
import { go } from '../lib/router'
import { chat } from '../lib/store'
import { I } from '../components/Icons'
import { Facts, ListingCard, SaveButton } from '../components/ListingCard'
import { CityMap } from '../components/CityMap'

function Lightbox({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const step = (d: number) => setI((v) => (v + d + photos.length) % photos.length)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', k)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.documentElement.style.overflow = ''
    }
  })
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={onClose}>
      <img key={i} src={img(photos[i], 2200)} alt="" onClick={(e) => e.stopPropagation()} />
      <button className="lb-btn is-l" onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Previous photo">
        <I.left />
      </button>
      <button className="lb-btn is-r" onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Next photo">
        <I.right />
      </button>
      <button className="lb-btn is-x" onClick={onClose} aria-label="Close gallery">
        <I.close />
      </button>
      <span className="lb-count mono">
        {i + 1} / {photos.length}
      </span>
    </div>
  )
}

function Mortgage({ price }: { price: number }) {
  const [dep, setDep] = useState(25)
  const [rate, setRate] = useState(3.6)
  const [years, setYears] = useState(30)
  const loan = price * (1 - dep / 100)
  const r = rate / 100 / 12
  const n = years * 12
  const pay = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n
  const imt = price * 0.065 // rough IMT + stamp duty for illustration
  const rows: [string, number, number, number, (v: number) => void, (v: number) => string][] = [
    ['Deposit', dep, 10, 60, setDep, (v) => `${v}% · ${euro(Math.round((price * v) / 100))}`],
    ['Interest rate', rate, 1, 7, setRate, (v) => `${v.toFixed(1)}%`],
    ['Term', years, 10, 40, setYears, (v) => `${v} years`],
  ]
  return (
    <div className="mort card-block">
      <div className="mort-head">
        <span className="mono eyebrow">Mortgage estimate</span>
        <b className="mort-pay">
          {euro(Math.round(pay))}
          <span>/mo</span>
        </b>
      </div>
      {rows.map(([label, v, min, max, set, fmt]) => (
        <label key={label} className="mort-row">
          <span>
            {label} <em>{fmt(v)}</em>
          </span>
          <input type="range" min={min} max={max} step={label === 'Interest rate' ? 0.1 : 1} value={v} onChange={(e) => set(Number(e.target.value))} />
        </label>
      ))}
      <div className="mort-split">
        <span>
          <i style={{ flex: dep }} className="d" />
          <i style={{ flex: 100 - dep }} className="l" />
        </span>
        <span className="mono muted">
          Loan {euro(Math.round(loan))} · Est. taxes & fees ~{euro(Math.round(imt))}
        </span>
      </div>
      <p className="mono muted mort-note">Illustrative only — confirm with your bank and lawyer.</p>
    </div>
  )
}

function Tour({ l }: { l: Listing }) {
  const a = agentOf(l.agent)
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, k) => {
        const d = new Date()
        d.setDate(d.getDate() + k + 1)
        return d
      }),
    [],
  )
  const [day, setDay] = useState(0)
  const [time, setTime] = useState('')
  const [mode, setMode] = useState<'person' | 'video'>('person')
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const slots = ['09:30', '11:00', '13:30', '15:00', '17:30', '19:00'].filter((_, k) => (k + day) % 4 !== 0)

  return (
    <div className="tour card-block">
      <div className="tour-agent">
        <img src={img(a.img, 200)} alt="" />
        <span>
          <b>{a.name}</b>
          <span className="muted">{a.role}</span>
          <span className="mono">
            ★ {a.rating} · {a.langs.join(' · ')}
          </span>
        </span>
      </div>
      {done ? (
        <div className="tour-done">
          <span className="tour-tick">
            <I.check />
          </span>
          <h3 className="h-md">You’re booked.</h3>
          <p className="muted">
            {mode === 'video' ? 'Video tour' : 'Viewing'} on {days[day].toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {time}.{' '}
            {a.name.split(' ')[0]} will confirm by email{email ? ` at ${email}` : ''}.
          </p>
          <button className="btn is-ghost is-sm" onClick={() => setDone(false)}>
            Change time
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (time) setDone(true)
          }}
        >
          <span className="mono eyebrow">Book a tour</span>
          <div className="seg tour-mode">
            <button type="button" className={mode === 'person' ? 'is-on' : ''} onClick={() => setMode('person')}>
              In person
            </button>
            <button type="button" className={mode === 'video' ? 'is-on' : ''} onClick={() => setMode('video')}>
              Video call
            </button>
          </div>
          <div className="tour-days" data-lenis-prevent>
            {days.map((d, k) => (
              <button type="button" key={k} className={k === day ? 'is-on' : ''} onClick={() => (setDay(k), setTime(''))}>
                <span className="mono">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                <b>{d.getDate()}</b>
              </button>
            ))}
          </div>
          <div className="tour-times">
            {slots.map((s) => (
              <button type="button" key={s} className={`chip ${time === s ? 'is-on' : ''}`} onClick={() => setTime(s)}>
                {s}
              </button>
            ))}
          </div>
          <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn is-accent tour-go" disabled={!time}>
            {time ? `Request ${time}` : 'Pick a time'} <I.arrow />
          </button>
          <div className="tour-contact">
            <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="btn is-ghost is-sm">
              <I.phone /> Call
            </a>
            <button type="button" className="btn is-ghost is-sm" onClick={() => chat.open(`Tell me more about "${l.title}" (${l.id}) — what should I know before a viewing?`)}>
              <I.spark /> Ask AI
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/** Simple generated floor plan: rooms laid out from bed/bath counts. */
function FloorPlan({ l }: { l: Listing }) {
  const rooms: { n: string; w: number }[] = [
    { n: 'Living', w: 3 },
    { n: 'Kitchen', w: 2 },
    ...Array.from({ length: Math.max(1, l.beds) }, (_, k) => ({ n: l.beds === 0 ? 'Sleeping' : `Bed ${k + 1}`, w: k === 0 ? 2.4 : 2 })),
    ...Array.from({ length: l.baths }, (_, k) => ({ n: `Bath ${k + 1}`, w: 1.2 })),
  ]
  let x = 0
  const half = Math.ceil(rooms.length / 2)
  return (
    <svg viewBox="0 0 400 220" className="plan" role="img" aria-label="Indicative floor plan">
      <rect x="2" y="2" width="396" height="216" rx="6" className="plan-wall" />
      {rooms.map((r, k) => {
        const row = k < half ? 0 : 1
        if (k === half) x = 0
        const rowTotal = (row === 0 ? rooms.slice(0, half) : rooms.slice(half)).reduce((s, q) => s + q.w, 0)
        const w = (r.w / rowTotal) * 396
        const el = (
          <g key={r.n}>
            <rect x={2 + x} y={2 + row * 108} width={w} height={108} className={`plan-room ${k === 0 ? 'is-main' : ''}`} />
            <text x={2 + x + w / 2} y={2 + row * 108 + 58} textAnchor="middle" className="plan-label">
              {r.n}
            </text>
          </g>
        )
        x += w
        return el
      })}
      <text x="392" y="212" textAnchor="end" className="plan-meta">
        {l.area} m² · indicative layout
      </text>
    </svg>
  )
}

export function ListingPage({ id }: { id: string }) {
  const l = byId(id)
  const [lb, setLb] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!l) return
    const ctx = gsap.context(() => {
      gsap.from('.gal > *', { clipPath: 'inset(100% 0 0 0 round 28px)', duration: 1.3, ease: 'expo.inOut', stagger: 0.07 })
      gsap.from('.lp-head > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.2 })
    }, root)
    return () => ctx.revert()
  }, [l])

  if (!l) {
    return (
      <main className="page wrap lp-missing">
        <h1 className="h-lg">This home has moved on.</h1>
        <p className="muted">It may have been sold or let. Here’s what’s available now.</p>
        <button className="btn" onClick={() => go('/search')}>
          Browse homes
        </button>
      </main>
    )
  }

  const h = hoodOf(l.hood)
  const similar = listings.filter((x) => x.id !== l.id && (x.hood === l.hood || x.kind === l.kind) && x.deal === l.deal).slice(0, 3)
  const perM2 = l.deal === 'buy' ? Math.round(l.price / l.area) : null

  return (
    <main className="page lp" ref={root}>
      <div className="wrap">
        <div className="lp-crumbs mono muted">
          <a href="#/search">Homes</a> / <a href={`#/search?hood=${h.id}`}>{h.name}</a> / {l.kind}
        </div>
        <div className="lp-head">
          <div>
            <div className="lp-tags">
              <span className="tag is-dark">{l.deal === 'rent' ? 'For rent' : 'For sale'}</span>
              {l.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <h1 className="h-lg">{l.title}</h1>
            <span className="muted lp-addr">
              <I.pin /> {l.address}, {h.name} · Listed {l.listed === 1 ? 'yesterday' : `${l.listed} days ago`}
            </span>
          </div>
          <div className="lp-actions">
            <button
              className="icon-btn is-lg"
              onClick={() => {
                navigator.clipboard?.writeText(location.href).then(() => {
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1600)
                })
              }}
              aria-label="Copy link"
            >
              {copied ? <I.check /> : <I.share />}
            </button>
            <SaveButton id={l.id} className="is-lg" />
          </div>
        </div>

        <div className={`gal n${Math.min(l.photos.length, 5)}`}>
          {l.photos.slice(0, 5).map((p, k) => (
            <button key={p} onClick={() => setLb(k)} className={k === 0 ? 'is-main' : ''} aria-label={`Open photo ${k + 1}`}>
              <img src={img(p, k === 0 ? 1800 : 900)} alt={k === 0 ? l.title : ''} />
            </button>
          ))}
          <button className="gal-all btn is-sm" onClick={() => setLb(0)}>
            <I.grid /> All {l.photos.length} photos
          </button>
        </div>

        <div className="lp-grid">
          <div className="lp-main">
            <div className="lp-price">
              <b>{priceLabel(l)}</b>
              {perM2 && <span className="muted">{euro(perM2)} / m²</span>}
            </div>
            <div className="lp-facts">
              <Facts l={l} />
              <span>
                <I.home /> {l.kind}
              </span>
              <span>
                <I.calendar /> Built {l.year}
              </span>
              <span>
                <I.leaf /> Energy {l.energy}
              </span>
              {l.floor && <span>Floor {l.floor}</span>}
            </div>
            <p className="lp-blurb">{l.blurb}</p>
            <p className="muted lp-text">
              Set in {h.name} — {h.blurb.toLowerCase()} The home is offered {l.deal === 'rent' ? 'on a 12-month lease, renewable' : 'with full documentation ready for a promissory contract'}. Viewings run
              daily; video tours are available for international buyers.
            </p>

            <h2 className="h-md lp-sub">What you’ll love</h2>
            <ul className="lp-feats">
              {l.features.map((f) => (
                <li key={f}>
                  <I.check /> {f}
                </li>
              ))}
            </ul>

            <h2 className="h-md lp-sub">Floor plan</h2>
            <FloorPlan l={l} />

            <h2 className="h-md lp-sub">The neighbourhood</h2>
            <div className="lp-hood">
              <div className="lp-hood-info">
                <b>{h.name}</b>
                <span className="muted">{h.vibe}</span>
                <div className="lp-scores">
                  {[
                    [I.walk, 'Walk', h.walk],
                    [I.train, 'Transit', h.transit],
                    [I.home, 'Avg €/m²', h.avg],
                  ].map(([Icon, label, v]) => {
                    const C = Icon as typeof I.walk
                    const n = v as number
                    return (
                      <div key={label as string}>
                        <C />
                        <span className="mono">{label as string}</span>
                        <b>{n > 100 ? euro(n) : n}</b>
                        {n <= 100 && (
                          <i>
                            <i style={{ width: `${n}%` }} />
                          </i>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="lp-hood-map">
                <CityMap items={[l]} selected={null} compact />
              </div>
            </div>

            {l.deal === 'buy' && (
              <>
                <h2 className="h-md lp-sub">Costs at a glance</h2>
                <Mortgage price={l.price} />
              </>
            )}

            <button className="lp-ask" onClick={() => chat.open(`Is "${l.title}" (${l.id}) good value compared with similar homes, and what questions should I ask the agent?`)}>
              <I.spark />
              <span>
                <b>Ask Arca AI about this home</b>
                <span className="muted">Value vs. comparables, hidden costs, what to ask at the viewing.</span>
              </span>
              <I.arrow />
            </button>
          </div>
          <aside className="lp-side">
            <Tour l={l} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="lp-similar">
            <h2 className="h-md">You might also like</h2>
            <div className="res-grid is-3">
              {similar.map((s) => (
                <ListingCard key={s.id} l={s} />
              ))}
            </div>
          </section>
        )}
      </div>
      {lb !== null && <Lightbox photos={l.photos} start={lb} onClose={() => setLb(null)} />}
    </main>
  )
}
