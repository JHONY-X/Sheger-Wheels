# Performance

Measured on the **production build** (`npm run build && npm start`), served
locally on port 3200, in the desktop Chromium used by the coding harness.

| | Landing `/` | Car detail `/cars/car_vitz` |
|---|---|---|
| TTFB | 52 ms | 40 ms |
| DOMContentLoaded | 174 ms | 113 ms |
| Load | 461 ms | 400 ms |
| First Contentful Paint | — | 393 ms |
| Largest Contentful Paint | — | 393 ms |
| Transferred, first visit | 265 KB | 82 KB (warm) |
| JavaScript transferred | 176 KB | 60 KB |
| CSS + fonts | 76 KB (incl. 65 KB woff2) | 3 KB (cached) |
| RSC / fetch | 14 KB | 20 KB |
| Lighthouse accessibility | 100 | 100 |
| Lighthouse best practices | 100 | 100 |
| Lighthouse SEO | 100 | 100 |

**Read these numbers with the caveats below them.** They are single-run desktop
measurements on a local server with no CPU or network throttling, on a warm
browser cache for the detail page. They prove the architecture is not obviously
slow; they are not a field-data claim.

### Caveats

- The harness Lighthouse integration returns accessibility, best-practices and
  SEO only — it does not run a performance benchmark. There is **no Lighthouse
  performance score** in this document because none was measured.
- FCP/LCP come from a Chromium trace (`browser.trace`), not from Lighthouse.
- INP was not measured. Interactions are local state changes over an in-memory
  snapshot; nothing awaits the network.
- Fonts are cached by the browser after the first page. The landing page was
  measured first (cold fonts); the detail page after (warm).
- Map tiles are a network request from OpenStreetMap and were not part of the
  measured transfer because they load after the first paint and are cached by
  the tile layer.

## What the build does

The production build prerenders 24 routes:

```
○  /                    static shell
○  /cars                static shell + client island
◐  /cars/[id]           PPR: 6 cars prerendered, others streamed
◐  /bookings/[id]       blocking private route, document shell only
○  /signin, /signup     static shell + form island
○  /dashboard, /bookings, /checkout, /owner, /admin
○  /dev, /styleguide, /_not-found
○  /robots.txt, /sitemap.xml
```

`○` routes are HTML at build time. `◐` routes send a static shell immediately and
stream the client island, so the car name, description and JSON-LD are in the
first response while price and availability wait for hydration.

## Decisions that keep it fast

### 1. Server-first shells

Landing, catalogue shell, car metadata, 404 and auth shells are React Server
Components. They ship HTML, not JavaScript. The interactive parts (header
account chip, filters, booking panel, map) are separate client islands.

### 2. One store, one subscription

`useDemoData()` is a single `useSyncExternalStore` over a cached snapshot.
Components do not each read `localStorage`; a write re-reads each collection
once, nulls the cache and notifies subscribers. The snapshot object is stable
between writes, so React does not re-render on identical data.

### 3. Hydration gates instead of guesswork

`useHydrated()` returns `false` on the server and on the first client render,
then flips in an effect-free `useSyncExternalStore`. Screens render a skeleton
with the same dimensions, so the layout does not jump when the real data
arrives. This also keeps `new Date()` and `Math.random()` out of prerender
(Cache Components forbids them there).

### 4. Leaflet is dynamically imported

```js
const CarMapCanvas = dynamic(() => import("./CarMapCanvas"), { ssr: false });
```

Leaflet and its CSS (≈ 150 KB unminified) are not in the detail route's initial
JavaScript. The map appears after interaction, behind a fixed 256 px box, so its
arrival does not shift the page. If tiles fail, the box shows a loading/empty
state and the seeded neighbourhood remains readable.

### 5. Fonts are self-hosted and limited

`next/font/google` downloads Fraunces and Plus Jakarta Sans at build time and
serves them from the same origin. The measured woff2 files are the Latin
subsets: 36.9 KB + 27.6 KB. Fraunces is used for `h1`/`h2` only; body text uses
Plus Jakarta Sans.

### 6. No photographs, no layout shift

Every seed car has `photos: []`, so cards and galleries draw a generated SVG
glyph. There is no image request, no missing-image placeholder and no CLS from
an image that loads late. A real build with uploads would need `next/image`,
dimensions and blur placeholders; that is in `FUTURE.md`.

### 7. URL is the catalogue state

Filtering does not keep a mirrored React state object. The URL is parsed once per
render (`parseCarQuery`), and a filter change is a `router.replace`. No effect
syncs state to the URL or back, so there is no double render and no history
loop. Search and price commit on submit rather than on every keystroke.

### 8. Destructive actions are not optimistic

The receipt calls a domain function, waits for `ok`, then shows the new status
from the refreshed snapshot. A failed guard leaves the UI unchanged. There is no
optimistic rollback path to get wrong.

## What costs, and what was traded

| Cost | Size / impact | Trade |
|---|---|---|
| React + Next runtime | ≈ 120 KB of the 176 KB JS | Required by the framework |
| Two font families | 65 KB woff2 | Brand type; one family would be faster but flatter |
| Client hydration on every route | Small islands, but the header hydrates everywhere | The header owns sign-out and the account chip |
| `localStorage` re-read per write | Tens of records; sub-millisecond JSON | Simplicity over an incremental store |
| Map tiles | External network after first paint | Real map beats a static image; text fallback exists |
| Whole-collection writes | Rewrites an array of ≤ hundreds of records | Atomic, easy to reason about; not a scaling design |
| Blocking private routes | `instant = false` on `/checkout`, `/bookings`, `/dashboard`, `/owner`, `/admin` | They cannot be prerendered without a session anyway |

## Budgets for this project

| Budget | Target | Current |
|---|---|---|
| JS transferred, first party | < 250 KB | 176 KB landing, 60 KB detail |
| Fonts | < 80 KB | 65 KB |
| Lighthouse a11y | ≥ 95 | 100 |
| Lighthouse SEO | 100 | 100 |
| CLS | < 0.1 | No measured shift; no images, fixed skeletons |
| Static shell TTFB | < 100 ms locally | 40–52 ms |

## How to reproduce

```bash
npm run build
npm start                     # production server
# then, in Chrome DevTools → Lighthouse, run Accessibility + Performance
# and record LCP/CLS/INP under "Mobile" with 4× CPU throttling.
```

For the trace numbers:

1. Open DevTools → Performance.
2. Record, reload `/cars/car_vitz`, stop.
3. Read FCP/LCP from the Timings lane.

## What to measure next

1. **Lighthouse performance on mobile with 4× CPU throttling.** The desktop
   numbers above are optimistic; the real target is a mid-range Android phone.
2. **INP on the catalogue filters and the booking form.** Both are synchronous
   state updates; the risk is low but unmeasured.
3. **Cold-cache first visit per route**, with the network throttled to Slow 4G.
4. **Hydration cost** with React Profiler, especially `/cars` (large card grid).
5. **Memory** after 100 bookings, since collections are rewritten whole.

None of these numbers is claimed until it is measured. That is the point of this
document.
