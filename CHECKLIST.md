# 43-concept checklist

Every concept from the capstone brief, mapped to the file that implements it and
the evidence that it works. "✅" means it is used in the shipped demo, not just
mentioned in a document.

| # | Concept | Where it lives | Evidence |
|---|---|---|---|
| 1 | **App Router file-based routing** | `app/**/page.js` | 15 routes build; `/styleguide` lists them |
| 2 | **Route groups** | `app/(public)`, `app/(app)` | Two groups, one URL space, shared chrome |
| 3 | **Root and nested layouts** | `app/layout.js`, `(public)/layout.js`, `(app)/layout.js` | Fonts, skip link, header/footer on every page |
| 4 | **Server Components** | Landing, catalogue shell, car metadata, 404 | No `"use client"`; HTML in the first response |
| 5 | **Client Components** | `use client` in 30+ files | Header, filters, booking panel, dashboards |
| 6 | **Static rendering** | `/`, `/cars`, `/signin`, `/signup`, docs pages | `○` in the build output |
| 7 | **Dynamic / blocking rendering** | `/checkout`, `/bookings`, `/dashboard`, `/owner`, `/admin` | `export const instant = false`; render per request |
| 8 | **Partial Prerendering + Suspense** | `app/(public)/cars/[id]/page.js` | `◐` route; shell streams before the island |
| 9 | **`generateStaticParams`** | `app/(public)/cars/[id]/page.js` | Six cars prerendered, others streamed |
| 10 | **`generateMetadata`** | Car detail, root layout | Per-car title, description, OG, canonical |
| 11 | **Dynamic route params** | `/cars/[id]`, `/bookings/[id]` | `await params`, validated against storage |
| 12 | **`not-found.js`** | `app/not-found.js` | Custom 404 with links |
| 13 | **Error boundary** | `app/(public)/error.js` | Public segment resets without losing the shell |
| 14 | **Loading and skeleton states** | `components/ui/Skeleton.js`, `GuardSkeleton` | Catalogue, detail, dashboards |
| 15 | **`next/link` navigation** | Header, cards, tables, pagination | Client-side navigation, prefetch |
| 16 | **Router hooks** | `usePathname`, `useRouter`, `useSearchParams` | Active nav, guard redirect, `?next=` |
| 17 | **URL as state** | `lib/cars-query.js`, `CatalogueClient` | Shareable filters; back button honest |
| 18 | **Hydration safety** | `lib/use-hydrated.js`, `getServerSnapshot` | No mismatch; server snapshot is `EMPTY` |
| 19 | **`useState`** | Forms, filters, dialogs, checkout | Controlled inputs and local UI state |
| 20 | **Derived state** | Dashboards, receipts, pricing | Totals/counts computed, never duplicated |
| 21 | **Effects only for external systems** | `RequireRole` redirect, Leaflet lifecycle | No `setState` in an effect |
| 22 | **Memoisation** | `AvailabilityCalendar`, related cars, `CatalogueClient` | `useMemo` over stable inputs |
| 23 | **Custom hooks** | `useHydrated`, `useTodayISO` | Client-only gates without `useEffect` |
| 24 | **External store with `useSyncExternalStore`** | `lib/store.js` | One snapshot, cross-tab `storage` listener |
| 25 | **Controlled forms** | Sign-in, booking panel, review, dispute | Value + onChange, validation messages |
| 26 | **Uncontrolled forms + `FormData`** | Add-a-car, announcement composer | Native validation, reset by key |
| 27 | **Validation at two layers** | HTML constraints + `lib/domain/*` | Domain refuses invalid input regardless of UI |
| 28 | **`localStorage` persistence** | `lib/storage.js` | Versioned keys, JSON, quota handling |
| 29 | **`sessionStorage` session state** | `sw_session_v1`, `sw_checkout_draft_v1` | Ends with the tab; sign-out clears both |
| 30 | **Seeding, versioning, recovery** | `initializeDemoData`, `readStorage` | Corrupt key → reseed + `recoveredKeys` |
| 31 | **CRUD** | Cars (create/read/update/activate), bookings, disputes, announcements | Owner and admin screens |
| 32 | **Typed models without TypeScript** | `lib/types.js` + `// @ts-check` | Editor checks; no TS build step |
| 33 | **State machine** | `lib/booking-state.js` | One writer of `status`; 8 transitions |
| 34 | **Authorisation matrix** | `lib/permissions.js`, `RequireRole` | Role + party + state checks, tested |
| 35 | **Defensive parsing** | `lib/cars-query.js`, `lib/dates.js` | Junk params dropped, never thrown |
| 36 | **Result objects instead of exceptions** | Every domain function | `{ ok, code, message }`; UI explains failures |
| 37 | **Suspense boundaries** | `/cars`, `/cars/[id]`, guard skeleton | `useSearchParams` and PPR stream safely |
| 38 | **Tailwind v4 CSS-first tokens** | `app/globals.css` `@theme` | No `tailwind.config.js`; `ochre-ink` for contrast |
| 39 | **Design system + styleguide** | `components/ui/*`, `/styleguide` | Buttons, badges, cards, tables, states |
| 40 | **Responsive layout** | `md:`/`lg:` grids, mobile nav, `<details>` filters | Desktop and mobile markup paths |
| 41 | **Accessibility** | Labels, focus rings, `aria-live`, table captions, contrast | Lighthouse 100 on tested routes |
| 42 | **SEO** | Metadata, JSON-LD, sitemap, robots, canonical | Lighthouse SEO 100; `/robots.txt` verified |
| 43 | **Testing and quality gates** | `tests/` (88 Vitest), `/dev` (6/6), ESLint, build | `npm test`, `npx eslint .`, `npm run build` |

## Security concepts folded into the list

| Concept | Covered by |
|---|---|
| Open redirect | #16, `safeReturnPath()` — `?next=https://example.com` rejected |
| Unauthorised write | #34, `transitionBooking()` — `NOT_SIGNED_IN`, `NOT_YOURS`, `FORBIDDEN` |
| Cross-user data leak | #34, receipt scope + `renterId` filter in the bookings list |
| CSV formula injection | `lib/csv.js` — leading `= + - @` prefixed |
| XSS in JSON-LD | `<` escaped in the serialised script |
| Secret leakage | No secrets exist; `.env.example` documents that |

## Not claimed

The demo does **not** cover real authentication, real payments, server-side
authorisation, a database, file uploads, email/SMS or analytics. Those are
scoped in `FUTURE.md` and explained in `AUTH.md` and `BOUNDARY.md` rather than
faked here.
