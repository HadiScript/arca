import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** degrees of Y rotation for a resting 3D tilt */
  tilt?: number
  time?: string
  style?: CSSProperties
}

/*
 * A realistic phone: titanium bezel, side buttons, dynamic island and status bar.
 * Everything is sized in `em`, so setting font-size on `.phone` scales the whole device.
 */
export function Phone({ children, className = '', tilt = 0, time = '9:41', style }: Props) {
  return (
    <div
      className={`phone ${className}`}
      style={{ ...(tilt ? { transform: `perspective(1600px) rotateY(${tilt}deg)` } : null), ...style }}
    >
      <i className="ph-btn is-action" aria-hidden />
      <i className="ph-btn is-vol-up" aria-hidden />
      <i className="ph-btn is-vol-down" aria-hidden />
      <i className="ph-btn is-power" aria-hidden />
      <div className="ph-screen">
        <div className="ph-status" aria-hidden>
          <span className="ph-time">{time}</span>
          <span className="ph-island" />
          <span className="ph-icons">
            <svg viewBox="0 0 18 12">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
              <rect x="10" y="3" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg viewBox="0 0 16 12">
              <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0zM1 4.4a9.9 9.9 0 0 1 14 0l-1.4 1.4a7.9 7.9 0 0 0-11.2 0z" />
            </svg>
            <span className="ph-batt">
              <i />
            </span>
          </span>
        </div>
        <div className="ph-content">{children}</div>
        <span className="ph-home" aria-hidden />
      </div>
    </div>
  )
}
