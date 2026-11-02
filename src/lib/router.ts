import { useSyncExternalStore } from 'react'

// Tiny hash router: #/search?deal=buy  ->  { path: '/search', query: URLSearchParams }

const read = () => {
  const raw = location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  return { path: path || '/', query: new URLSearchParams(qs), raw }
}

let current = read()
const subs = new Set<() => void>()
window.addEventListener('hashchange', () => {
  current = read()
  subs.forEach((s) => s())
})

export const useRoute = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => current,
  )

export function go(to: string) {
  const next = to.startsWith('#') ? to : `#${to}`
  if (location.hash === next) return
  location.hash = next
}

/** Match "/listing/:id" against a path; returns params or null. */
export function match(pattern: string, path: string) {
  const a = pattern.split('/')
  const b = path.split('/')
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}
