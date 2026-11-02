# Arca — Homes in Lisbon, found with AI

A real-estate marketplace concept for Lisbon and the coast, with an AI concierge and a preview of the upcoming mobile app.

**Stack:** React 19 · TypeScript · Vite · GSAP + ScrollTrigger · Lenis · Anthropic SDK (Claude)

- **Search** with filters kept in the URL and a draggable, zoomable vector map with price pins
- **Listing pages** — gallery + lightbox, floor plan, neighbourhood scores, mortgage calculator, tour booking
- **Agents**, **saved homes** and side-by-side **compare**
- **Mobile app showcase** — pinned scroll sequence of phone mockups (`/app`)
- **Arca AI concierge** — streaming chat that recommends real listings as cards
- Light / dark theme, fully responsive

## Run

```bash
npm install
npm run dev
```

## AI concierge

The concierge calls Claude through `/api/concierge` (a Vite dev/preview middleware in `server/concierge.ts`).

1. Copy `.env.example` to `.env`
2. Set `ANTHROPIC_API_KEY=...`
3. Restart the dev server

Without a key it falls back to an offline answer engine (`src/lib/concierge-local.ts`). For a static deploy, host `server/concierge.ts` as a serverless function.

Listings, prices and agents are sample data (`src/data.ts`); photos from Unsplash.
