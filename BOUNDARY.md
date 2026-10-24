# Trust boundaries

This document is about **who can make the app do what**, and where the demo
deliberately stops pretending.

## The shape of the system

```
┌──────────────────────────── browser (the only place data lives) ───────────┐
│                                                                            │
│  React components ──► domain functions (lib/domain/*) ──► localStorage     │
│        ▲                        │                                │         │
│        │                        │ validation, role checks        │         │
│        └──── useSyncExternalStore ◄────────── snapshot ──────────┘         │
│                                                                            │
│  sessionStorage: { userId }  ← who the browser says you are                │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │ HTTP (HTML, RSC payload, static assets)
┌───────────────────────────────▼────────────────────────────────────────────┐
│ Next.js server / CDN                                                       │
│  • static shells, fonts, CSS, JS bundles                                   │
│  • metadata, JSON-LD, sitemap (from the immutable seed)                    │
│  • NO user records, NO session, NO per-user HTML                           │
└────────────────────────────────────────────────────────────────────────────┘
```

The server is a **content delivery tier**, not a source of truth. It cannot read
`localStorage`, so it cannot know who is signed in, what a booking costs, or
whether a car is still available. Every page that shows user data is a client
island that renders after hydration.

That is not an accident of the demo; it is the defining constraint of a
no-database build. Lying about it (e.g. pretending middleware protects a route)
would be worse than a guard that runs in the browser and says so.

## What crosses the boundary, and what does not

| Crosses to the server | Never crosses |
|---|---|
| The requested URL and path params | `sw_session_v1` (sessionStorage) |
| Standard headers (user agent, referrer, cookies — none set by us) | Passwords (none exist) |
| Static build-time seed values in metadata | Bookings, reviews, disputes, users |
| Nothing typed into the checkout form | The mock phone number and transaction reference |

The only persistent browser state the app creates is `sessionStorage` and
`localStorage`. No analytics, no fingerprinting, no third-party scripts. Map
tiles are the one external request, and only on pages that render the map.

## Validation layers

| Layer | What it does | What it must not be trusted for |
|---|---|---|
| HTML attributes (`required`, `type=date`, `min`) | Fast feedback, mobile keyboards | Anything — trivially bypassed |
| UI guards (`RequireRole`, disabled buttons, hidden actions) | Prevents confusing dead ends | Authorisation |
| Domain functions (`lib/domain/*`, `booking-state.js`) | Identity, role, party, state, shape, ranges | Server-side enforcement (there is no server write path) |
| Storage reader (`readStorage`) | JSON parse + validator + fallback | Detecting a determined user who writes a valid array |

The domain layer is the boundary that matters. Every write re-derives the
current user from the session and the current records from storage; it does not
accept a `user` argument from a component. In practice:

```js
// lib/domain/bookings.js (shape, simplified)
const user = getCurrentUser();
if (!user) return fail("NOT_SIGNED_IN", …);
if (user.status === "suspended") return fail("SUSPENDED", …);
if (!hasRole(user, "renter")) return fail("FORBIDDEN", …);
```

A component cannot pass a fake user, and cannot skip the check by calling
`updateCollection` itself without also importing the storage key — which the
lint/review convention forbids outside `lib/`.

## The three required negative tests, at the boundary

| Test | Boundary being tested | Result |
|---|---|---|
| Signed-out write | Session presence | `NOT_SIGNED_IN`; no record written |
| Cross-user ownership | Party check | `NOT_YOURS`; receipt also refuses to render |
| `?next=https://example.com` | Redirect target | Falls back to `/dashboard`; no external navigation |

Of the three, the redirect is the only one that is also an *output* boundary: it
decides where the browser goes next. The other two are *write* boundaries.
Both are tested with the real functions, not mocks, in `/dev` and `tests/`.

## Escaping and injection

| Surface | Handling |
|---|---|
| User text in JSX | React escapes by default; there is no `innerHTML` for user content |
| JSON-LD | `JSON.stringify` of server-side seed data, with `<` replaced by `\u003c` so a value cannot close the `<script>` tag |
| URLs in `href` | Built by the app from ids, not from user input; `next` is sanitised |
| CSV export | RFC 4180 quoting plus a `'` prefix for values starting with `=`, `+`, `-`, `@`, tab or CR |
| CSS classes from data | Only from fixed maps (`BOOKING_STATUS`, `CAR_TONE`), never from stored strings |
| `localStorage` content | Parsed inside `try/catch`, validated as an array, rendered through the same escaping |

The CSV rule exists because "bookings.csv" is opened in Excel. A comment of
`=HYPERLINK("http://evil")` must export as text, not as a live formula.

## What the demo does not protect against

| Attack / failure | Reality |
|---|---|
| Editing `localStorage` to become admin | Possible. Roles live client-side. This is stated in `AUTH.md`, not hidden |
| Calling a domain function from the console | Possible. Same trust model as editing storage |
| Two tabs racing a booking | Possible; overlap is checked then written, with no lock |
| XSS from another origin | No cookies are used, so there is no session to steal; storage could still be read if an XSS existed |
| Denial of service via a huge collection | `JSON.parse` of a large value could freeze the tab; quota limits the damage |
| Losing data by clearing site data | Expected; `/dev` can reseed |
| Accessing a "protected" URL directly | The route renders, then `RequireRole` redirects or blocks; no private HTML is served |

These are properties of a browser-only demo, not oversights. A production build
would move the write path to an API, put the role in a server session, and treat
the client as untrusted input. `FUTURE.md` lists that migration.

## Simulation boundaries (honesty requirements)

The brief requires simulated features to be labelled. The app does this in four
places, so a screenshot cannot be mistaken for a real transaction:

1. **Announcement bar** on every page: "Demo data only… every listing, booking
   and payment is simulated."
2. **`DemoChip`** on the catalogue, detail, checkout success and payment panels.
3. **Mock payment panel** says "Simulation" in its header and "This button does
   not contact a payment provider" under it.
4. **Location note** on the map: the map is seeded coordinates, not a verified
   address, and links to OpenStreetMap rather than claiming delivery.

The README repeats the same statement, and `metadata` descriptions mention the
demo. There is no "verified owner" badge, no insurance claim, and no fake
testimonial.

## Private routes and crawlers

- `robots.txt` disallows `/dashboard`, `/bookings`, `/checkout`, `/owner`,
  `/admin`, `/dev` and `/styleguide`.
- Private pages also set `robots: { index: false, follow: false }`.
- The sitemap lists only the landing page, the catalogue and approved cars.
- `/admin` is additionally gated by role in the browser; the `noindex` is a
  crawler instruction, not a security control.

## Boundary checklist for a reviewer

- [ ] Open `/dashboard` signed out → redirected to `/signin?next=%2Fdashboard`.
- [ ] Sign in as Dawit, open a booking owned by Hanna → "This booking is not
      yours", no action buttons.
- [ ] As Dawit, open `/admin` → role panel, no admin data rendered.
- [ ] Run `/dev` → 6/6 misuse checks pass.
- [ ] Set `localStorage["sw_cars_v1"] = "{"` and reload → seed shown, recovery
      notice on `/dev`, no crash.
- [ ] Export CSV with a comment beginning `=` → the cell is prefixed with `'`.
- [ ] Check the network tab: no requests carry booking or session data.
