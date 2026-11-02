import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { hoods, img, priceLabel, type Listing } from '../data'
import { go } from '../lib/router'
import { I } from './Icons'

/*
 * A stylised vector map of Lisbon & the coast (not to scale): land, the Tagus, the
 * Atlantic, parks and district bubbles, with HTML price pins on top so they stay crisp.
 * Drag to pan, wheel / buttons to zoom. Pins counter-scale so they never grow with zoom.
 */

const RIVER = 'M0 760 C 120 700, 220 690, 330 650 S 560 600, 690 560 S 860 440, 930 330 S 990 250, 1000 230 L 1000 700 L 0 700 Z'
// keep pins off the very edge: map 0..100 data space into 6..94 %
const pos = (v: number) => 6 + v * 0.88

const ROADS = [
  'M60 560 C 200 500, 330 470, 470 420 S 700 360, 860 190',
  'M330 120 C 360 260, 420 360, 520 380',
  'M440 80 C 470 200, 500 300, 540 380',
  'M620 60 C 640 200, 660 300, 680 360',
  'M150 460 C 260 420, 330 340, 380 260',
  'M700 120 C 760 160, 820 170, 900 150',
]

export function CityMap({
  items,
  hover,
  onHover,
  selected,
  onSelect,
  showHoods = true,
  compact = false,
}: {
  items: Listing[]
  hover?: string | null
  onHover?: (id: string | null) => void
  selected?: string | null
  onSelect?: (id: string | null) => void
  showHoods?: boolean
  compact?: boolean
}) {
  const [z, setZ] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null)
  const box = useRef<HTMLDivElement>(null)

  const clamp = (p: { x: number; y: number }, zz = z) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return p
    const mx = (r.width * (zz - 1)) / 2
    const my = (r.height * (zz - 1)) / 2
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) }
  }

  const zoom = (d: number) =>
    setZ((v) => {
      const n = Math.max(1, Math.min(3, +(v + d).toFixed(2)))
      setPan((p) => clamp(p, n))
      return n
    })

  useEffect(() => {
    const el = box.current!
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      zoom(e.deltaY < 0 ? 0.2 : -0.2)
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  })

  const down = (e: RPE<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false }
  }
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      d.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (d.moved) setPan(clamp({ x: d.px + dx, y: d.py + dy }))
  }
  const up = () => {
    if (drag.current && !drag.current.moved) onSelect?.(null)
    drag.current = null
  }

  const sel = items.find((i) => i.id === selected)

  return (
    <div className={`citymap ${compact ? 'is-compact' : ''}`} data-lenis-prevent>
      <div className="cm-viewport" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="cm-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${z})`, ['--z' as string]: z }}>
          <svg viewBox="0 0 1000 700" preserveAspectRatio="none" className="cm-svg" aria-hidden>
            <defs>
              <pattern id="cm-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="cm-dot" />
              </pattern>
            </defs>
            <rect width="1000" height="700" className="cm-land" />
            <rect width="1000" height="700" fill="url(#cm-dots)" />
            <path d="M0 520 C 60 560, 90 640, 70 700 L 0 700 Z" className="cm-ocean" />
            <ellipse cx="230" cy="350" rx="120" ry="90" className="cm-park" />
            <ellipse cx="380" cy="300" rx="34" ry="24" className="cm-park" />
            <ellipse cx="840" cy="120" rx="70" ry="30" className="cm-park" />
            {ROADS.map((d) => (
              <path key={d} d={d} className="cm-road" />
            ))}
            <path d={RIVER} className="cm-river" />
            <path d="M640 575 C 700 610, 760 640, 840 650" className="cm-bridge" />
            <path d="M880 330 L 1000 420" className="cm-bridge" />
            <text x="620" y="650" className="cm-water-label">
              RIO TEJO
            </text>
            <text x="12" y="690" className="cm-water-label">
              ATLÂNTICO
            </text>
            {showHoods &&
              hoods.map((h) => (
                <g key={h.id}>
                  <circle cx={pos(h.x) * 10} cy={pos(h.y) * 7} r={compact ? 46 : 58} className="cm-hood" />
                  <text x={pos(h.x) * 10} y={pos(h.y) * 7 - (compact ? 52 : 66)} className="cm-hood-label" textAnchor="middle">
                    {h.name.toUpperCase()}
                  </text>
                </g>
              ))}
          </svg>
          {items.map((l) => (
            <button
              key={l.id}
              className={`cm-pin ${hover === l.id ? 'is-hover' : ''} ${selected === l.id ? 'is-on' : ''} ${l.deal}`}
              style={{ left: `${pos(l.x)}%`, top: `${pos(l.y)}%` }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSelect?.(selected === l.id ? null : l.id)}
              onMouseEnter={() => onHover?.(l.id)}
              onMouseLeave={() => onHover?.(null)}
              aria-label={`${l.title}, ${priceLabel(l)}`}
            >
              <span>{priceLabel(l)}</span>
            </button>
          ))}
        </div>
      </div>

      {sel && (
        <div className="cm-pop" key={sel.id}>
          <img src={img(sel.photos[0], 500)} alt="" />
          <div>
            <b>{priceLabel(sel)}</b>
            <span>{sel.title}</span>
            <button className="btn is-sm" onClick={() => go(`/listing/${sel.id}`)}>
              View home <I.arrow />
            </button>
          </div>
          <button className="cm-pop-x" onClick={() => onSelect?.(null)} aria-label="Close">
            <I.close />
          </button>
        </div>
      )}

      <div className="cm-ctrl">
        <button onClick={() => zoom(0.3)} aria-label="Zoom in">
          <I.plus />
        </button>
        <button onClick={() => zoom(-0.3)} aria-label="Zoom out">
          <I.minus />
        </button>
        <button
          onClick={() => {
            setZ(1)
            setPan({ x: 0, y: 0 })
          }}
          aria-label="Reset map"
          className="mono"
        >
          1×
        </button>
      </div>
      <span className="cm-legend mono">
        <i className="buy" /> Sale <i className="rent" /> Rent
      </span>
    </div>
  )
}
