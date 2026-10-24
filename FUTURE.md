# Future work

Sheggar Wheels is a frontend capstone. This document separates what was
deliberately left out from what a real product would build next, and points at
the exact seams in the current code where each change belongs.

## Guiding rule

Anything that requires trusting the client must move to a server before this
becomes a real marketplace. The demo is honest about that: roles, ownership and
payments are all enforced in the browser because there is no backend to enforce
them.

## The migration that unlocks everything

| Today | Production |
|---|---|
| `localStorage` collections in `lib/storage.js` | PostgreSQL (bookings, users, cars, reviews, disputes) |
| Domain functions in `lib/domain/*` | Server actions or API handlers with the same names |
| `sessionStorage["sw_session_v1"]` | `HttpOnly` session cookie, server-side session table |
| `useSyncExternalStore` over a cached snapshot | React Query / SWR against the API, optimistic where safe |
| `conflictingBookings()` before write | `EXCLUDE USING gist (car_id WITH =, daterange(start, end) WITH &&)` in Postgres |
| Mock TeleBirr | A licensed PSP (Telebirr, Chapa or Stripe) with webhooks and reconciliation |
| Seeded accounts | Email/phone verification, password or magic link, OAuth |
| `/dev` misuse checks | Integration tests against the API + Playwright E2E |
| Admin in the same app | Admin with an audit log and least-privilege roles |

The domain-function boundary is what makes this migration tractable: the UI
already calls `requestBooking`, `transitionBooking`, `createReview`,
`replyToReview` and `resolveDispute` rather than writing storage. Those
functions become the first server actions.

## Phase 1 — a trustworthy backend (2–3 weeks)

1. **Database schema** mirroring `lib/types.js`, with foreign keys and the
   overlap exclusion constraint above.
2. **Auth**: magic-link email, server sessions, verified phone before a first
   booking.
3. **Authorisation** in the API: the same role/party/state table, but evaluated
   server-side.
4. **Booking transactions**: request, confirm and payment in one transaction;
   no double-booking under concurrency.
5. **Audit log** for every status change, with actor, timestamp and reason.
6. **Rate limits** on booking, review and dispute endpoints.

## Phase 2 — money and communication

- **Payments**: a hosted checkout with 3-D Secure, refunds on decline/cancel,
  and a webhook that updates `paymentStatus` — replacing `completeMockPayment`.
- **Payouts**: owner balance, platform fee, payout schedule, receipts.
- **Notifications**: email and SMS/push for request, approval, start, return and
  dispute. A notification row per event; no fire-and-forget sends.
- **Messaging**: booking-scoped threads, with attachments (condition photos at
  pick-up and return). This is also the evidence trail a dispute needs.

## Phase 3 — trust and supply

- **Verification tiers**: phone → ID → driver's licence → insurance. Show the
  tier on the listing and the receipt.
- **Insurance** partner or a damage-deposit model. This is a commercial and
  regulatory problem before it is a UI problem.
- **Condition reports**: timestamped photos and a checklist at handover, stored
  with the booking.
- **Owner calendar**: block dates, seasonal pricing, minimum stay, instant book
  for trusted renters.
- **Reviews**: photos, sub-ratings (cleanliness, handover, value) and
  moderation of abusive text.

## Phase 4 — discovery and growth

- **Map-first search**: draw a neighbourhood, filter by distance, cluster results.
- **Saved cars and alerts**: "notify me when this car is free in November".
- **Amharic and English** with `next-intl`; the copy is already plain and
  sentence-based, which keeps translation cheap. Right-to-left is not needed,
  but number and date formatting must be localised.
- **Referrals**: owner and renter invite codes with a tracked first booking.
- **SEO**: car pages already generate metadata, JSON-LD and a sitemap; add
  `Vehicle`/`Offer` structured data, canonical URLs per filter combination only
  where the combination has search demand.

## Phase 5 — engineering maturity

| Area | Next step |
|---|---|
| Testing | Playwright for the three negative tests + the happy path; API integration tests; visual regression on the styleguide |
| CI | Build, lint, unit tests and a Lighthouse budget on every PR |
| Observability | Sentry (client errors), structured server logs, a funnel dashboard |
| Feature flags | Instant book, deposits, new checkout behind flags |
| Accessibility | Manual screen-reader pass (NVDA/VoiceOver), 200% zoom, reduced motion |
| Performance | Mobile Lighthouse budget in CI; measure INP on filters and checkout |
| Offline | A service worker for the catalogue shell; writes still need the network |
| Internationalisation | Amharic first, then French/Arabic if the market expands |

## Deliberately not planned

- **A native app.** The responsive web app covers the demo; a native app is a
  distribution decision, not a feature.
- **Crypto payments.** No demand, high regulatory cost, and it would not make the
  demo more honest.
- **Real payments inside this capstone.** Moving money requires a legal entity,
  a PSP contract and PCI scope. The mock is labelled and stops at the boundary.
- **AI pricing or chat.** Interesting later; it cannot substitute for a correct
  booking lifecycle, which is the point of this project.
- **A second admin UI.** The current admin covers the required moderation. A
  separate back office would be the first thing to split out if the team grows.

## Known limitations that stay until the backend lands

1. Data is per browser and per origin; clearing site data resets the demo.
2. Anyone can become anyone by editing `localStorage` (see `AUTH.md`).
3. Two tabs can race the overlap check.
4. The map shows seeded coordinates, not a verified pick-up point.
5. Photos are generated artwork; there is no upload.
6. There is no messaging, email or push.
7. Analytics are absent by design; the success metrics in `STRATEGY.md` describe
   what would be instrumented first.

Each of these is visible in the UI or in the docs. None is presented as finished.
