import { useSyncExternalStore } from 'react'
import { reducedMotion } from './anim'

/* ---------- saved homes (persisted per browser) ---------- */

const KEY = 'arca-saved'
const load = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
let saved = load()
const subs = new Set<() => void>()

export const savedStore = {
  get: () => saved,
  toggle(id: string) {
    saved = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]
    try {
      localStorage.setItem(KEY, JSON.stringify(saved))
    } catch {
      /* storage blocked — keep in memory */
    }
    subs.forEach((s) => s())
  },
  subscribe(cb: () => void) {
    subs.add(cb)
    return () => subs.delete(cb)
  },
}
export const useSaved = () => useSyncExternalStore(savedStore.subscribe, savedStore.get)

/* ---------- light / dark ---------- */

export type Mode = 'light' | 'dark'
export const getMode = (): Mode => (document.documentElement.dataset.theme as Mode) ?? 'light'

const modeSubs = new Set<() => void>()
new MutationObserver(() => modeSubs.forEach((s) => s())).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})
export const useMode = () =>
  useSyncExternalStore(
    (cb) => {
      modeSubs.add(cb)
      return () => modeSubs.delete(cb)
    },
    getMode,
  )

/** Flip theme with a circular wipe from the click point. */
export function toggleMode(origin?: { x: number; y: number }) {
  const next: Mode = getMode() === 'dark' ? 'light' : 'dark'
  const commit = () => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('arca-mode', next)
    } catch {
      /* ignore */
    }
  }
  if (!origin || !document.startViewTransition || reducedMotion()) return commit()
  const { x, y } = origin
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  document.startViewTransition(commit).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 800, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' },
    )
  })
}

/* ---------- concierge open state (so any button can open the chat) ---------- */

let chatOpen = false
let chatSeed: string | null = null
const chatSubs = new Set<() => void>()
export const chat = {
  get: () => chatOpen,
  /** open the concierge, optionally sending a first question */
  open(seed?: string) {
    chatOpen = true
    chatSeed = seed ?? null
    chatSubs.forEach((s) => s())
  },
  close() {
    chatOpen = false
    chatSubs.forEach((s) => s())
  },
  takeSeed() {
    const s = chatSeed
    chatSeed = null
    return s
  },
  subscribe(cb: () => void) {
    chatSubs.add(cb)
    return () => chatSubs.delete(cb)
  },
}
export const useChatOpen = () => useSyncExternalStore(chat.subscribe, chat.get)
