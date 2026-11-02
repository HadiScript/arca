import type { ReactNode } from 'react'
import { agentOf, hoodOf, hoods, img, listings, priceLabel } from '../data'

// High-fidelity screens of the upcoming Arca iOS app — pure HTML/CSS on real catalogue data.

const feed = [listings[2], listings[0], listings[4]]
const pinned = listings.slice(0, 9)
const hero = listings[1]
const chatPick = listings[3]

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={fill ? 'is-fill' : ''} aria-hidden>
      <path d={d} />
    </svg>
  )
}
const I = {
  home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  back: 'M15 5l-7 7 7 7',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v7h14v-7',
  bed: 'M3 18V8M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6',
  bath: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0',
  area: 'M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l16 16',
  send: 'M4 12l16-8-6 16-2-7z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  pin: 'M12 21s-6-5.7-6-11a6 6 0 1 1 12 0c0 5.3-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
}

export function TabBar({ active }: { active: 0 | 1 | 2 | 3 | 4 }) {
  const tabs: [string, string][] = [
    [I.home, 'Discover'],
    [I.map, 'Map'],
    [I.spark, 'Ask'],
    [I.heart, 'Saved'],
    [I.user, 'You'],
  ]
  return (
    <nav className="app-tabs">
      {tabs.map(([d, l], i) => (
        <span key={l} className={i === active ? 'is-on' : ''}>
          <Icon d={d} fill={i === active && i !== 2} />
          {l}
        </span>
      ))}
    </nav>
  )
}

function Facts({ beds, baths, area }: { beds: number; baths: number; area: number }) {
  return (
    <span className="app-facts">
      <span>
        <Icon d={I.bed} />
        {beds || 'Studio'}
      </span>
      <span>
        <Icon d={I.bath} />
        {baths}
      </span>
      <span>
        <Icon d={I.area} />
        {area} m²
      </span>
    </span>
  )
}

export function DiscoverScreen() {
  return (
    <div className="app app-discover">
      <header className="app-head">
        <div>
          <small>Good evening, Ana</small>
          <b>
            Find your <em>place</em>
          </b>
        </div>
        <span className="app-avatar" style={{ backgroundImage: `url(${img('1534528741775-53994a69daeb', 120)})` }} />
      </header>
      <div className="app-search">
        <Icon d={I.search} />
        <span>Chiado · 2+ beds · under €1M</span>
        <i>
          <Icon d={I.filter} />
        </i>
      </div>
      <div className="app-cats">
        {['For you', 'Buy', 'Rent', 'New builds', 'Sea view'].map((c, i) => (
          <span key={c} className={i === 0 ? 'is-on' : ''}>
            {c}
          </span>
        ))}
      </div>
      <div className="app-feed">
        {feed.map((l, i) => (
          <article key={l.id} className={`app-card ${i === 0 ? 'is-big' : ''}`}>
            <div className="app-card-img" style={{ backgroundImage: `url(${img(l.photos[0], 700)})` }}>
              <span className="app-pill">{hoodOf(l.hood).name}</span>
              <span className="app-heart">
                <Icon d={I.heart} fill={i === 0} />
              </span>
              {i === 0 && (
                <span className="app-dots">
                  <i className="is-on" />
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <div className="app-card-body">
              <b>{priceLabel(l)}</b>
              <span>{l.title}</span>
              <Facts beds={l.beds} baths={l.baths} area={l.area} />
            </div>
          </article>
        ))}
      </div>
      <TabBar active={0} />
    </div>
  )
}

export function MapScreen() {
  const sheet = listings[6]
  return (
    <div className="app app-map">
      <div className="app-mapview">
        <svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <pattern id="app-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M6 0H0V6" fill="none" className="grid" />
            </pattern>
          </defs>
          <rect width="100" height="160" className="land" />
          <rect width="100" height="160" fill="url(#app-grid)" />
          {hoods.map((h) => (
            <circle key={h.id} cx={h.x} cy={h.y * 1.1 + 6} r="13" className="hood" />
          ))}
          <path d="M-5 112 C 20 104, 40 118, 60 106 S 92 92, 110 96 L110 170 L-5 170Z" className="river" />
          <path d="M-5 72 C 30 80 60 60 110 70 M30 0 C 34 50 46 90 40 160 M70 0 C 64 60 74 100 92 160" className="road" />
        </svg>
        {pinned.map((l, i) => (
          <span
            key={l.id}
            className={`app-pin ${i === 6 ? 'is-on' : ''}`}
            style={{ left: `${l.x}%`, top: `${(l.y * 1.1 + 6) / 1.6}%` }}
          >
            {priceLabel(l).replace('/mo', '')}
          </span>
        ))}
        <div className="app-map-top">
          <span className="app-back">
            <Icon d={I.search} />
            Lisbon & coast
          </span>
          <span className="app-round">
            <Icon d={I.filter} />
          </span>
        </div>
      </div>
      <div className="app-sheet">
        <i className="app-grab" />
        <div className="app-sheet-row">
          <span className="app-sheet-img" style={{ backgroundImage: `url(${img(sheet.photos[0], 300)})` }} />
          <div>
            <b>{priceLabel(sheet)}</b>
            <span>{sheet.title}</span>
            <Facts beds={sheet.beds} baths={sheet.baths} area={sheet.area} />
          </div>
        </div>
        <small>
          <i /> 9 homes in this area · tap a pin
        </small>
      </div>
      <TabBar active={1} />
    </div>
  )
}

export function DetailScreen() {
  const a = agentOf(hero.agent)
  return (
    <div className="app app-detail">
      <div className="app-detail-hero" style={{ backgroundImage: `url(${img(hero.photos[0], 800)})` }}>
        <div className="app-map-top">
          <span className="app-round">
            <Icon d={I.back} />
          </span>
          <span className="app-round-group">
            <span className="app-round">
              <Icon d={I.share} />
            </span>
            <span className="app-round">
              <Icon d={I.heart} fill />
            </span>
          </span>
        </div>
        <span className="app-count">1 / {hero.photos.length}</span>
      </div>
      <div className="app-detail-body">
        <span className="app-pill is-accent">{hero.tags[0] ?? 'Featured'}</span>
        <b className="app-price">{priceLabel(hero)}</b>
        <span className="app-title">{hero.title}</span>
        <span className="app-addr">
          <Icon d={I.pin} />
          {hero.address}, {hoodOf(hero.hood).name}
        </span>
        <div className="app-stats">
          <span>
            <b>{hero.beds}</b>beds
          </span>
          <span>
            <b>{hero.baths}</b>baths
          </span>
          <span>
            <b>{hero.area}</b>m²
          </span>
          <span>
            <b>{hero.energy}</b>energy
          </span>
        </div>
        <div className="app-agent">
          <span className="app-avatar" style={{ backgroundImage: `url(${img(a.img, 120)})` }} />
          <div>
            <b>{a.name}</b>
            <small>
              ★ {a.rating} · replies in ~5 min
            </small>
          </div>
          <span className="app-round is-soft">
            <Icon d={I.send} />
          </span>
        </div>
        <div className="app-slots">
          {['Thu 14', 'Fri 15', 'Sat 16', 'Mon 18'].map((d, i) => (
            <span key={d} className={i === 1 ? 'is-on' : ''}>
              {d}
            </span>
          ))}
        </div>
        <span className="app-cta">Book a tour · Fri 11:30</span>
      </div>
    </div>
  )
}

function Bubble({ me, children }: { me?: boolean; children: ReactNode }) {
  return <div className={`app-bubble ${me ? 'is-me' : ''}`}>{children}</div>
}

export function ChatScreen() {
  return (
    <div className="app app-chat">
      <header className="app-chat-head">
        <span className="app-orb" />
        <div>
          <b>Arca Concierge</b>
          <small>
            <i /> Online · AI
          </small>
        </div>
      </header>
      <div className="app-thread">
        <Bubble me>Two-bed to rent near the river, under €2.5k, with outdoor space?</Bubble>
        <Bubble>
          Found 2 that fit. This one in <b>Alfama</b> has a private terrace with sunset views:
        </Bubble>
        <div className="app-mini">
          <span style={{ backgroundImage: `url(${img(chatPick.photos[0], 300)})` }} />
          <div>
            <b>{priceLabel(chatPick)}</b>
            <small>{chatPick.title}</small>
          </div>
        </div>
        <Bubble me>Is it pet-friendly?</Bubble>
        <Bubble>Yes — pets allowed, and Clara can show it this Friday.</Bubble>
        <div className="app-typing">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="app-suggest">
        <span>Book Friday</span>
        <span>Commute to Chiado?</span>
      </div>
      <div className="app-input">
        <span>Ask anything about a home…</span>
        <i>
          <Icon d={I.send} />
        </i>
      </div>
    </div>
  )
}

export const SCREENS = [DiscoverScreen, MapScreen, DetailScreen, ChatScreen]
