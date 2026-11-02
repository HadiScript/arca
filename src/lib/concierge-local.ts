import { agentOf, euro, hoodOf, listings, priceLabel, type Deal, type Hood, type Kind, type Listing } from '../data'

/*
 * Offline concierge: a small intent parser over the catalogue, used when the Claude
 * endpoint is unavailable. Replies use the same [[listing:ID]] tokens as the model.
 */

type Turn = { role: 'user' | 'assistant'; content: string }

type Query = {
  deal?: Deal
  max?: number
  min?: number
  beds?: number
  kinds: Kind[]
  hoods: string[]
  features: string[]
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, studio: 0 }

const HOOD_ALIASES: Record<string, string[]> = {
  chiado: ['chiado', 'baixa', 'bairro alto'],
  'principe-real': ['principe real', 'principe-real', 'principe'],
  alfama: ['alfama', 'graca', 'castle'],
  estrela: ['estrela', 'lapa', 'campo de ourique', 'sao bento'],
  belem: ['belem', 'restelo'],
  parque: ['parque das nacoes', 'parque', 'expo', 'oriente', 'oceanario'],
  cascais: ['cascais', 'estoril', 'guincho', 'coast', 'coastal', 'seaside', 'beach'],
}

const KIND_WORDS: [Kind, RegExp][] = [
  ['Penthouse', /penthouse/],
  ['Villa', /villa/],
  ['Loft', /loft/],
  ['Studio', /\bstudio\b/],
  ['House', /\b(house|townhouse|home with garden|detached)\b/],
  ['Apartment', /\b(apartment|flat|apt|condo)\b/],
]

const FEATURES: [string, RegExp, (l: Listing) => boolean][] = [
  ['pool', /pool/, (l) => has(l, /pool/)],
  ['terrace', /terrace|rooftop|roof/, (l) => has(l, /terrace|roof/)],
  ['garden', /garden|outdoor|yard/, (l) => has(l, /garden|patio/)],
  ['view', /view|river|ocean|sea\b|tagus/, (l) => has(l, /view|river|ocean|sea/)],
  ['furnished', /furnish/, (l) => has(l, /furnish/)],
  ['parking', /parking|garage|car\b/, (l) => has(l, /garage|parking/)],
  ['new build', /new build|new-build|brand new|modern|contemporary/, (l) => l.year >= 2019],
  ['investment', /invest|yield|rental income|airbnb|short.?let/, (l) => has(l, /invest|yield|licensed|rented/)],
  ['pets', /\bpets?\b|dog|cat\b/, (l) => has(l, /pet/)],
  ['lift', /\blift\b|elevator/, (l) => has(l, /lift/)],
]

function has(l: Listing, re: RegExp) {
  return re.test(norm([l.title, l.blurb, ...l.features, ...l.tags].join(' ')))
}

/** "1.5M", "900k", "€2,000", "2000 a month" → euros */
function money(raw: string, unit?: string) {
  const n = parseFloat(raw.replace(/,(?=\d{3}\b)/g, '').replace(',', '.'))
  if (Number.isNaN(n)) return undefined
  const u = (unit ?? '').toLowerCase()
  if (u.startsWith('m')) return n * 1_000_000
  if (u === 'k') return n * 1000
  return n
}

function parse(text: string): Query {
  const t = norm(text)
  const q: Query = { kinds: [], hoods: [], features: [] }

  if (/\b(rent|rental|renting|lease|let|per month|a month|\/mo|monthly rent)\b/.test(t)) q.deal = 'rent'
  if (/\b(buy|buying|purchase|for sale|own|mortgage|invest)\b/.test(t)) q.deal = q.deal === 'rent' ? undefined : 'buy'

  // budget: "under 1.5m", "max €2,500", "below 900k", "up to 3000"
  const cap = t.match(/(?:under|below|max(?:imum)?|up to|less than|budget(?: of| is)?|within|<)\s*€?\s*([\d.,]+)\s*(k|m|million|mil)?/)
  if (cap) q.max = money(cap[1], cap[2])
  const floor = t.match(/(?:over|above|more than|from|at least|>)\s*€?\s*([\d.,]+)\s*(k|m|million|mil)?/)
  if (floor) q.min = money(floor[1], floor[2])
  if (!q.max) {
    const loose = t.match(/€\s*([\d.,]+)\s*(k|m|million|mil)?|([\d.,]+)\s*(k|m|million)\b|([\d.,]{4,})\s*(?:euros?|eur)\b/)
    if (loose) q.max = money(loose[1] ?? loose[3] ?? loose[5], loose[2] ?? loose[4])
  }
  if (q.max && q.max < 25_000 && !q.deal) q.deal = 'rent'
  if (q.max && q.max >= 100_000 && !q.deal) q.deal = 'buy'

  const beds = t.match(/(\d|one|two|three|four|five|six)\s*-?\s*(?:bed|bedroom|br\b|quarto|room)/)
  if (beds) q.beds = /\d/.test(beds[1]) ? Number(beds[1]) : WORDS[beds[1]]
  if (/\bt(\d)\b/.test(t)) q.beds = Number(t.match(/\bt(\d)\b/)![1]) // Portuguese T2 notation
  if (/family|kids|children/.test(t) && q.beds === undefined) q.beds = 3

  for (const [k, re] of KIND_WORDS) if (re.test(t)) q.kinds.push(k)
  for (const [id, names] of Object.entries(HOOD_ALIASES)) if (names.some((n) => t.includes(n))) q.hoods.push(id)
  for (const [name, re] of FEATURES) if (re.test(t)) q.features.push(name)
  return q
}

const isEmpty = (q: Query) =>
  !q.deal && !q.max && !q.min && q.beds === undefined && !q.kinds.length && !q.hoods.length && !q.features.length

function search(q: Query) {
  const feats = FEATURES.filter(([n]) => q.features.includes(n))
  const strict = listings.filter(
    (l) =>
      (!q.deal || l.deal === q.deal) &&
      (!q.max || l.price <= q.max) &&
      (!q.min || l.price >= q.min) &&
      (q.beds === undefined || l.beds >= q.beds) &&
      (!q.kinds.length || q.kinds.includes(l.kind)) &&
      (!q.hoods.length || q.hoods.includes(l.hood)),
  )
  const score = (l: Listing) => feats.filter(([, , fn]) => fn(l)).length * 10 - l.listed * 0.1
  const ranked = strict.sort((a, b) => score(b) - score(a))
  const withAll = ranked.filter((l) => feats.every(([, , fn]) => fn(l)))
  return { exact: feats.length ? withAll : ranked, loose: ranked }
}

function why(l: Listing, q: Query) {
  const bits: string[] = []
  const h = hoodOf(l.hood)
  bits.push(`${l.beds ? `${l.beds}-bed ${l.kind.toLowerCase()}` : l.kind === 'Studio' ? 'Studio' : `Studio ${l.kind.toLowerCase()}`}, ${l.area} m² in ${h.name}`)
  const hit = FEATURES.filter(([n, , fn]) => q.features.includes(n) && fn(l)).map(([n]) => n)
  if (hit.length) bits.push(`has ${hit.join(' & ')}`)
  else if (l.features[0]) bits.push(l.features.slice(0, 2).join(', ').toLowerCase())
  if (l.tags.includes('Price drop')) bits.push('recently reduced')
  if (l.listed <= 3) bits.push('just listed')
  return `**${priceLabel(l)}** — ${bits.join(' · ')}.`
}

function describe(q: Query) {
  const parts: string[] = []
  if (q.beds !== undefined) parts.push(q.beds === 0 ? 'studios' : `${q.beds}+ bedrooms`)
  if (q.kinds.length) parts.push(q.kinds.map((k) => k.toLowerCase() + 's').join(' or '))
  parts.push(q.deal === 'rent' ? 'to rent' : q.deal === 'buy' ? 'for sale' : 'to buy or rent')
  if (q.hoods.length) parts.push('in ' + q.hoods.map((h) => hoodOf(h).name).join(' / '))
  if (q.features.length) parts.push('with ' + q.features.join(', '))
  if (q.max) parts.push(`up to ${q.deal === 'rent' ? euro(q.max) + '/mo' : euro(q.max)}`)
  return parts.join(' ')
}

function searchReply(q: Query) {
  const { exact, loose } = search(q)
  if (exact.length) {
    const picks = exact.slice(0, 3)
    const lead =
      exact.length === 1
        ? `There's one home that fits — ${describe(q)}:`
        : `I found **${exact.length} homes** ${describe(q)}. ${exact.length > 3 ? 'The strongest three:' : 'Here they are:'}`
    const tail =
      exact.length > 3
        ? `\nWant me to narrow it down — by budget, outdoor space or how fresh the listing is?`
        : `\nI can book a viewing with ${agentOf(picks[0].agent).name.split(' ')[0]} or run the monthly numbers on any of these.`
    return [lead, '', ...picks.flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']), tail].join('\n')
  }
  if (loose.length) {
    const picks = loose.slice(0, 2)
    return [
      `Nothing ticks every box (${q.features.join(', ')}), but these come closest ${describe({ ...q, features: [] })}:`,
      '',
      ...picks.flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
      'Relaxing one requirement usually opens up more options — tell me which matters least.',
    ].join('\n')
  }
  // 1) keep the budget, drop the neighbourhood
  if (q.hoods.length) {
    const elsewhere = search({ ...q, hoods: [], features: [] }).loose
    if (elsewhere.length)
      return [
        `Nothing in ${q.hoods.map((h) => hoodOf(h).name).join(' / ')} fits yet. Within the same brief elsewhere in Lisbon:`,
        '',
        ...elsewhere.slice(0, 3).flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
        'New homes come up every week — I can flag the next one that matches.',
      ].join('\n')
  }
  // 2) same area, any kind of home within budget
  if (q.hoods.length && (q.kinds.length || q.beds !== undefined)) {
    const sameArea = search({ ...q, kinds: [], beds: undefined, features: [] }).loose
    if (sameArea.length)
      return [
        `Nothing ${describe(q)} right now, but ${q.hoods.map((h) => hoodOf(h).name).join(' / ')} has these within your brief:`,
        '',
        ...sameArea.slice(0, 2).flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
        'Want me to look in neighbouring areas too?',
      ].join('\n')
  }
  // 3) drop the budget and show the cheapest that otherwise fit
  const relaxed = search({ ...q, max: undefined, min: undefined, features: [] }).loose
  const alt = relaxed.length ? relaxed : search({ ...q, max: undefined, min: undefined, hoods: [], features: [] }).loose
  if (!alt.length) return `I couldn't find anything ${describe(q)} in the catalogue right now. Try a different neighbourhood or a broader budget and I'll look again.`
  const cheapest = [...alt].sort((a, b) => a.price - b.price).slice(0, 2)
  const gap = q.max ? cheapest[0].price - q.max : 0
  return [
    `Nothing matches ${describe(q)} at that budget yet. The closest options:`,
    '',
    ...cheapest.flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
    gap > 0 ? `The nearest starts at **${priceLabel(cheapest[0])}** — about ${euro(gap)} above your limit.` : '',
  ].join('\n')
}

function amountIn(t: string) {
  const m = t.match(/€\s*([\d.,]+)\s*(k|m|million)?|([\d.,]+)\s*(k|m|million)\b|([\d,]{6,})/)
  return m ? money(m[1] ?? m[3] ?? m[5], m[2] ?? m[4]) : undefined
}

function monthly(principal: number, rate = 0.036, years = 30) {
  const r = rate / 12
  const n = years * 12
  return (principal * r) / (1 - (1 + r) ** -n)
}

function mortgageReply(t: string, last?: Listing) {
  const given = amountIn(t)
  const ref = given ? undefined : last
  const price = given ?? ref?.price ?? 900_000
  const assumed = !given && !ref
  const rows = [0.2, 0.3].map((dep) => {
    const loan = price * (1 - dep)
    return `- **${dep * 100}% deposit** (${euro(price * dep)}): loan ${euro(loan)} → about **${euro(Math.round(monthly(loan)))}/month**`
  })
  const tax = Math.round(price * 0.08)
  return [
    `${assumed ? 'Taking a €900k home as an example' : `For a ${euro(price)} home${ref ? ` like ${ref.title}` : ''}`}, at **3.6% over 30 years**:`,
    ...rows,
    '',
    `Budget roughly **${euro(tax)}** on top for IMT transfer tax, 0.8% stamp duty and notary fees (closer to 8% at this price).`,
    'Residents can often borrow up to 90%; non-residents usually need 20–30% down. Your bank sets the final rate — confirm with a mortgage broker.',
  ].join('\n')
}

const PROCESS = [
  'Buying in Portugal, step by step:',
  '- **Get a NIF** (tax number) and open a Portuguese bank account — a lawyer can do both by power of attorney.',
  '- **Make an offer**; once agreed you sign a promissory contract (**CPCV**) and pay a 10–20% deposit.',
  '- **Arrange finance** — non-residents typically put down 20–30%.',
  '- **Pay IMT and stamp duty** (0.8%) before the deed; IMT is progressive, up to 6–7.5% on higher prices.',
  '- **Sign the escritura** (deed) at a notary, then the home is registered in your name.',
  '',
  'From accepted offer to keys usually takes **6–10 weeks**. Rules change, so confirm specifics with a Portuguese lawyer.',
].join('\n')

const RENT_PROCESS = [
  'Renting in Lisbon usually works like this:',
  '- Landlords ask for a **NIF**, proof of income and ID.',
  '- Expect **1–2 months’ deposit** plus the first month (sometimes 2–3 months upfront without a Portuguese guarantor).',
  '- Contracts are typically 1–3 years and are registered with the tax office.',
  '',
  'Clara on our team handles relocations — she can guide you through the paperwork.',
].join('\n')

function hoodLine(h: Hood) {
  return `- **${h.name}** — ${h.vibe.toLowerCase()}. ${h.blurb} Around **${euro(h.avg)}/m²**, walk score ${h.walk}.`
}

function compareReply(ids: string[]) {
  const [a, b] = ids.map(hoodOf)
  const count = (id: string) => listings.filter((l) => l.hood === id).length
  const cheaper = a.avg < b.avg ? a : b
  return [
    `**${a.name} vs ${b.name}**`,
    hoodLine(a),
    hoodLine(b),
    '',
    `${cheaper.name} is about **${Math.round((Math.abs(a.avg - b.avg) / Math.max(a.avg, b.avg)) * 100)}% cheaper** per m². ${a.walk > b.walk ? a.name : b.name} is the more walkable of the two.`,
    `We have ${count(a.id)} homes in ${a.name} and ${count(b.id)} in ${b.name} — want to see them?`,
  ].join('\n')
}

function adviceReply(t: string) {
  const want: [RegExp, string[]][] = [
    [/quiet|calm|peace|family|kids|park/, ['estrela', 'belem', 'principe-real']],
    [/night|bars|restaurants|lively|culture|walk/, ['chiado', 'principe-real', 'alfama']],
    [/beach|sea|ocean|surf|coast/, ['cascais', 'belem']],
    [/modern|new|commute|airport|business|office/, ['parque', 'estrela']],
    [/history|charm|authentic|fado|old/, ['alfama', 'chiado']],
    [/cheap|afford|budget|value/, ['cascais', 'belem', 'alfama']],
  ]
  const ids = [...new Set(want.filter(([re]) => re.test(t)).flatMap(([, h]) => h))].slice(0, 3)
  const pick = (ids.length ? ids : ['principe-real', 'parque', 'cascais']).map(hoodOf)
  return [
    ids.length ? 'Based on what you described, I’d start with:' : 'Lisbon has a neighbourhood for every rhythm. Three very different starting points:',
    ...pick.map(hoodLine),
    '',
    'Tell me your budget and whether you’re buying or renting, and I’ll pull matching homes.',
  ].join('\n')
}

const GREETING = [
  'Hi! I’m the **Arca Concierge**. I can:',
  '- find homes to buy or rent (try “2-bed with a terrace under €1M”)',
  '- compare neighbourhoods and prices per m²',
  '- estimate mortgage payments and buying costs',
  '- explain how buying or renting works in Portugal',
  '',
  'What are you looking for?',
].join('\n')

/** Answer the latest user message using the conversation for context. */
export function answerLocal(history: Turn[]): string {
  const userTurns = history.filter((m) => m.role === 'user')
  const text = userTurns[userTurns.length - 1]?.content ?? ''
  const t = norm(text)

  // last listing the assistant mentioned (for "how much per month on that one?")
  const lastId = [...history].reverse().find((m) => m.role === 'assistant' && /\[\[listing:/.test(m.content))
    ?.content.match(/\[\[listing:([\w-]+)\]\]/)?.[1]
  const last = lastId ? listings.find((l) => l.id === lastId) : undefined

  if (/^(hi|hey|hello|ola|hiya|good (morning|afternoon|evening)|yo)\b[!. ]*$/.test(t.trim()) || /what can you do|help me\??$/.test(t))
    return GREETING
  if (/thank|thanks|obrigad/.test(t)) return 'Anytime! If you’d like, I can book a viewing or keep an eye out for new listings that match.'
  if (/mortgage|monthly payment|per month on|pay monthly|afford|loan|repay/.test(t) && !/rent/.test(t)) return mortgageReply(t, last)
  if (/how (do|does|to) (i )?(buy|buying|purchase)|process|tax|imt|nif|stamp duty|notary|escritura|cpcv|golden visa|fees/.test(t)) return PROCESS
  if (/how (do|does|to) (i )?rent|renting work|deposit for rent|tenant/.test(t)) return RENT_PROCESS

  const q = parse(text)
  if (/compare|vs\.?|versus|difference between|or\b.*which/.test(t) && q.hoods.length >= 2) return compareReply(q.hoods.slice(0, 2))
  if (/where should|which (neighbou?rhood|area|district)|best (area|neighbou?rhood)|neighbou?rhoods?\b|areas?\b to live/.test(t) && !q.max)
    return q.hoods.length === 1 ? [hoodLine(hoodOf(q.hoods[0])), '', searchReply(q)].join('\n') : adviceReply(t)

  if (/cheap|cheapest|affordable|lowest price|least expensive/.test(t) && !q.max) {
    const pool = listings.filter((l) => (!q.deal || l.deal === q.deal) && (!q.hoods.length || q.hoods.includes(l.hood)) && (!q.kinds.length || q.kinds.includes(l.kind)))
    const deal = q.deal ?? 'buy'
    const picks = (pool.length ? pool : listings).filter((l) => l.deal === deal).sort((a, b) => a.price - b.price).slice(0, 3)
    if (picks.length)
      return [
        `The most affordable homes ${describe({ ...q, deal })} right now:`,
        '',
        ...picks.flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
        deal === 'buy' ? 'Looking to rent instead? Just say so.' : 'Thinking of buying instead? Just say so.',
      ].join('\n')
  }

  // refinement of an earlier search: "cheaper?", "what about with a pool", "only rentals"
  const refine = /^(and|what about|how about|any|only|cheaper|bigger|smaller|with|without|more)\b/.test(t.trim()) || t.split(/\s+/).length <= 3
  if (refine && userTurns.length > 1) {
    const prev = parse(userTurns[userTurns.length - 2].content)
    if (/cheaper|less expensive|lower/.test(t) && !q.max) {
      const base = search(prev).loose
      const ref = base.length ? Math.min(...base.map((l) => l.price)) : undefined
      if (ref) q.max = ref - 1
    }
    q.deal ??= prev.deal
    q.max ??= prev.max
    q.beds ??= prev.beds
    if (!q.kinds.length) q.kinds = prev.kinds
    if (!q.hoods.length) q.hoods = prev.hoods
    q.features = [...new Set([...prev.features, ...q.features])]
  }

  if (isEmpty(q)) {
    if (last && /agent|view|visit|tour|book|contact/.test(t)) {
      const a = agentOf(last.agent)
      return `**${a.name}** (${a.role}) handles ${last.title}. Call ${a.phone} or open the listing and pick a tour slot — they usually confirm within the hour.\n\n[[listing:${last.id}]]`
    }
    const newest = [...listings].sort((a, b) => a.listed - b.listed).slice(0, 2)
    return [
      'I can help with that. To narrow it down, tell me **buy or rent**, a rough **budget** and the **area** you like. Meanwhile, here’s what’s new this week:',
      '',
      ...newest.flatMap((l) => [`[[listing:${l.id}]]`, why(l, q), '']),
    ].join('\n')
  }
  return searchReply(q)
}

export const SUGGESTIONS = [
  '2-bed to rent in Chiado under €2.5k',
  'Villas with a pool near the coast',
  'Compare Príncipe Real vs Estrela',
  'What would I pay monthly on a €900k home?',
  'How does buying in Portugal work?',
  'Where should a family live?',
]

