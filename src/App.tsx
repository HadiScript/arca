import { useEffect, useLayoutEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, reducedMotion, scroll } from './lib/anim'
import { match, useRoute } from './lib/router'
import { Footer, Header } from './components/Header'
import { Concierge } from './components/Concierge'
import { Home } from './pages/Home'
import { Search } from './pages/Search'
import { ListingPage } from './pages/ListingPage'
import { Agents, Saved } from './pages/Agents'
import { AppPage } from './pages/AppPage'
import './styles/base.css'
import './styles/app.css'

function Routes() {
  const { path } = useRoute()
  const listing = match('/listing/:id', path)
  if (listing) return <ListingPage key={listing.id} id={listing.id} />
  switch (path) {
    case '/search':
      return <Search />
    case '/agents':
      return <Agents />
    case '/saved':
      return <Saved />
    case '/app':
      return <AppPage />
    default:
      return <Home />
  }
}

export default function App() {
  const route = useRoute()
  const curtain = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    if (reducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1 })
    scroll.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      scroll.lenis = null
    }
  }, [])

  // page change: jump to top behind a quick curtain wipe, then re-measure triggers
  useLayoutEffect(() => {
    scroll.lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    if (!reducedMotion()) {
      gsap.fromTo(curtain.current, { yPercent: 0 }, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' })
      gsap.from('main', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 0.2 })
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => window.clearTimeout(id)
  }, [route.path])

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <Header />
      <Routes />
      <Footer />
      <Concierge />
      <div className="curtain" ref={curtain} aria-hidden>
        <span>arca</span>
      </div>
    </>
  )
}
