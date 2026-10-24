# Strategy

## The problem

Addis Ababa has a lot of cars and a lot of people who need one for a day. Most
of that exchange happens informally: a friend of a friend, a WhatsApp group, a
broker who takes a cut and disappears if something goes wrong. The car sits in a
compound for most of the week while its owner pays for parking, insurance and
depreciation.

Two things are missing from the informal version:

1. **Trust.** The renter cannot tell whether the car is insured, roadworthy or
   even the car in the photo. The owner cannot tell whether the renter will
   return it.
2. **A shared record.** Price, dates, condition and payment live in chat
   screenshots. When a dispute starts, nobody can reconstruct what was agreed.

Sheggar Wheels is a neighbourhood marketplace that puts that exchange on a
shared record: listings, date-based availability, a booking lifecycle, a review
after the trip, and an admin who can resolve a dispute.

## Who it is for

| Persona | Job to be done | What the product owes them |
|---|---|---|
| **Dawit, 29, renter** | "I need a car for a weekend trip without calling five people." | Search by neighbourhood and date, a clear total, an owner who responds |
| **Selam, 34, owner** | "My Vitz sits idle five days a week." | A listing that takes ten minutes, requests with the payout visible, control over dates |
| **Hanna, 41, owner** | "I lend my cars, but I need a record." | Booking history, a dispute path, reviews that follow the renter |
| **Platform admin** | "Keep the catalogue honest." | A moderation queue, account controls, the dispute queue |

The demo seeds one account per persona, plus a suspended account so the blocked
state can be shown rather than described.

## Value proposition

**For renters:** a car from a verified neighbour, priced by the day, with the
total — including the service fee — visible before they request it.

**For owners:** a listing, a request queue and a payout figure, without building
a website or handing the keys to a stranger with no record.

**For the platform:** the trust layer. Moderation before publication, a complete
booking record, and a dispute process with a written resolution.

## Why this is not just "Airbnb for cars"

Three local decisions shape the product:

- **Neighbourhood first.** Listings are grouped by Bole, CMC, Kazanchis, Sarbet
  and so on, because a car two neighbourhoods away is a different proposition in
  Addis traffic. The catalogue filters by neighbourhood before it filters by
  price.
- **Price in Birr, per day, all-in.** No surprise cleaning fee at checkout. The
  service fee is shown in the booking panel and on the receipt.
- **Trust is visible.** A listing has a moderation status; a booking has a
  lifecycle; an owner has a response history; a dispute has a resolution note.
  The interface never hides those states behind a colour.

## What competitors do and what we deliberately do differently

| Alternative | Strength | Where Sheggar Wheels differs |
|---|---|---|
| WhatsApp / Telegram groups | Zero friction, existing trust | Searchable listings, dates, totals, a record, dispute path |
| Traditional rental agencies | Insurance, fleet, counters | Peer pricing, neighbourhood supply, owner-set availability |
| Classifieds (list-and-call) | Simple | Booking lifecycle, payment record, reviews, moderation |
| Global P2P platforms | Product maturity | Local neighbourhood model, Birr-first pricing, a demo that runs offline in a browser |

The capstone does not claim to beat any of them. It demonstrates the product
shape and the engineering discipline a local version would need.

## Scope: what is in the demo

| In | Why |
|---|---|
| Catalogue with URL-driven filters, dates, map, reviews | The core browse-to-book journey |
| Booking lifecycle with guarded transitions | The spine of the product; everything else is a view of it |
| Renter bookings + receipt, mock TeleBirr checkout | Shows the money step without pretending to take money |
| Owner dashboard: listings, requests, add a car | The supply side must be demoable, not just described |
| Admin: moderation, accounts, disputes, announcements | The trust layer is the differentiator |
| Demo accounts, seeded data, reset | A reviewer can see every state in two minutes |

## Scope: what is out (and why)

| Out | Reason |
|---|---|
| Real authentication, passwords, email | No backend; the brief forbids a database. `AUTH.md` states this plainly |
| Real payments | No merchant account, no PCI scope, and a capstone should not move money |
| Messaging | Adds a real-time backend; the receipt and status history cover the demo need |
| Photo upload | Storage quota and moderation of images are a project of their own; listings use generated artwork |
| Insurance / verification | Regulatory and commercial, not a frontend concern |
| Native apps | The responsive web app is the deliverable |

These are not hidden. Every screen that simulates something says so.

## Route-by-route rendering strategy

The rule: **public content is server-rendered and cacheable; private data is
client-rendered from storage.** No route pretends the server can read
`localStorage`.

| Route | Rendering | Data used at build / request | Why |
|---|---|---|---|
| `/` | Static (prerendered) + client islands | Seed for featured cars and copy; storage in the header | Marketing content is stable and indexable |
| `/cars` | Static shell, client island behind `<Suspense>` | URL params parsed on the client, seed + storage | Filters are shareable URLs; the shell is instant |
| `/cars/[id]` | PPR: six cars prerendered, the rest streamed (◐) | Seed for metadata, JSON-LD, specs; storage for live prices and booking state | Indexable, fast first paint, live data after hydration |
| `/signin`, `/signup` | Static shell + client form | User input | No personal data to render on the server |
| `/checkout` | Blocking client route (`instant = false`) | `sw_checkout_draft_v1` in sessionStorage | Private, short-lived, never indexed |
| `/bookings`, `/bookings/[id]` | Blocking client routes | `sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1` | Private; the URL id is resolved against storage |
| `/dashboard`, `/owner`, `/admin` | Blocking client routes | Collections + session | Role-gated in the browser because the role lives in the browser |
| `/dev`, `/styleguide` | Static client routes | Storage / static examples | Internal tools, `noindex` via `robots.txt` |
| `/sitemap.xml`, `/robots.txt` | Static generated | Seed cars | Crawlers get approved listings only |
| `/_not-found` | Static | — | Plain, useful 404 |

`app/(public)` and `app/(app)` share one `SiteChrome` (announcement bar, header,
main landmark, footer) so the two groups cannot drift apart.

## Success metrics for the capstone

These are the numbers the build is judged on, not vanity metrics:

| Metric | Target | How it is checked |
|---|---|---|
| All three required negative tests pass | 3/3 | `/dev` panel + `tests/` |
| Domain + query tests | 100% pass | `npm test` |
| Lighthouse accessibility | ≥ 95 | `PERF.md` |
| Lighthouse best practices / SEO | 100 | `PERF.md` |
| Build | Clean, no type or lint errors | `npm run build`, `npx eslint .` |
| Corrupt storage | Recovers, never crashes | `/dev` + `DATA.md` |
| Demo walkthrough | Complete in under 8 minutes | `PLAN.md` §7 |
| Every simulated feature labelled | 100% | `DemoChip`, mock TeleBirr header, seeded-location note |

A real launch would measure request-to-confirm time, listing fill rate,
cancellation reasons and dispute rate. The demo has no traffic, so those are
documented as the next instrumentation step in `FUTURE.md`, not invented.

## Risks and mitigations

| Risk | Mitigation in the demo | What a real build needs |
|---|---|---|
| Trust between strangers | Moderation status, reviews after completion, dispute record | ID verification, insurance, background checks |
| Double-booking | `conflictingBookings()` checks every write; the UI disables conflicting dates | Server-side locking / transactional writes |
| Stale availability | Availability derives from active bookings on every render | Real-time availability service |
| Payment fraud | Payment is labelled a simulation; no card data is collected | A licensed PSP, webhooks, reconciliation |
| Storage loss | Versioned keys, repair on read, `/dev` reset | A database with backups |
| Scope creep | Cut list in `PLAN.md` §6 | — |

## Build strategy (7 days)

The build was sequenced so that the riskiest layer lands first:

1. **Day 1 — data layer.** Types, storage, store, state machine, permissions,
   seed, tests. If this is wrong, every screen is wrong.
2. **Day 2 — public browsing.** Landing, catalogue with URL state, detail page,
   auth screens, SEO.
3. **Day 3 — the booking spine.** Guard, checkout, receipt, lifecycle actions.
4. **Day 4 — renter and owner.** Dashboards, lists, reviews, car creation.
5. **Day 5 — admin.** Moderation, accounts, disputes, announcements.
6. **Day 6 — quality.** Keyboard pass, Lighthouse, contrast, recovery, misuse
   checks.
7. **Day 7 — ship.** README, the six documents, demo rehearsal.

If time runs out, the cut order is in `PLAN.md` §6: announcements → CSV →
related cars → map → owner analytics. The booking lifecycle is never cut.

## The one-sentence version

Sheggar Wheels is a neighbourhood car-rental marketplace demo that proves the
hard part — a guarded, auditable booking lifecycle — can be built in the browser
with no backend, while every simulated feature says so.
