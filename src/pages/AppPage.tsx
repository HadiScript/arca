import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/anim'
import { chat } from '../lib/store'
import { Phone } from '../components/Phone'
import { ChatScreen, DetailScreen, DiscoverScreen } from '../components/AppScreens'
import { AppShowcase, StoreBadges, Waitlist } from '../components/AppShowcase'
import '../styles/showcase.css'

const FEATURES = [
  { title: 'Saved searches & alerts', body: 'Save any search and get a push the minute a matching home — or a price drop — goes live.', icon: 'M6 4h12v17l-6-4-6 4zM9 9h6' },
  { title: 'Live tour booking', body: 'Agents’ real calendars inside the app. Pick a slot, add it to yours, get directions.', icon: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5M9 15l2 2 4-4' },
  { title: 'Offline maps', body: 'Download neighbourhoods before a viewing day — pins, photos and notes work without signal.', icon: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14' },
  { title: 'AI concierge', body: 'Ask in plain words: “3 beds near a good school, under €1.2M”. Get homes, not links.', icon: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z' },
  { title: 'Mortgage calculator', body: 'Live repayments on every listing with Portuguese rates, fees and stamp duty built in.', icon: 'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2M9 18h6' },
  { title: 'Secure documents', body: 'Offers, IDs and contracts in an encrypted vault you share with one tap — and revoke as easily.', icon: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3M12 15v2' },
]

const FAQ = [
  { q: 'When does the Arca app launch?', a: 'We’re in private beta in Lisbon now and plan a public launch on iOS and Android in spring. Waitlist members get in first.' },
  { q: 'Is it free?', a: 'Yes. Searching, saving, alerts, tour booking and the AI concierge are free for buyers and renters.' },
  { q: 'Does my web account carry over?', a: 'Your saved homes and searches sync automatically between arca on the web and the app.' },
  { q: 'How does the AI concierge handle my data?', a: 'Conversations are used only to answer you and are never sold. You can clear your history at any time from settings.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ap-faq-item ${open ? 'is-open' : ''}`}>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{q}</span>
        <i aria-hidden />
      </button>
      <div className="ap-faq-a">
        <p className="muted">{a}</p>
      </div>
    </div>
  )
}

export function AppPage() {
  const root = useRef<HTMLElement>(null)
  const fan = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.ap-hero .line-mask > span', { yPercent: 110, duration: 1.3, stagger: 0.08 })
        .from('.ap-hero-sub > *', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.3)
        .from('.ap-fan .phone', { y: 220, opacity: 0, rotate: 0, duration: 1.6, stagger: 0.1 }, 0.15)
      gsap.from('.ap-feat', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '.ap-grid', start: 'top 85%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // fanned phones lean toward the cursor
  useEffect(() => {
    const el = fan.current
    if (!el || reducedMotion() || !matchMedia('(pointer: fine)').matches) return
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.8, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.8, ease: 'power3' })
    const move = (e: PointerEvent) => {
      ry((e.clientX / innerWidth - 0.5) * 16)
      rx(-(e.clientY / innerHeight - 0.5) * 10)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <main className="page ap" ref={root}>
      <section className="ap-hero wrap">
        <div className="ap-hero-copy">
          <span className="mono eyebrow">Arca for iOS & Android</span>
          <h1 className="h-xl">
            <span className="line-mask">
              <span>Arca, in</span>
            </span>
            <span className="line-mask">
              <span>
                your <em className="serif">pocket.</em>
              </span>
            </span>
          </h1>
          <div className="ap-hero-sub">
            <p className="muted">
              The whole Lisbon market, a live map, instant tour booking and an AI concierge that actually knows the
              listings. Built for the moment you’re standing outside a door you love.
            </p>
            <StoreBadges />
            <Waitlist />
          </div>
        </div>
        <div className="ap-fan-wrap">
          <div className="ap-fan" ref={fan}>
            <Phone className="ap-f is-l" time="9:40">
              <DetailScreen />
            </Phone>
            <Phone className="ap-f is-c">
              <DiscoverScreen />
            </Phone>
            <Phone className="ap-f is-r" time="9:42">
              <ChatScreen />
            </Phone>
          </div>
          <span className="as-glow" aria-hidden />
        </div>
      </section>

      <AppShowcase />

      <section className="ap-features wrap">
        <div className="ap-sec-head">
          <span className="mono eyebrow">Built in</span>
          <h2 className="h-lg">
            Six things you’ll <em className="serif">wonder</em> how you lived without.
          </h2>
        </div>
        <div className="ap-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="ap-feat">
              <span className="ap-ico">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d={f.icon} />
                </svg>
              </span>
              <h3>{f.title}</h3>
              <p className="muted">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ap-faq wrap">
        <div className="ap-sec-head">
          <span className="mono eyebrow">Questions</span>
          <h2 className="h-lg">Good to know.</h2>
          <button className="btn is-ghost is-sm" onClick={() => chat.open('Tell me about the Arca mobile app')}>
            Ask the concierge instead
          </button>
        </div>
        <div className="ap-faq-list">
          {FAQ.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </section>

      <section className="ap-cta wrap">
        <div className="ap-cta-card">
          <h2 className="h-lg">
            Be first through <em className="serif">the door.</em>
          </h2>
          <p>Join the waitlist — early members get the beta, priority tour slots and launch-day alerts.</p>
          <Waitlist compact />
          <StoreBadges />
        </div>
      </section>
    </main>
  )
}
