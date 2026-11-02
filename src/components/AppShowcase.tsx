import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '../lib/anim'
import { chat } from '../lib/store'
import { Phone } from './Phone'
import { ChatScreen, MapScreen, SCREENS } from './AppScreens'
import '../styles/showcase.css'

export const FEATURES = [
  {
    key: 'Discover',
    title: 'A feed that learns your taste',
    body: 'Swipe through homes picked for you — every save and skip sharpens what Arca shows next.',
    points: ['Personal picks daily', 'Price-drop alerts', 'Swipe to save'],
  },
  {
    key: 'Map search',
    title: 'Search the city, not a list',
    body: 'Pan across Lisbon and the coast with live price pins, commute rings and neighbourhood scores.',
    points: ['Draw your own area', 'Commute filters', 'Works offline'],
  },
  {
    key: 'Tour booking',
    title: 'Book a viewing in two taps',
    body: 'See an agent’s real availability, pick a slot and get directions — no phone tag.',
    points: ['Live agent calendars', 'Video tours', 'Reminders & directions'],
  },
  {
    key: 'AI concierge',
    title: 'Ask anything, get answers',
    body: 'The Arca Concierge knows every listing, neighbourhood and mortgage rule — and replies in seconds.',
    points: ['Natural-language search', 'Mortgage maths', 'Neighbourhood insight'],
  },
]

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M16.4 12.6c0-2.4 2-3.6 2-3.7-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.5zM14.1 5.5c.6-.8 1.1-1.8 1-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 3.5v17c0 .5.5.8.9.6L19.6 12.9c.5-.3.5-1 0-1.3L4.9 2.9c-.4-.2-.9.1-.9.6z" />
    </svg>
  )
}

export function StoreBadges() {
  return (
    <div className="as-badges">
      <span className="as-badge">
        <AppleIcon />
        <span>
          <small>Coming soon on the</small>
          App Store
        </span>
      </span>
      <span className="as-badge">
        <PlayIcon />
        <span>
          <small>Coming soon on</small>
          Google Play
        </span>
      </span>
    </div>
  )
}

const WAIT_KEY = 'arca-waitlist'

/** Client-only waitlist: remembers the email in localStorage and shows a thank-you state. */
export function Waitlist({ compact = false }: { compact?: boolean }) {
  const [joined, setJoined] = useState<string | null>(() => {
    try {
      return localStorage.getItem(WAIT_KEY)
    } catch {
      return null
    }
  })
  const [email, setEmail] = useState('')
  const [err, setErr] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr(true)
    try {
      localStorage.setItem(WAIT_KEY, email)
    } catch {
      /* storage blocked — still thank them */
    }
    setJoined(email)
  }

  if (joined)
    return (
      <div className={`as-wait is-done ${compact ? 'is-compact' : ''}`} role="status">
        <span className="as-check" aria-hidden>
          ✓
        </span>
        <span>
          You’re on the list. We’ll write to <b>{joined}</b> the day Arca lands.
        </span>
      </div>
    )
  return (
    <form className={`as-wait ${err ? 'is-err' : ''} ${compact ? 'is-compact' : ''}`} onSubmit={submit} noValidate>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setErr(false)
        }}
        placeholder="you@email.com"
        aria-label="Email for the app waitlist"
        aria-invalid={err}
      />
      <button className="btn is-accent" type="submit">
        Join the waitlist
      </button>
      {err && <small className="as-err">That email doesn’t look right.</small>}
    </form>
  )
}

export function AppShowcase() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      gsap.from('.as-head .line-mask > span', {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.as-head', start: 'top 80%' },
      })
      mm.add('(min-width: 901px)', () => {
        ScrollTrigger.create({
          trigger: '.as-pin',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (st) => {
            const i = Math.min(SCREENS.length - 1, Math.floor(st.progress * SCREENS.length))
            setStep((s) => (s === i ? s : i))
            root.current?.style.setProperty('--as-p', st.progress.toFixed(4))
          },
        })
        if (reducedMotion()) return
        const st = { trigger: '.as-pin', start: 'top bottom', end: 'bottom top', scrub: true }
        gsap.fromTo('.as-ghost.is-l', { y: 160, rotate: -14 }, { y: -160, rotate: -6, ease: 'none', scrollTrigger: st })
        gsap.fromTo('.as-ghost.is-r', { y: -60, rotate: 12 }, { y: 220, rotate: 6, ease: 'none', scrollTrigger: st })
        gsap.fromTo('.as-main', { rotateY: -14, rotateX: 6 }, { rotateY: 10, rotateX: -4, ease: 'none', scrollTrigger: st })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  const f = FEATURES[step]
  return (
    <section className="as" id="app" ref={root}>
      <div className="as-head wrap">
        <span className="mono eyebrow">The Arca app · iOS & Android</span>
        <h2 className="h-xl">
          <span className="line-mask">
            <span>Your next home,</span>
          </span>
          <span className="line-mask">
            <span>
              <em className="serif">one tap</em> away.
            </span>
          </span>
        </h2>
        <div className="as-head-row">
          <p className="muted">
            Everything on Arca — the feed, the live map, tour booking and the AI concierge — redesigned for your pocket.
            Launching in spring.
          </p>
          <div className="as-head-cta">
            <StoreBadges />
            <Waitlist />
          </div>
        </div>
      </div>

      {/* desktop: pinned sequence */}
      <div className="as-pin">
        <div className="as-sticky wrap">
          <div className="as-copy">
            <span className="as-num mono">
              0{step + 1} <em>/ 0{SCREENS.length}</em>
            </span>
            <div className="as-copy-swap" key={step}>
              <h3 className="h-md">{f.title}</h3>
              <p className="muted">{f.body}</p>
              <ul>
                {f.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {step === 3 && (
                <button className="btn is-sm" onClick={() => chat.open()}>
                  Try the concierge now
                </button>
              )}
            </div>
          </div>

          <div className="as-stage">
            <Phone className="as-ghost is-l" time="9:40">
              <MapScreen />
            </Phone>
            <Phone className="as-ghost is-r" time="9:42">
              <ChatScreen />
            </Phone>
            <div className="as-main-wrap">
              <Phone className="as-main">
                <div className="as-layers">
                  {SCREENS.map((S, i) => (
                    <div key={i} className={`as-layer ${i === step ? 'is-on' : i < step ? 'is-past' : ''}`} aria-hidden={i !== step}>
                      <S />
                    </div>
                  ))}
                </div>
              </Phone>
              <span className="as-glow" aria-hidden />
            </div>
          </div>

          <ol className="as-steps">
            {FEATURES.map((x, i) => (
              <li key={x.key} className={i === step ? 'is-on' : i < step ? 'is-past' : ''}>
                <span className="mono">0{i + 1}</span>
                {x.key}
              </li>
            ))}
            <span className="as-track" aria-hidden>
              <i />
            </span>
          </ol>
        </div>
      </div>

      {/* mobile: snap carousel */}
      <div className="as-rail">
        {SCREENS.map((S, i) => (
          <figure key={i} className="as-slide">
            <Phone>
              <S />
            </Phone>
            <figcaption>
              <span className="mono">
                0{i + 1} · {FEATURES[i].key}
              </span>
              <b>{FEATURES[i].title}</b>
              <small className="muted">{FEATURES[i].body}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

