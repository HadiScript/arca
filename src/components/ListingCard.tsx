import { useState, type MouseEvent } from 'react'
import { hoodOf, img, priceLabel, type Listing } from '../data'
import { go } from '../lib/router'
import { savedStore, useSaved } from '../lib/store'
import { I } from './Icons'

export function SaveButton({ id, className = '' }: { id: string; className?: string }) {
  const saved = useSaved().includes(id)
  return (
    <button
      className={`save-btn ${saved ? 'is-on' : ''} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save home'}
      onClick={(e) => {
        e.stopPropagation()
        savedStore.toggle(id)
      }}
    >
      <I.heart />
    </button>
  )
}

export function Facts({ l }: { l: Listing }) {
  return (
    <span className="facts">
      <span>
        <I.bed /> {l.beds === 0 ? 'Studio' : `${l.beds} bd`}
      </span>
      <span>
        <I.bath /> {l.baths} ba
      </span>
      <span>
        <I.area /> {l.area} m²
      </span>
    </span>
  )
}

/** Listing card — scrub across the photo to flick through the gallery. */
export function ListingCard({
  l,
  onHover,
  active = false,
  size = 'md',
}: {
  l: Listing
  onHover?: (id: string | null) => void
  active?: boolean
  size?: 'md' | 'lg'
}) {
  const [shot, setShot] = useState(0)
  const pics = l.photos.slice(0, 4)

  const scrub = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setShot(Math.min(pics.length - 1, Math.floor(((e.clientX - r.left) / r.width) * pics.length)))
  }

  return (
    <article
      className={`lcard is-${size} ${active ? 'is-active' : ''}`}
      onMouseEnter={() => onHover?.(l.id)}
      onMouseLeave={() => {
        onHover?.(null)
        setShot(0)
      }}
      onClick={() => go(`/listing/${l.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && go(`/listing/${l.id}`)}
    >
      <div className="lcard-media" onMouseMove={scrub}>
        {pics.map((p, i) => (
          <img key={p} src={img(p, 900)} alt={i === 0 ? l.title : ''} loading="lazy" className={i === shot ? 'is-on' : ''} />
        ))}
        <div className="lcard-top">
          <span className="lcard-tags">
            <span className="tag is-dark">{l.deal === 'rent' ? 'For rent' : 'For sale'}</span>
            {l.tags.slice(0, 1).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </span>
          <SaveButton id={l.id} />
        </div>
        <span className="lcard-dots">
          {pics.map((p, i) => (
            <i key={p} className={i === shot ? 'is-on' : ''} />
          ))}
        </span>
      </div>
      <div className="lcard-body">
        <div className="lcard-row">
          <b className="lcard-price">{priceLabel(l)}</b>
          <span className="mono muted">{hoodOf(l.hood).name}</span>
        </div>
        <h3>{l.title}</h3>
        <Facts l={l} />
      </div>
    </article>
  )
}
