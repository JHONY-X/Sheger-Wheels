# Authentication & authorisation

> **Read this first.** Sheggar Wheels has **no authentication**. The "sign-in"
> screen is an account switcher that writes a user id to `sessionStorage`. There
> are no passwords, tokens, cookies, sessions on a server, or identity checks of
> any kind. This document describes what the demo *does* enforce, what it only
> *simulates*, and what a production build would have to replace.

## The demo model

| Concern | How the demo does it | File |
|---|---|---|
| Sign-in | Pick a seeded account, or type a seeded email | `components/auth/SignInForm.js` |
| Session state | `sessionStorage["sw_session_v1"] = { userId, signedInAt }` | `lib/session.js` |
| Identity lookup | `users` array in `localStorage`, matched by id | `lib/domain/users.js` |
| Roles | `user.roles: ("renter" \| "owner" \| "admin")[]` | `lib/types.js` |
| Suspension | `user.status: "active" \| "suspended"` | `lib/session.js` |
| Sign-out | Remove the session key and the checkout draft, refresh the store | `lib/session.js` |

A session that points at a deleted user is treated as signed out:
`getCurrentUser()` resolves the id against the current `users` collection and
returns `null` if it is gone.

Sessions end when the tab closes, because `sessionStorage` is per-tab. Durable
data (`users`, `cars`, `bookings`, …) lives in `localStorage` and survives.

## Roles

An account may hold more than one role. Public sign-up always grants `renter`
and can also grant `owner` when the "list a car" checkbox is ticked.

- `renter` — browse, request, pay (mock), review, dispute.
- `owner` — everything a renter can do, plus list cars and manage requests for
  their own cars.
- `admin` — moderation, account suspension, dispute resolution, announcements.

**`admin` can never be self-assigned.** `createDemoAccount()` ignores any role
input; only the seeded account `admin@sheggar.demo` has it. The admin screens are
not linked for other accounts, and the domain functions refuse them.

### Role matrix

| Action | Renter | Owner (of the car) | Admin | Guard |
|---|---|---|---|---|
| Request a booking | ✅ | ✅ | ✅ | `requestBooking` |
| Cancel own booking | ✅ | ✅ (party) | ✅ | `transitionBooking` |
| Approve / decline a request | ❌ | ✅ | ❌ | `transitionBooking` |
| Start / complete a trip | ❌ | ✅ | ❌ | `transitionBooking` |
| Review a completed trip | ✅ (renter only) | ❌ | ❌ | `createReview` |
| Reply to a review | ❌ | ✅ (own car, once) | ❌ | `replyToReview` |
| Open a dispute | ✅ (party) | ✅ (party) | ❌ | `openDispute` |
| Resolve a dispute | ❌ | ❌ | ✅ | `resolveDispute` |
| Add / edit a car | ❌ | ✅ (own) | ❌ | `saveCar` |
| Moderate a listing | ❌ | ❌ | ✅ | `moderateCar` |
| Suspend an account | ❌ | ❌ | ✅ | `setUserStatus` |
| Post an announcement | ❌ | ❌ | ✅ | `createAnnouncement` |
| Read someone else's booking | ❌ | ❌ | ✅ | receipt page + `getBookingById` scope |

The matrix is implemented twice on purpose, at different layers:

1. **`components/app/RequireRole.js`** decides what to *render*. Signed-out
   visitors are sent to `/signin?next=…`; suspended accounts get a blocked
   panel; the wrong role gets an explanation and a way out.
2. **`lib/permissions.js` → `lib/booking-state.js`** decides what may be
   *written*. Every mutation re-checks the session, the role, the party to the
   booking and the current status.

Hiding a button is a convenience. The write guard is the boundary.

## The booking guard is one table

`lib/booking-state.js` holds the lifecycle as data:

```js
confirm:  { from: ["requested"], actor: "owner",  to: "confirmed" }
decline:  { from: ["requested"], actor: "owner",  to: "declined" }
cancel:   { from: ["requested", "confirmed"], actor: "party", to: "cancelled" }
start:    { from: ["confirmed"], actor: "owner",  to: "in_progress" }
complete: { from: ["in_progress"], actor: "owner", to: "completed" }
review:   { from: ["completed"], actor: "renter", to: "reviewed" }
dispute:  { from: ["in_progress", "completed"], actor: "party", to: "disputed" }
resolve:  { from: ["disputed"], actor: "admin", to: "resolved" }
```

`transitionBooking()` is the **only** function that writes `booking.status`.
It returns a typed failure instead of throwing:

| Code | Meaning |
|---|---|
| `NOT_SIGNED_IN` | No session |
| `SUSPENDED` | The account is blocked |
| `FORBIDDEN` | The role is wrong for this action |
| `NOT_YOURS` | The right role, but not a party to this booking |
| `INVALID_STATE` | The action is not allowed from the current status |
| `NOT_FOUND` | The record disappeared |

Distinguishing `FORBIDDEN` from `NOT_YOURS` matters: it lets the UI explain
"owners approve requests" separately from "this booking is not yours".

`allowedActions(booking, user)` is the read side of the same table. The receipt,
owner queue and admin views all render from it, so a button and its guard cannot
disagree.

## Sign-in and return URLs

`/signin?next=/cars/car_vitz` returns the visitor to the car after signing in.
That is an **open-redirect surface**, so the value passes through
`safeReturnPath()`:

```js
// lib/session.js
export function safeReturnPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  const path = value.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;
  return path;
}
```

| Input | Result | Why |
|---|---|---|
| `/cars/car_vitz` | `/cars/car_vitz` | Same-origin path |
| `https://example.com` | `/dashboard` | Does not start with `/` |
| `//evil.example` | `/dashboard` | Protocol-relative URL |
| `/\evil.example` | `/dashboard` | Browsers normalise `\` to `/` |
| `/cars\n/evil` | `/dashboard` | Control characters could smuggle a second destination |
| `javascript:alert(1)` | `/dashboard` | Not a path |

`RequireRole` builds its redirect with `signInHref(pathname)`, which encodes the
already-sanitised path. The sign-in form decodes `next` and runs it through the
same function again.

## Suspended accounts

Yonas Tadesse is seeded as `status: "suspended"` so the blocked state can be
demonstrated, not just described.

- He **can** sign in. Refusing sign-in would hide the reason.
- He **can read** public pages.
- `RequireRole` replaces the signed-in area with "This account is suspended".
- Every domain write returns `SUSPENDED`; the same code path that protects a
  booking protects the admin API.

An admin can suspend and reinstate accounts from `/admin`. The seeded admin
cannot suspend itself, so the demo cannot lock itself out.

## The three required negative tests

Run them in `/dev` (each calls the real domain functions) or read the matching
Vitest cases in `tests/`.

### 1. Signed-out write is refused

```
delete sessionStorage["sw_session_v1"]   // or open a private window
requestBooking({ carId: "car_vitz", startDate: "2026-12-01", endDate: "2026-12-03" })
→ { ok: false, code: "NOT_SIGNED_IN" }
```

The booking count does not change. The UI would have redirected to
`/signin?next=…`, but the write guard does not depend on the UI.

### 2. Cross-user ownership is refused

```
sign in as usr_dawit
transitionBooking("bk_hanna_confirmed", "complete")
→ { ok: false, code: "NOT_YOURS" }        // right role path, wrong person
moderateCar("car_vitz", "approved")
→ { ok: false, code: "FORBIDDEN" }        // renter, not admin
```

The receipt page also refuses to render another user's booking, and the bookings
list filters to `renterId === user.id` before anything is displayed.

### 3. Unsafe `?next=` is rejected

```
open /signin?next=https://example.com
sign in
→ lands on /dashboard, not example.com
```

Variants (`//evil.example`, `/\evil.example`, `javascript:…`) are covered by the
same function and by tests.

## What this is not

| Not present | Consequence |
|---|---|
| Passwords / hashing | Anyone can be anyone by editing `localStorage` |
| Server-side sessions | The server cannot know who is signed in; guards run in the browser |
| CSRF protection | No cookies, no server mutations |
| Rate limiting | A script can call the domain functions in a loop |
| Email verification | Accounts are created locally with no proof of identity |
| Audit trail | `updatedAt` timestamps exist, but no immutable log |

These are **expected** for a no-database capstone. The demo must never be
deployed as a real marketplace. `BOUNDARY.md` explains the trust model in more
detail and `FUTURE.md` lists what production auth would require.

## What production would need

1. An identity provider (email magic links or OTP, then OAuth).
2. Server-issued, `HttpOnly`, `Secure`, `SameSite=Lax` session cookies.
3. Authorisation enforced in the API/database, not only in React.
4. A per-action audit log written in the same transaction as the change.
5. Account verification (phone, ID, driver's licence) before a listing goes live.
6. Rate limiting and abuse detection on booking, review and dispute endpoints.

The current structure is deliberately shaped to accept that migration: writes
already go through a small set of domain functions, and the UI already renders
from `allowedActions()` instead of hard-coded role checks.
