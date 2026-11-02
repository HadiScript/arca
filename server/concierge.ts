import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import Anthropic from '@anthropic-ai/sdk'
import { agents, hoods, listings } from '../src/data.ts'

/*
 * POST /api/concierge — streams a Claude reply as Server-Sent Events.
 * Body: { messages: { role: 'user' | 'assistant', content: string }[] }
 * Events: data: {"t": "..."} for text, data: {"done": true} at the end.
 * Without credentials it answers 503 { error: 'no_credentials' } and the
 * client switches to its offline engine.
 */

// Tiny .env loader so ANTHROPIC_API_KEY=... in arca/.env just works (no dependency).
function loadEnv() {
  const file = resolve(process.cwd(), '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m || line.trim().startsWith('#')) continue
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2')
    if (value && process.env[m[1]] === undefined) process.env[m[1]] = value
  }
}
loadEnv()

const hasCredentials = () =>
  Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE)

const catalogue = JSON.stringify({
  listings: listings.map((l) => ({
    id: l.id,
    title: l.title,
    kind: l.kind,
    deal: l.deal,
    price: l.price,
    hood: l.hood,
    beds: l.beds,
    baths: l.baths,
    m2: l.area,
    year: l.year,
    energy: l.energy,
    features: l.features,
    tags: l.tags,
    agent: l.agent,
  })),
  hoods: hoods.map((h) => ({ id: h.id, name: h.name, vibe: h.vibe, about: h.blurb, eurPerM2: h.avg, walk: h.walk, transit: h.transit })),
  agents: agents.map((a) => ({ id: a.id, name: a.name, role: a.role, languages: a.langs, phone: a.phone })),
})

const SYSTEM = `You are the Arca Concierge, the assistant inside Arca — a real-estate marketplace for Lisbon and the coast (Cascais). You help people buy and rent homes.

How to answer:
- Be warm, concise and practical. Short paragraphs or tight bullet lists; **bold** the key facts. No headings.
- Only recommend homes from the catalogue below — never invent listings, prices or features. If nothing fits, say so and suggest the closest options or which filter to relax.
- When you recommend a listing, put the token [[listing:ID]] on its own line (the app turns it into a card). Recommend at most 3 at a time.
- Prices are in euros; "price" for rent listings is per month. Use €/m² from the neighbourhood data when comparing areas.
- For mortgages, show a quick estimate (state the rate and term you assumed) and remind that banks decide the final figure.
- You can explain the Portuguese buying process in general terms: getting a NIF (tax number), opening a bank account, the promissory contract (CPCV) with a 10–20% deposit, the deed (escritura), IMT transfer tax (progressive, up to 6–7.5%), 0.8% stamp duty, notary/registration fees, and that non-residents usually need a 20–30% deposit for a mortgage. Always add that they should confirm specifics with a Portuguese lawyer.
- For viewings or offers, point them to the listing's agent by name and mention they can book a tour from the listing page.

Catalogue (JSON):
${catalogue}`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((ok, fail) => {
    let data = ''
    req.on('data', (c) => {
      data += c
      if (data.length > 200_000) req.destroy()
    })
    req.on('end', () => ok(data))
    req.on('error', fail)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function handleConcierge(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  if (!hasCredentials()) return json(res, 503, { error: 'no_credentials' })

  let messages: ChatMessage[]
  try {
    const parsed = JSON.parse(await readBody(req)) as { messages?: ChatMessage[] }
    messages = (parsed.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-20)
    if (!messages.length || messages[0].role !== 'user') throw new Error('bad history')
  } catch {
    return json(res, 400, { error: 'bad_request' })
  }

  const client = new Anthropic()
  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`)
  let started = false
  const start = () => {
    if (started) return
    started = true
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
  }

  try {
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    })
    req.on('close', () => stream.abort())

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        start()
        send({ t: event.delta.text })
      }
    }
    const final = await stream.finalMessage()
    start()
    if (final.stop_reason === 'refusal') {
      send({ t: "\n\nSorry — I can't help with that one. Ask me about homes, neighbourhoods, renting or buying in Portugal." })
    }
    send({ done: true })
    res.end()
  } catch (err) {
    if (res.writableEnded) return
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      if (!started) return json(res, 503, { error: 'no_credentials' })
    }
    const message =
      err instanceof Anthropic.RateLimitError
        ? 'rate_limited'
        : err instanceof Anthropic.APIConnectionError
          ? 'connection_error'
          : err instanceof Anthropic.APIError
            ? `api_error_${err.status ?? 'unknown'}`
            : 'server_error'
    if (!started) return json(res, 502, { error: message })
    send({ error: message })
    res.end()
  }
}
