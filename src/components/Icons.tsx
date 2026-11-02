// Minimal line icon set (24px grid, stroke = currentColor).
import type { SVGProps } from 'react'

const base = (d: React.ReactNode) => (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    {d}
  </svg>
)

export const I = {
  heart: base(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
  bed: base(
    <>
      <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </>,
  ),
  bath: base(<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />),
  area: base(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />),
  pin: base(
    <>
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>,
  ),
  search: base(
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </>,
  ),
  arrow: base(<path d="M5 12h14M13 6l6 6-6 6" />),
  arrowUR: base(<path d="M7 17 17 7M8 7h9v9" />),
  left: base(<path d="M15 6l-6 6 6 6" />),
  right: base(<path d="M9 6l6 6-6 6" />),
  close: base(<path d="M6 6l12 12M18 6 6 18" />),
  check: base(<path d="m5 12 4.5 4.5L19 7" />),
  sun: base(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>,
  ),
  moon: base(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />),
  spark: base(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />),
  share: base(<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />),
  phone: base(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />),
  mail: base(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>,
  ),
  calendar: base(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>,
  ),
  leaf: base(<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" />),
  walk: base(
    <>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M10 21l2-6 3 3v3M9 12l2-4 4 2 2 3M11 8l-3 4" />
    </>,
  ),
  train: base(
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14M8 21l2-4M16 21l-2-4" />
      <circle cx="9" cy="14" r=".5" />
      <circle cx="15" cy="14" r=".5" />
    </>,
  ),
  bolt: base(<path d="M13 2 4 14h7l-1 8 9-12h-7z" />),
  grid: base(
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>,
  ),
  map: base(<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />),
  plus: base(<path d="M12 5v14M5 12h14" />),
  minus: base(<path d="M5 12h14" />),
  menu: base(<path d="M4 8h16M4 16h16" />),
  star: base(<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z" />),
  home: base(<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />),
  key: base(
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l3 3M15 8l2 2" />
    </>,
  ),
  doc: base(<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />),
  compare: base(<path d="M8 4v16M16 4v16M4 8h4M16 16h4M4 16h4M16 8h4" />),
}

/** Arca brand mark: a house folded from one line. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`logo-mark ${className}`} aria-hidden>
      <rect width="32" height="32" rx="10" className="lm-bg" />
      <path d="M8 24V15l8-7 8 7v9h-5v-6h-6v6z" className="lm-house" />
    </svg>
  )
}
