import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/anim'
import { agents, compareRows, hoodOf, img, listings, priceLabel } from '../data'
import { go } from '../lib/router'
import { chat, savedStore, useSaved } from '../lib/store'
import { I } from '../components/Icons'
import { ListingCard } from '../components/ListingCard'

export function Agents() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ag', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <main className="page agents wrap" ref={root}>
      <div className="pg-head">
        <span className="mono eyebrow">Our agents</span>
        <h1 className="h-xl">
          Five people. <span className="serif">One city.</span>
        </h1>
        <p className="muted">Every Arca agent specialises in a handful of neighbourhoods, speaks your language and answers within the hour.</p>
      </div>
      <div className="ag-grid">
        {agents.map((a) => {
          const own = listings.filter((l) => l.agent === a.id)
          return (
            <article key={a.id} className="ag">
              <div className="ag-photo">
                <img src={img(a.img, 800)} alt={a.name} loading="lazy" />
                <span className="tag">★ {a.rating}</span>
              </div>
              <div className="ag-body">
                <h2 className="h-md">{a.name}</h2>
                <span className="muted">{a.role}</span>
                <div className="ag-stats">
                  <span>
                    <b>{a.deals}</b>
                    <span className="mono muted">homes sold/let</span>
                  </span>
                  <span>
                    <b>{own.length}</b>
                    <span className="mono muted">live listings</span>
                  </span>
                  <span>
                    <b>{a.langs.join(' ')}</b>
                    <span className="mono muted">languages</span>
                  </span>
                </div>
                <div className="ag-hoods">
                  {a.focus.map((f) => (
                    <button key={f} className="chip" onClick={() => go(`/search?hood=${f}`)}>
                      {hoodOf(f).name}
                    </button>
                  ))}
                </div>
                <div className="ag-listings">
                  {own.slice(0, 3).map((l) => (
                    <button key={l.id} onClick={() => go(`/listing/${l.id}`)} title={l.title}>
                      <img src={img(l.photos[0], 300)} alt="" loading="lazy" />
                      <span className="mono">{priceLabel(l)}</span>
                    </button>
                  ))}
                </div>
                <div className="ag-actions">
                  <a className="btn is-sm" href={`tel:${a.phone.replace(/\s/g, '')}`}>
                    <I.phone /> {a.phone}
                  </a>
                  <button className="btn is-ghost is-sm" onClick={() => chat.open(`I'd like to speak with ${a.name} about homes in ${a.focus.map((f) => hoodOf(f).name).join(' or ')}.`)}>
                    <I.spark /> Message
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

export function Saved() {
  const ids = useSaved()
  const items = useMemo(() => listings.filter((l) => ids.includes(l.id)), [ids])
  const [cmp, setCmp] = useState<string[]>([])
  const picked = items.filter((l) => cmp.includes(l.id))
  const toggle = (id: string) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id]))

  return (
    <main className="page saved wrap">
      <div className="pg-head">
        <span className="mono eyebrow">Saved homes</span>
        <h1 className="h-xl">
          Your <span className="serif">shortlist.</span>
        </h1>
        <p className="muted">Saved on this device. Tick up to three homes to compare them side by side.</p>
      </div>

      {items.length === 0 ? (
        <div className="sr-empty">
          <h3 className="h-md">Nothing saved yet.</h3>
          <p className="muted">Tap the heart on any home to keep it here.</p>
          <div>
            <button className="btn" onClick={() => go('/search')}>
              Browse homes
            </button>
            <button className="btn is-accent" onClick={() => chat.open()}>
              <I.spark /> Get recommendations
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="res-grid is-3">
            {items.map((l) => (
              <div key={l.id} className="saved-item">
                <ListingCard l={l} />
                <div className="saved-bar">
                  <label className="chk">
                    <input type="checkbox" checked={cmp.includes(l.id)} onChange={() => toggle(l.id)} /> Compare
                  </label>
                  <button className="mono muted" onClick={() => savedStore.toggle(l.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {picked.length >= 2 && (
            <section className="compare">
              <div className="sec-head">
                <h2 className="h-md">
                  <I.compare /> Side by side
                </h2>
                <button
                  className="btn is-ghost is-sm"
                  onClick={() => chat.open(`Compare these homes for me and say which is better value and why: ${picked.map((p) => `${p.title} (${p.id})`).join('; ')}`)}
                >
                  <I.spark /> Ask AI to compare
                </button>
              </div>
              <div className="cmp-table" style={{ gridTemplateColumns: `160px repeat(${picked.length}, minmax(0, 1fr))` }} data-lenis-prevent>
                <span />
                {picked.map((p) => (
                  <button key={p.id} className="cmp-head" onClick={() => go(`/listing/${p.id}`)}>
                    <img src={img(p.photos[0], 500)} alt="" />
                    <b>{p.title}</b>
                  </button>
                ))}
                {compareRows.map(([label, fn]) => (
                  <div key={label} className="cmp-row" style={{ display: 'contents' }}>
                    <span className="mono muted">{label}</span>
                    {picked.map((p) => (
                      <span key={p.id}>{fn(p)}</span>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
