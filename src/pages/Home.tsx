import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/anim'
import { agents, hoods, img, listings, photo, priceLabel, euro, hoodOf, type Deal } from '../data'
import { go } from '../lib/router'
import { chat } from '../lib/store'
import { I } from '../components/Icons'
import { ListingCard } from '../components/ListingCard'
import { AppShowcase } from '../components/AppShowcase'

const HERO = [photo.cliffVilla, photo.livingNeutral, photo.towerGlass, photo.whiteVilla]

function Hero() {
  const root = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const [deal, setDeal] = useState<Deal>('buy')
  const [hood, setHood] = useState('')
  const [kind, setKind] = useState('')
  const [max, setMax] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % HERO.length), 5200)
    return () => window.clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-media', { clipPath: 'inset(12% 8% 12% 8% round 60px)', duration: 1.8, ease: 'expo.inOut' })
        .from('.hero-title .line-mask > span', { yPercent: 110, duration: 1.4, stagger: 0.08 }, 0.6)
        .from('.hero-search', { y: 40, opacity: 0, duration: 1.2 }, 1)
        .from('.hero-float', { y: 30, opacity: 0, duration: 1.2, stagger: 0.1 }, 1.1)
      gsap.to('.hero-media-inner', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const budgets = deal === 'buy' ? [500000, 1000000, 2000000, 5000000] : [1500, 2500, 4000, 8000]
  const submit = () => {
    const q = new URLSearchParams({ deal })
    if (hood) q.set('hood', hood)
    if (kind) q.set('kind', kind)
    if (max) q.set('max', max)
    go(`/search?${q}`)
  }
  const pick = listings.find((l) => l.id === 'pn-tower')!

  return (
    <section className="hero" ref={root}>
      <div className="hero-media">
        <div className="hero-media-inner">
          {HERO.map((p, k) => (
            <img key={p} src={img(p, 2200)} alt="" className={k === i ? 'is-on' : ''} />
          ))}
        </div>
        <div className="hero-shade" />

        <div className="hero-copy">
          <span className="mono eyebrow hero-eyebrow">Lisbon · Cascais · 1,240 homes</span>
          <h1 className="hero-title h-xl">
            <span className="line-mask">
              <span>Find the home</span>
            </span>
            <span className="line-mask">
              <span>
                that <span className="serif">finds you.</span>
              </span>
            </span>
          </h1>
        </div>

        <button className="hero-float hero-pick" onClick={() => go(`/listing/${pick.id}`)}>
          <img src={img(pick.photos[1], 500)} alt="" />
          <span>
            <span className="mono">Just listed</span>
            <b>{priceLabel(pick)}</b>
            <span className="muted-on-dark">{pick.title}</span>
          </span>
          <I.arrowUR />
        </button>

        <div className="hero-float hero-dots" aria-hidden>
          {HERO.map((p, k) => (
            <i key={p} className={k === i ? 'is-on' : ''} />
          ))}
        </div>
      </div>

      <form
        className="hero-search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="hs-tabs">
          {(['buy', 'rent'] as const).map((d) => (
            <button
              type="button"
              key={d}
              className={deal === d ? 'is-on' : ''}
              onClick={() => {
                setDeal(d)
                setMax('')
              }}
            >
              {d === 'buy' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>
        <label className="hs-field">
          <span className="mono muted">Where</span>
          <select value={hood} onChange={(e) => setHood(e.target.value)}>
            <option value="">All neighbourhoods</option>
            {hoods.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label className="hs-field">
          <span className="mono muted">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Any type</option>
            {['Apartment', 'Penthouse', 'House', 'Villa', 'Loft', 'Studio'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="hs-field">
          <span className="mono muted">Budget</span>
          <select value={max} onChange={(e) => setMax(e.target.value)}>
            <option value="">No limit</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                Up to {euro(b)}
                {deal === 'rent' ? '/mo' : ''}
              </option>
            ))}
          </select>
        </label>
        <button className="btn hs-go" type="submit">
          <I.search /> Search
        </button>
        <button type="button" className="hs-ai" onClick={() => chat.open()}>
          <I.spark /> or just describe it to <b>Arca AI</b>
        </button>
      </form>
    </section>
  )
}

const STATS = [
  { v: '1,240', l: 'Homes on Arca' },
  { v: '48h', l: 'Avg. to first tour' },
  { v: '4.9', l: 'Client rating' },
  { v: '€0', l: 'Buyer fees' },
] // sample

function Fresh() {
  const rail = useRef<HTMLDivElement>(null)
  const scroll = (d: number) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  const fresh = [...listings].sort((a, b) => a.listed - b.listed).slice(0, 8)
  return (
    <section className="fresh">
      <div className="sec-head wrap">
        <div>
          <span className="mono eyebrow">Fresh this week</span>
          <h2 className="h-lg">
            New on the <span className="serif">market</span>
          </h2>
        </div>
        <div className="sec-actions">
          <button className="icon-btn is-lg" onClick={() => scroll(-1)} aria-label="Previous">
            <I.left />
          </button>
          <button className="icon-btn is-lg" onClick={() => scroll(1)} aria-label="Next">
            <I.right />
          </button>
          <a href="#/search" className="btn is-ghost">
            View all homes <I.arrow />
          </a>
        </div>
      </div>
      <div className="rail" ref={rail} data-lenis-prevent>
        {fresh.map((l) => (
          <ListingCard key={l.id} l={l} />
        ))}
      </div>
      <div className="stats wrap">
        {STATS.map((s) => (
          <div key={s.l}>
            <b>{s.v}</b>
            <span className="muted">{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Hoods() {
  const [on, setOn] = useState(0)
  const h = hoods[on]
  const count = (id: string) => listings.filter((l) => l.hood === id).length
  return (
    <section className="hoods wrap" id="hoods">
      <div className="hoods-list">
        <span className="mono eyebrow">Neighbourhoods</span>
        <h2 className="h-lg">
          Seven ways to <span className="serif">live</span> in Lisbon.
        </h2>
        <ul>
          {hoods.map((x, i) => (
            <li key={x.id}>
              <button
                className={i === on ? 'is-on' : ''}
                onMouseEnter={() => setOn(i)}
                onFocus={() => setOn(i)}
                onClick={() => go(`/search?hood=${x.id}`)}
              >
                <span className="hl-name">{x.name}</span>
                <span className="mono muted hl-vibe">{x.vibe}</span>
                <span className="mono hl-count">{count(x.id)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="hoods-card">
        {hoods.map((x, i) => (
          <img key={x.id} src={img(x.img, 1400)} alt="" className={i === on ? 'is-on' : ''} loading="lazy" />
        ))}
        <div className="hc-info" key={h.id}>
          <p>{h.blurb}</p>
          <div className="hc-stats">
            <span>
              <b>{euro(h.avg)}</b>
              <span className="mono">avg / m²</span>
            </span>
            <span>
              <b>{h.walk}</b>
              <span className="mono">walk score</span>
            </span>
            <span>
              <b>{h.transit}</b>
              <span className="mono">transit</span>
            </span>
          </div>
          <button className="btn is-accent is-sm" onClick={() => go(`/search?hood=${h.id}`)}>
            Homes in {h.name} <I.arrow />
          </button>
        </div>
      </div>
    </section>
  )
}

const DEMO = [
  { me: true, t: 'Something with a terrace near the river, 2 beds, under €2.5k a month.' },
  { me: false, t: 'Two good fits. The Alfama flat has a private terrace over the rooftops at €2,400/mo, furnished. If you prefer new-build comfort, there’s a 2-bed by the Oceanário at €2,100 with a pool.' },
  { me: true, t: 'Can I see the Alfama one this week?' },
  { me: false, t: 'Clara has Thursday 10:00 or Friday 17:30 free. Want me to hold one?' },
]

function AiTeaser() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ai-msg', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.45,
        scrollTrigger: { trigger: '.ai-thread', start: 'top 75%' },
      })
      gsap.from('.ai-orb', { scale: 0.4, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    }, root)
    return () => ctx.revert()
  }, [])
  const al = listings.find((l) => l.id === 'al-terrace')!
  return (
    <section className="ai wrap" ref={root}>
      <div className="ai-panel">
        <div className="ai-orb" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="ai-copy">
          <span className="mono eyebrow">Arca AI concierge</span>
          <h2 className="h-lg">
            Ask anything. <br />
            Get <span className="serif">homes,</span> not links.
          </h2>
          <p>
            Describe how you want to live — budget, light, commute, the dog. Arca reads every listing, neighbourhood and price trend, then answers like an
            agent who knows the city by heart.
          </p>
          <div className="ai-prompts">
            {['Villas with a pool near the coast', 'Compare Príncipe Real vs Estrela', 'What would I pay monthly on a €900k home?'].map((q) => (
              <button key={q} className="chip" onClick={() => chat.open(q)}>
                {q}
              </button>
            ))}
          </div>
          <button className="btn is-accent" onClick={() => chat.open()}>
            <I.spark /> Start a conversation
          </button>
        </div>
        <div className="ai-thread">
          {DEMO.map((m, k) => (
            <div key={k} className={`ai-msg ${m.me ? 'is-me' : ''}`}>
              {m.t}
              {k === 1 && (
                <button className="ai-card" onClick={() => go(`/listing/${al.id}`)}>
                  <img src={img(al.photos[0], 400)} alt="" />
                  <span>
                    <b>{priceLabel(al)}</b>
                    <span>{al.title}</span>
                  </span>
                </button>
              )}
            </div>
          ))}
          <div className="ai-typing" aria-hidden>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { n: '01', t: 'Search smarter', d: 'Filter by what matters — light, outdoor space, commute — or just ask the AI.', icon: I.search },
  { n: '02', t: 'Tour in 48h', d: 'Book a viewing in two taps, in person or live on video with your agent.', icon: I.calendar },
  { n: '03', t: 'Offer with clarity', d: 'Comparable sales, taxes and monthly costs laid out before you commit.', icon: I.doc },
  { n: '04', t: 'Get the keys', d: 'Lawyer, NIF, bank and notary — coordinated by one team until move-in day.', icon: I.key },
]

function Steps() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.step', {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.steps', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section className="how wrap" ref={root}>
      <div className="sec-head">
        <div>
          <span className="mono eyebrow">How Arca works</span>
          <h2 className="h-lg">
            From first scroll to <span className="serif">front door.</span>
          </h2>
        </div>
      </div>
      <div className="steps">
        {STEPS.map((s) => (
          <article key={s.n} className="step">
            <span className="step-n mono">{s.n}</span>
            <s.icon className="step-icon" />
            <h3 className="h-md">{s.t}</h3>
            <p className="muted">{s.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Team() {
  return (
    <section className="team wrap">
      <div className="sec-head">
        <div>
          <span className="mono eyebrow">The people behind it</span>
          <h2 className="h-lg">
            Local agents, <span className="serif">on your side.</span>
          </h2>
        </div>
        <a href="#/agents" className="btn is-ghost">
          Meet the team <I.arrow />
        </a>
      </div>
      <div className="team-row">
        {agents.map((a) => (
          <a key={a.id} href="#/agents" className="tm">
            <img src={img(a.img, 600)} alt="" loading="lazy" />
            <span className="tm-info">
              <b>{a.name}</b>
              <span>{a.role}</span>
              <span className="mono">
                ★ {a.rating} · {a.deals} homes · {a.focus.map((f) => hoodOf(f).name).join(', ')}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

export function Home() {
  return (
    <main>
      <Hero />
      <Fresh />
      <Hoods />
      <AiTeaser />
      <AppShowcase />
      <Steps />
      <Team />
    </main>
  )
}
