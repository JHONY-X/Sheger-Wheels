# Sheggar Wheels — Build Plan & Task Checklist

> Working plan for the IBT–QIYAS Frontend Capstone.
> Tick tasks as you go. Every task has an **acceptance check** — if you can't check it, it isn't done.

---

## 0. The five decisions that decide whether you finish

Make these before writing UI. Changing them later costs days.

| # | Decision | Recommendation | Why |
|---|----------|----------------|-----|
| 1 | Language | **JavaScript + JSDoc `@typedef`** (`// @ts-check` per file) | Zero build config, matches the brief, and VS Code's TypeScript engine still autocompletes and flags mistakes. JSDoc is not optional here — it's what replaces interfaces. |
| 2 | Data access | **One store module + `useSyncExternalStore` hook**. Never call `localStorage` from a page. | Gives you live updates, cross-tab sync, SSR safety, and one place to validate. This is the "SWR equivalent" checklist item. |
| 3 | Auth | **Client-only session** in `sessionStorage` + a `<RequireRole>` layout wrapper. No middleware, no server session. | `sessionStorage` does not exist on the server. Middleware cannot read it. Fighting this is the #1 time sink in this brief. |
| 4 | Writes | **Domain functions only** (`requestBooking`, `transitionBooking`, `saveCar`). Pages never mutate state directly. | The rules (role, ownership, state, overlap) must live in one testable layer. |
| 5 | Rendering | Public pages = **static shell + client data island**. Seed data is a plain module, so the *server* can use it for `generateMetadata`, sitemap and JSON-LD. | Satisfies the Next.js feature checklist honestly without inventing SSR data access. |

> **Set up before Day 1:** `jsconfig.json` with `"checkJs": false` globally, then add `// @ts-check` to `lib/` files only. Project-wide `checkJs` fights Next's generated types; per-file checking is where the value is.

---

## 1. Architecture at a glance

```
Browser (only place localStorage exists)
  └── lib/store.js        snapshot + subscribe + refresh
        ├── lib/storage.js   readStorage / writeStorage / seed / reset
        ├── lib/domain/*.js  cars, bookings, users, reviews, disputes, announcements
        ├── lib/permissions.js  can(user, action, resource)
        └── lib/booking-state.js  transition table + guards
              ▲
              │ useDemoData()  (client components only)
              │
Next.js server (no user data, ever)
  └── (public) pages, metadata, sitemap.js, robots.js, JSON-LD from seed module
```

**Rule:** the arrow only goes up. Server code never imports `store.js`.

---

## 2. Folder structure

```
app/
  layout.js                      root: <DemoProvider>, fonts, skip link
  (public)/                      public header + footer
    page.js                      /
    cars/page.js                 catalogue (filters in URL)
    cars/[id]/page.js            detail + map
    signin/page.js   signup/page.js
  (renter)/                      <RequireRole role="renter">
    dashboard/page.js
    bookings/page.js
    bookings/[id]/page.js
    bookings/[id]/track/page.js
    bookings/[id]/review/page.js
    checkout/page.js
  (owner)/                       <RequireRole role="owner">
    owner/page.js  owner/cars/…  owner/earnings/…  owner/reviews/…  owner/disputes/…
  (admin)/                       <RequireRole role="admin">
    admin/…
  sitemap.js   robots.js   not-found.js   error.js

components/
  ui/            Button Card Badge Field Modal Table EmptyState Skeleton Toast Pagination
  car/           CarCard CarGrid CarImage CarFilters CarMap(lazy)
  booking/       StatusBadge BookingTimeline ActionButton
  charts/        EarningsChart BookingsByStatus (client)
  guards/        RequireRole SessionGate
  dev/           SelfTestPanel (negative tests)

lib/
  storage.js  store.js  session.js  permissions.js  booking-state.js  pricing.js
  format.js   csv.js    ids.js    validation.js
  domain/{cars,bookings,users,reviews,disputes,announcements}.js
  seed/{users,cars,bookings,reviews,disputes,announcements}.js

tests/  booking-state.test.js  pricing.test.js  csv.test.js  session.test.js
```

> In a JavaScript Next.js project every page/layout file is `.js` — JSX inside `.js` is fully supported. Don't mix `.jsx` into `app/`; Next only treats `page.js`, `layout.js`, etc. as routes.

---

## 3. Core patterns (write these on Day 1, reuse everything after)

### 3.1 Type safety without TypeScript

```js
// @ts-check
/**
 * @typedef {'requested'|'confirmed'|'in_progress'|'completed'
 *          |'reviewed'|'declined'|'cancelled'|'disputed'|'resolved'} BookingStatus
 *
 * @typedef {Object} Booking
 * @property {string}        id
 * @property {string}        carId
 * @property {string}        renterId
 * @property {string}        ownerId
 * @property {string}        startDate      YYYY-MM-DD
 * @property {string}        endDate        YYYY-MM-DD
 * @property {number}        days
 * @property {number}        pricePerDay    snapshot at request time
 * @property {number}        subtotal
 * @property {number}        fee
 * @property {number}        total
 * @property {'unpaid'|'paid'|'refunded'} paymentStatus
 * @property {BookingStatus} status
 * @property {string}        createdAt      ISO date-time
 * @property {string}        updatedAt      ISO date-time
 */

/** @type {Booking[]} */
export const seedBookings = [ /* … */ ];
```

Keep every entity's typedef in `lib/types.js` (a file with no runtime code) and `import('./types.js').Car` in JSDoc. Same autocomplete as TypeScript, no build step.

### 3.2 Safe storage read

```js
// @ts-check
/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @param {(v: unknown) => boolean} [validate]
 * @returns {T}
 */
export function readStorage(key, fallback, validate) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback; // malformed JSON must never crash the app
  }
}
```

### 3.3 Store + hook

```js
// @ts-check
import { useSyncExternalStore } from 'react';

/** @type {import('./types.js').Snapshot | null} */
let snapshot = null;
/** @type {Set<() => void>} */
const listeners = new Set();

export function getSnapshot() {
  if (!snapshot) snapshot = hydrateAll(); // one cached object, stable reference
  return snapshot;
}

/** @type {import('./types.js').Snapshot} */
const EMPTY = Object.freeze({ users: [], cars: [], bookings: [], reviews: [],
                              disputes: [], announcements: [], session: null });
export const getServerSnapshot = () => EMPTY;

/** @param {() => void} fn */
export function subscribe(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function refresh() {
  snapshot = null;
  listeners.forEach((fn) => fn());   // re-read on next getSnapshot
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('sw_')) refresh();   // cross-tab
  });
}

export function useDemoData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

> `getSnapshot` **must** return the same reference until data changes, otherwise React loops forever. That's why the snapshot is cached and nulled on write.

### 3.4 Booking state machine — the spine of the project

```js
// @ts-check
/** @type {Record<string, Record<string, string>>} */
const NEXT = {
  requested:   { confirm: 'confirmed', decline: 'declined', cancel: 'cancelled' },
  confirmed:   { start: 'in_progress', cancel: 'cancelled', dispute: 'disputed' },
  in_progress: { complete: 'completed', dispute: 'disputed' },
  completed:   { review: 'reviewed', dispute: 'disputed' },
  disputed:    { resolve: 'resolved' },
  declined: {}, cancelled: {}, reviewed: {}, resolved: {},
};

/** @type {Record<string, 'owner'|'renter'|'either'|'admin'>} */
const ACTOR = {
  confirm: 'owner', decline: 'owner', start: 'owner', complete: 'owner',
  cancel: 'renter', review: 'renter', dispute: 'either', resolve: 'admin',
};

/**
 * @param {string} id
 * @param {string} action
 * @returns {{ ok: true, booking: import('./types.js').Booking }
 *         | { ok: false, code: string, message: string }}
 */
export function transitionBooking(id, action) {
  const user = getCurrentUser();
  if (!user) return fail('NOT_SIGNED_IN');          // negative test 1
  if (user.status === 'suspended') return fail('ACCOUNT_SUSPENDED');

  const booking = getBookings().find((b) => b.id === id);
  if (!booking) return fail('NOT_FOUND');

  const role = ACTOR[action];
  const mine = role === 'owner' ? booking.ownerId === user.id
             : role === 'renter' ? booking.renterId === user.id
             : booking.ownerId === user.id || booking.renterId === user.id;
  if (!mine) return fail('NOT_YOURS');               // negative test 2
  if (role === 'admin' && !user.roles.includes('admin')) return fail('FORBIDDEN');

  const next = NEXT[booking.status] && NEXT[booking.status][action];
  if (!next) return fail('INVALID_STATE');
  if (action === 'confirm' && hasConflict(booking)) return fail('DATE_CONFLICT');

  // …write once, here only
}
```

Every button in the UI calls this. Nothing else sets `status`.

### 3.5 Dates, pricing, overlap

```js
// @ts-check
// Dates are YYYY-MM-DD strings → lexicographic compare is correct and timezone-proof
export const days = (start, end) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;

export const overlaps = (aS, aE, bS, bE) => aS <= bE && bS <= aE;

export const ACTIVE = ['requested', 'confirmed', 'in_progress'];
```

### 3.6 Auth guard

```js
// @ts-check
/** @param {string | null | undefined} value */
export function safeReturnPath(value, fallback = '/dashboard') {
  if (!value || !value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback; // protocol-relative
  return value;
}
```

`<RequireRole>` renders a skeleton while hydrating, then either the page or a redirect to
`/signin?next=<encoded current path>`. **And** every domain function re-checks, because the
layout guard is cosmetic.

### 3.7 One permission helper used twice

```js
can(user, 'confirm', booking)  // → UI: show/hide the button
can(user, 'confirm', booking)  // → action: refuse the write
```
Same function, two call sites. That's the answer to "hide protected UI, but always repeat the checks".

---

## 4. Task breakdown

### Phase 0 — Setup (2–3 h)

| # | Task | Acceptance |
|---|------|------------|
| P1 | `create-next-app` (App Router, Tailwind, **JavaScript**, no `--ts`) | `npm run dev` serves `/` |
| P2 | Design tokens: colors, radii, spacing, `next/font` | One `Button` renders in 3 variants |
| P3 | `jsconfig.json` (`@/*` paths) + `lib/types.js` with every `@typedef` | VS Code autocompletes `booking.st` → `status` |
| P4 | `lib/ids.js` with `crypto.randomUUID()` + fallback | Works on `http://` LAN IP |
| P5 | `lib/format.js`: `formatETB`, `formatDate`, `formatRelative` | ETB shows `ETB 2,400`; dates use `timeZone: 'UTC'` |
| P6 | Empty route groups with placeholder pages | Every route in the brief resolves, no 404 |
| P7 | Git init, `.gitignore`, first commit | Repo on GitHub |

> Dependencies for the week: `recharts`, `leaflet`, `react-leaflet`, `zod` (optional but recommended for shape validation), `vitest`, `@testing-library/react` (optional).

### Day 1 — Data layer (the day that saves the week)

| # | Task | Acceptance |
|---|------|------------|
| D1.1 | Data model shapes as JSDoc `@typedef` (User, Car, Booking, Review, Dispute, Announcement) | Matches brief §6 field-for-field; `@ts-check` clean |
| D1.2 | Seed data: 8 cars, 6 users (2 owners, 2 renters, 1 admin, 1 suspended), bookings in every status | `node -e` can import and print counts |
| D1.3 | `storage.js`: read/write/seed/reset + `sw_meta_v1.seedVersion` | Corrupting a key by hand shows fallback, not a crash |
| D1.4 | `store.js` + `useDemoData()` + `<DemoProvider>` in root layout | Two tabs, one write → both update |
| D1.5 | `initializeDemoData()` runs once, never overwrites existing data | Refresh 5× → IDs unchanged |
| D1.6 | `lib/domain/*.js` read/write functions | No component imports `localStorage` (grep it) |
| D1.7 | `session.js`: signIn/signOut/getCurrentUser/hasRole | Sign-out clears session keys only |
| D1.8 | `permissions.js` + `booking-state.js` + `pricing.js` | Unit tests green |
| D1.9 | `npm i -D vitest` + `vitest.config.js` (no TS transform needed) + 10 tests | `npm test` passes |

**Deliverable:** data exists, is safe to corrupt, and every rule is testable without UI.

### Day 2 — Public browsing

| # | Task | Acceptance |
|---|------|------------|
| D2.1 | Landing: hero search, featured cars, how it works, "Demo data" label | LCP element is the hero image with `priority` |
| D2.2 | `CarCard`, `CarGrid`, `CarImage` with `onError` fallback | Broken URL → placeholder, no layout shift |
| D2.3 | `/cars` filters: q, neighbourhood, price min/max, transmission, seats, dates | All encoded in URL: `/cars?neighbourhood=Bole&sort=price-asc` |
| D2.4 | Sorting + pagination + page clamp on filter change | Filter to 2 results while on page 3 → resets to 1 |
| D2.5 | Only `status==='approved' && active` cars public | Pending/rejected/inactive invisible |
| D2.6 | `/cars/[id]`: gallery, specs, availability calendar, Leaflet map, address fallback | Map lazy-loads, never SSR |
| D2.7 | Empty / filtered-empty / error / skeleton states | Disable JS-free path still shows shell |
| D2.8 | Metadata, `generateMetadata` from seed, OG, JSON-LD (no invented ratings), `sitemap.js`, `robots.js` | Private paths disallowed in robots |

> Trap: `useSearchParams` in a client page needs a `<Suspense>` boundary or the build fails to prerender.

### Day 3 — Auth + the booking spine

| # | Task | Acceptance |
|---|------|------------|
| D3.1 | `/signin` demo account cards + manual email select, `?next=` handled | `next=https://example.com` lands on `/` (negative test 3) |
| D3.2 | `/signup`: duplicate email, missing fields, weak input → inline errors | Admin role not selectable |
| D3.3 | `<RequireRole>` + redirect preserving path | Signed-out `/dashboard` → `/signin?next=/dashboard` |
| D3.4 | Suspended account → access-blocked panel | No actions possible |
| D3.5 | Booking form: date range, validation, live price breakdown | Total = `pricePerDay × days + 10% fee`, shown before submit |
| D3.6 | `requestBooking()`: overlap check, own-car block, past-date block | Two overlapping confirms impossible |
| D3.7 | `/checkout` mock TeleBirr, fake txn ref, draft in `sessionStorage` | Draft survives refresh, clears on sign-out |
| D3.8 | `/bookings/[id]` receipt + status + allowed actions only | Invalid actions absent from UI *and* refused by helper |

**End of Day 3 you have the end-to-end core flow. Everything after this is breadth.**

### Day 4 — Renter + owner

| # | Task | Acceptance |
|---|------|------------|
| D4.1 | `/dashboard` metrics: upcoming, completed, cancelled, next trip, spend | Numbers match seeded bookings |
| D4.2 | `/bookings` table: filters, status badges, CSV export | CSV quotes commas/quotes/newlines; own rows only |
| D4.3 | Cancel (eligible only) + review (completed, once) | Review locked after submit; `completed → reviewed` |
| D4.4 | `/owner` overview: cars, pending requests, earnings, utilization | Utilization = booked days / available days |
| D4.5 | Owner car CRUD + `unavailableDates` editor | Owner cannot open another owner's `/owner/cars/[id]/edit` |
| D4.6 | Approve/decline requests → `confirmed` / `declined` | Renter sees the change immediately |
| D4.7 | Start/complete trip simulation | `confirmed → in_progress → completed` |
| D4.8 | Earnings chart (Recharts) + accessible table + CSV | Chart has a table twin |

### Day 5 — Admin

| # | Task | Acceptance |
|---|------|------------|
| D5.1 | `/admin` metrics + bookings-by-status chart | Matches data |
| D5.2 | `/admin/listings` approve/reject | Approved car appears in public catalogue |
| D5.3 | `/admin/users` + `[id]`, suspend/reinstate | Suspended user blocked on next action |
| D5.4 | `/admin/bookings` global table + filters | Read-only where appropriate |
| D5.5 | `/admin/disputes` + `[id]`: resolve with notes, `resolvedBy`, `resolvedAt` | `disputed → resolved`, terminal |
| D5.6 | `/admin/reports` + `/admin/announcements` | Active announcement shows in public banner |
| D5.7 | Owner review replies | One reply per review, owner-of-car only |

### Day 6 — Quality pass

| # | Task | Acceptance |
|---|------|------------|
| D6.1 | Keyboard-only run of all flows | No mouse needed, focus always visible |
| D6.2 | 44×44 targets, labels, `aria-live` toasts, table captions | Lighthouse a11y ≥ 95 |
| D6.3 | 360 px, 768 px, 1440 px — zero horizontal overflow | Check `/owner/earnings` and admin tables |
| D6.4 | Malformed-JSON + quota + missing-record recovery messages | Break `sw_cars_v1` by hand → recovery UI |
| D6.5 | `/dev/selftest` panel running the 3 negative tests + 2 ownership tests | Prints PASS/FAIL with real function calls |
| D6.6 | SSR/hydration audit: no `Date.now()`/`Math.random()` in render | No hydration warnings in console |
| D6.7 | Lighthouse mobile before/after, record LCP/CLS/INP | Numbers in `PERF.md` |

### Day 7 — Ship

| # | Task | Acceptance |
|---|------|------------|
| D7.1 | Deploy to Vercel, fresh-incognito walkthrough | Seeds appear automatically |
| D7.2 | `README.md` with screenshots, accounts, live URL, limitations | A stranger can run it |
| D7.3 | `STRATEGY.md` route-by-route rendering table | Every route listed |
| D7.4 | `AUTH.md`, `DATA.md`, `BOUNDARY.md`, `PERF.md`, `FUTURE.md`, `.env.example`, `.gitignore` | Docs match code, no over-claiming |
| D7.5 | 8-minute demo script: browse → book → owner approve → admin approve | Rehearsed twice |

---

## 5. Traps that cost marks in *this* brief

1. **Hydration mismatch.** `localStorage` during render → React warns and content flickers. Use `useSyncExternalStore` + `getServerSnapshot`, and gate empty states behind a `hydrated` flag so "No cars" never flashes.
2. **Seeding on every load.** Overwrites the reviewer's work. Seed only when keys are absent.
3. **`getSnapshot` returning a new object** → infinite re-render loop.
4. **`useSearchParams` without `<Suspense>`** → prerender error on `/cars`.
5. **Leaflet with `ssr: false` inside a Server Component** → build error. Put the `dynamic()` call in a `'use client'` wrapper.
6. **`new Date('2026-10-21')`** parses as UTC midnight → off-by-one day in some timezones. Compare ISO strings; format with `timeZone: 'UTC'`.
7. **Relative time (`"3 min ago"`) in render** → hydration mismatch. Compute client-side after mount.
8. **`crypto.randomUUID()`** undefined on plain `http://192.168.x.x`. Ship a fallback.
9. **Recharts vs React 19** peer-dep mismatch — pin a compatible version or you'll lose an evening.
10. **Trusting `?next=`** — reject `//evil.com`, not just `https://`.
11. **Auth in middleware** — impossible with `sessionStorage`. Don't try.
12. **CSV** — quote `"` as `""`, wrap fields containing `,`/`"`/newline, add `\uFEFF` BOM for Excel, and prefix `=+-@` to block formula injection.
13. **Metadata** — server can't read localStorage. Generate car metadata/sitemap/JSON-LD from the **seed module** (plain data, importable server-side) and document the limitation for user-created cars.
14. **"Popularity"** — define it as `completed bookable count` in `DATA.md`, don't fake it.
15. **JSDoc rot** — `@typedef` drifts silently once you stop reading it. Run `npx tsc --noEmit --allowJs --checkJs` in CI (or just before the demo) so stale JSDoc shows up as errors instead of lies.

---

## 6. If you fall behind — cut in this order

1. `/bookings/[id]/track` animation → static timeline labelled "Simulation"
2. `/owner/cars/[id]/availability` → fold into the edit form
3. `/admin/users/[id]` and `/admin/disputes/[id]` → modals
4. `/admin/announcements` → read-only banner
5. Owner review replies
6. OG image, JSON-LD → keep `generateMetadata`, drop the image route
7. Cross-tab sync → optional by spec

**Never cut:** sign-in, booking validation, ownership checks, the three negative tests, the docs.

---

## 7. Demo script (8 minutes)

1. Guest browses → filters → car detail (`/cars?neighbourhood=Bole`) — 90 s
2. Click "Book" signed out → `/signin?next=…` → sign in as renter → lands back — 60 s
3. Request booking, show price breakdown, mock TeleBirr, receipt — 90 s
4. Sign in as owner → approve → renter sees `confirmed` — 90 s
5. Owner marks in progress → completed → renter leaves review — 60 s
6. Admin → approve a pending listing → it appears publicly; resolve a dispute — 90 s
7. Show "not yours" refusal + `?next=https://example.com` refusal + `/dev/selftest` — 50 s
8. Close on limitations: no DB, no real auth, no real payment — 20 s
