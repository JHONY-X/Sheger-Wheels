# Data model & storage

Sheggar Wheels has no database and no server-side persistence. Every record
lives in the browser. This document describes the keys, the shapes, the write
path, the invariants and what happens when storage is broken.

## Keys

| Key | Store | Shape | Written by |
|---|---|---|---|
| `sw_users_v1` | localStorage | `User[]` | seed, sign-up, admin suspend |
| `sw_cars_v1` | localStorage | `Car[]` | seed, owner create/edit/activate, admin moderation |
| `sw_bookings_v1` | localStorage | `Booking[]` | seed, renter request, lifecycle transitions, mock payment |
| `sw_reviews_v1` | localStorage | `Review[]` | seed, `createReview`, `replyToReview` |
| `sw_disputes_v1` | localStorage | `Dispute[]` | seed, `openDispute`, `resolveDispute` |
| `sw_announcements_v1` | localStorage | `Announcement[]` | seed, admin |
| `sw_meta_v1` | localStorage | `{ seedVersion, seededAt }` | first seed |
| `sw_session_v1` | sessionStorage | `{ userId, signedInAt }` | sign-in |
| `sw_checkout_draft_v1` | sessionStorage | `{ bookingId, createdAt }` | car detail → checkout |

`_v1` is deliberate: a shape change ships a new key and a migration, rather
than corrupting old browsers. The session and the checkout draft are in
`sessionStorage` because both are per-tab and should not survive the tab.

## Shapes

The authoritative definitions are JSDoc typedefs in `lib/types.js`, checked by
`// @ts-check` in every module.

### User

```js
{
  id, name, email, phone,
  roles: ["renter" | "owner" | "admin"],
  status: "active" | "suspended",
  createdAt
}
```

### Car

```js
{
  id, ownerId, make, model, year,
  transmission: "automatic" | "manual",
  seats, fuel, city, neighbourhood,
  latitude, longitude,
  pricePerDay,                // ETB
  photos: [],                 // every seed car uses generated artwork
  description,
  status: "draft" | "pending" | "approved" | "rejected" | "inactive",
  active,                     // owner-controlled visibility
  unavailableDates: ["YYYY-MM-DD"],
  createdAt
}
```

A car is public only when `status === "approved" && active`. `status:
"inactive"` means the owner hid it; re-activating restores `approved`, while a
`pending` or `rejected` listing still has to pass moderation.

### Booking

```js
{
  id, reference,              // SW-XXXXXX
  carId, renterId, ownerId,
  startDate, endDate, days,
  pricePerDay, subtotal, fee, total,   // snapshot at request time
  paymentStatus: "unpaid" | "paid" | "refunded",
  transactionRef,             // DEMO-TB-… when paid
  status,                     // see lifecycle
  createdAt, updatedAt
}
```

`days`, `subtotal`, `fee`, `total` and `pricePerDay` are **snapshots**, not
derived at render. If an owner changes the price tomorrow, an existing booking
must still show what the renter agreed to. The same reasoning applies to the
car's make/model: the receipt reads the current car record for display, but the
money on the booking never recomputes.

### Review, Dispute, Announcement

```js
Review      { id, bookingId, carId, renterId, ownerId, rating: 1-5,
              comment, ownerReply, createdAt }
Dispute     { id, bookingId, openedBy, reason, description,
              status: "open" | "resolved", resolutionNotes,
              resolvedBy?, createdAt, resolvedAt? }
Announcement{ id, title, message, active, createdAt, createdBy }
```

## The booking lifecycle

`status` moves through one table in `lib/booking-state.js`. Nothing else writes
it.

```
                  ┌──────────── declined
requested ────────┤
                  └──────────── confirmed ──► in_progress ──► completed ──► reviewed
       │                              │                         │
       └──────────── cancelled ◄──────┘                         │
                                                                ▼
                                              disputed ────► resolved
```

| Action | From | Actor | To | Side effects |
|---|---|---|---|---|
| `confirm` | requested | owner | confirmed | — |
| `decline` | requested | owner | declined | — |
| `cancel` | requested, confirmed | party | cancelled | — |
| `start` | confirmed | owner | in_progress | — |
| `complete` | in_progress | owner | completed | — |
| `review` | completed | renter | reviewed | inserts a `Review` in the same action |
| `dispute` | in_progress, completed | party | disputed | inserts a `Dispute` |
| `resolve` | disputed | admin | resolved | writes `resolutionNotes`, `resolvedBy`, `resolvedAt` |

`transitionBooking()` is transactional in the only way a browser allows: it
validates everything first, then writes the collection once. A review is created
by `createReview()`, which calls `transitionBooking()` and only inserts the
review if the transition succeeded. A failed guard cannot leave a half-written
record. An owner reply is written by `replyToReview()`, which edits that same
`Review` in place — only the car's owner, and only once.

### Why a status field and not booleans

`isConfirmed`, `isPaid`, `isActive` as separate booleans drift. One enum plus a
transition table means an invalid combination cannot be represented. The
payment status is separate because it is orthogonal: a booking can be
`confirmed` and `unpaid`, and the receipt must say both.

## Write path

```
UI event
  → domain function (lib/domain/*.js)
      → getCurrentUser()            // identity
      → role / party / state checks // authorisation
      → validate input              // shape and range
      → updateCollection(key, fn)   // lib/store.js
          → readStorage             // current collection
          → updater(current)        // pure transform
          → writeStorage            // whole array, JSON
          → refresh()               // drop snapshot, notify subscribers
  → useSyncExternalStore re-renders
```

Rules:

1. **No component touches `localStorage` directly.** The only exceptions are
   `sessionStorage` reads for the checkout draft, which are wrapped in
   `lib/storage.js` helpers.
2. **Collections are written whole.** At this size (tens of records) that is
   simpler and safer than partial updates, and it makes the write atomic from
   the app's point of view.
3. **`updateCollection` aborts on a non-array return.** A validator that decides
   nothing should change returns `undefined`.
4. **The snapshot is cached.** `getSnapshot()` returns the same object until
   `refresh()` nulls it, because React compares references.

## Read path and hydration

`useDemoData()` is `useSyncExternalStore(subscribe, getSnapshot,
getServerSnapshot)`. On the server it returns a frozen `EMPTY` snapshot, so the
first HTML contains no user data and no mismatch. Screens that need storage call
`useHydrated()` first and render a skeleton until the client snapshot exists.

The store listens for the `storage` event. If another tab writes a `sw_*` key,
this tab drops its cache and re-renders. That is the only "sync" in the demo; it
is not a server subscription.

## Seeding

`initializeDemoData()` runs on first `hydrate()`:

- For each collection key: if the stored value is a readable array, leave it
  alone. If the key is missing **or unreadable**, write the seed and record a
  recovery.
- `sw_meta_v1` records the seed version and the first seed time.

It never overwrites a user's data. Adding a new collection later means adding a
key to `COLLECTION_KEYS` and a seed array; existing browsers get the seed for the
new key only.

Seed dates are generated relative to first run (`makeBooking({ from: 7, to:
9 })`), so "upcoming" trips stay upcoming whenever the demo is opened. Without
that, a demo recorded in October would show every trip in the past by December.

The seed contains 6 users (one suspended), 9 cars (approved, pending, rejected,
inactive), 10 bookings covering every lifecycle state, 2 reviews, 2 disputes
(one resolved) and 2 announcements.

## Corruption, quota, and recovery

`readStorage(key, fallback, validate)` never throws. It:

1. Reads the raw string.
2. `JSON.parse`s it.
3. Runs the validator (`Array.isArray` for collections).
4. Returns the fallback if anything fails.

`writeStorage` catches quota and private-mode exceptions and returns `false`.
The domain function then returns `STORAGE_WRITE_FAILED` instead of pretending
the write worked.

Unreadable keys are repaired by re-seeding and reported:

```js
const data = useDemoData();
data.storage.recoveredKeys;  // ["sw_cars_v1"]
```

The `/dev` page shows the report and can reset the demo. A corrupt collection
therefore degrades to "the seed again, with a notice", not a white screen.

**To try it:** in DevTools, set `localStorage["sw_cars_v1"] = "{"` and reload.
The catalogue shows the seed, and `/dev` lists the repaired key.

## Reset

`resetDemoData({ clearSession })` removes every collection plus meta, clears
the recovered set, optionally clears the session and checkout draft, then
re-seeds. It is reachable from `/dev` and is the recommended way to start a
demo clean.

## Invariants the code relies on

| Invariant | Enforced by |
|---|---|
| A booking's `ownerId` matches the car's owner at request time | `requestBooking` |
| Dates are valid ISO and `endDate >= startDate` | `lib/dates.js` + `requestBooking` |
| Two active bookings cannot overlap for one car | `conflictingBookings()` inside `requestBooking` |
| `subtotal = pricePerDay × days`, `fee = 10%`, `total = subtotal + fee` | `lib/pricing.js`, computed once |
| Only an approved, active car is public | `getPublicCars()` |
| Only the renter may review, once, after completion | `createReview` + `transitionBooking` |
| Only the car's owner may reply, once per review | `replyToReview` |
| A resolved dispute closes its booking | `resolveDispute` |
| Status is written only by `transitionBooking` | code review + grep |

## Limitations

- **Not durable.** Clearing site data, using another browser or a private
  window starts from the seed.
- **Not shared.** Two reviewers on two laptops have two separate databases.
- **Not concurrent-safe.** Two tabs could pass the overlap check milliseconds
  apart; a real system needs a transaction or a lock.
- **No schema migration yet.** `_v1` reserves the space; there is no migration
  runner because nothing has changed shape since the seed was frozen.
- **No server validation.** A determined user can write anything into
  `localStorage`; the UI will render it defensively, but the data is theirs.
  See `BOUNDARY.md`.
