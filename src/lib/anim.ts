import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const scroll: { lenis: Lenis | null } = { lenis: null }

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToHash(hash: string) {
  const el = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash)
  if (el === null) return
  if (scroll.lenis) scroll.lenis.scrollTo(el, { duration: 1.8 })
  else if (el === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Masked line reveal for `[data-reveal]` blocks and a soft rise for `[data-fade]` within scope. */
export function revealLines(scope: Element) {
  scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((block) => {
    gsap.from(block.querySelectorAll('.line > span'), {
      yPercent: 115,
      rotate: 3,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: block, start: 'top 85%' },
    })
  })
  scope.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
}

/** Count `[data-count]` numbers up when they enter the viewport. */
export function countUp(scope: Element) {
  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    const decimals = Number(el.dataset.decimals ?? 0)
    const prefix = el.dataset.prefix ?? ''
    const suffix = el.dataset.suffix ?? ''
    const obj = { v: 0 }
    const fmt = (v: number) =>
      prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
    el.textContent = fmt(0)
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = fmt(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 95%' },
    })
  })
}
