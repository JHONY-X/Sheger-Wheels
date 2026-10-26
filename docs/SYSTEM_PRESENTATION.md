# Sheger Wheels — Comprehensive System Documentation & Architecture Guide

A complete architectural, engineering, and functional breakdown of **Sheger Wheels**, a peer-to-peer car rental marketplace tailored for Addis Ababa, Ethiopia.

**Live Demo URL:** [https://sheger-wheels.vercel.app](https://sheger-wheels.vercel.app)

---

## Table of Contents
1. [Executive Summary & Concept](#1-executive-summary--concept)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Folder & Directory Structure Breakdown](#3-folder--directory-structure-breakdown)
4. [Data Storage & Persistence Model](#4-data-storage--persistence-model)
5. [User Roles & RBAC (Role-Based Access Control)](#5-user-roles--rbac-role-based-access-control)
6. [Multi-Persona Interaction Workflows](#6-multi-persona-interaction-workflows)
   - [6.1 The Renter Journey](#61-the-renter-journey)
   - [6.2 The Owner Journey](#62-the-owner-journey)
   - [6.3 The Admin Journey](#63-the-admin-journey)
7. [Booking Finite State Machine (FSM)](#7-booking-finite-state-machine-fsm)
8. [Pricing, Settlement & TeleBirr Simulation](#8-pricing-settlement--telebirr-simulation)
9. [Developer Tools, Auditing & Quality Assurance](#9-developer-tools-auditing--quality-assurance)

---

## 1. Executive Summary & Concept

**Sheger Wheels** bridges the gap between vehicle owners with idle cars and residents/visitors in Addis Ababa who require reliable, short-term transportation.

### Key Architectural Characteristics
- **Client-Side Capstone Architecture:** Operates with zero remote backend dependencies. The entire system—authentication sessions, database tables, booking state machine, role permissions, and payments—is simulated on the client.
- **Persistent Local Database:** Backed by an intelligent, versioned `localStorage` abstraction layer with self-healing seeds.
- **Modern Next.js 16 App Router:** Combines Server Components with Route Groups (`(public)` vs `(app)`), Turbopack styling with Tailwind CSS v4, and dynamic client hooks.
- **URL-First Navigation:** Filtering, sorting, and pagination state live natively in query parameters, guaranteeing shareable, bookmarkable search results.

---

## 2. High-Level System Architecture

```
                                  BROWSER CLIENT
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Next.js 16 App Router (React 19)                                              │
│   ┌───────────────────────────┐         ┌───────────────────────────────────┐   │
│   │   (public) Route Group    │         │         (app) Route Group         │   │
│   │   - Landing Page (/)      │         │   - Shell Layout & Navigation     │   │
│   │   - Catalogue (/cars)     │         │   - Renter Dashboard (/dashboard) │   │
│   │   - Car Detail (/cars/id) │         │   - Owner Portal (/owner)         │   │
│   │   - Sign In & Sign Up     │         │   - Admin Governance (/admin)     │   │
│   │                           │         │   - Bookings & TeleBirr Checkout  │   │
│   └─────────────┬─────────────┘         └─────────────────┬─────────────────┘   │
│                 │                                         │                     │
│                 └────────────────────┬────────────────────┘                     │
│                                      ▼                                          │
│                    Business Logic & Domain Layer (lib/)                         │
│                    - FSM: lib/booking-state.js                                  │
│                    - RBAC: lib/permissions.js                                   │
│                    - Pricing: lib/pricing.js                                    │
│                    - Session: lib/session.js                                    │
│                                      │                                          │
│                                      ▼                                          │
│                    Persistent Client Storage (lib/storage.js)                   │
│                    - Auto-Seeding & Versioning Check                            │
│                    - Reactive Event Bus (Store Listeners)                       │
│                                      │                                          │
│                                      ▼                                          │
│                                Browser LocalStorage                             │
│     [sheggar_users_v1]  [sheggar_cars_v1]  [sheggar_bookings_v1]  [session]     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Folder & Directory Structure Breakdown

```
Sheger_Wheels/
├── app/                                # Next.js App Router Root
│   ├── (public)/                       # Publicly accessible routes (no auth required)
│   │   ├── page.js                     # Homepage: Hero search, featured cars, marketing pitch
│   │   ├── cars/
│   │   │   ├── page.js                 # Catalogue with URL filter synchronization
│   │   │   └── [id]/page.js            # Vehicle detail: specs, calendar, map, reviews
│   │   ├── signin/page.js              # Persona switcher & email login
│   │   └── signup/page.js              # Registration page with role toggles
│   │
│   ├── (app)/                          # Protected authenticated routes
│   │   ├── layout.js                   # Authenticated layout with dashboard navigation
│   │   ├── dashboard/page.js           # Renter dashboard: upcoming trips, metrics, quick actions
│   │   ├── bookings/
│   │   │   ├── page.js                 # Renter booking list + CSV export
│   │   │   └── [id]/page.js            # Individual booking receipt, actions, review modal
│   │   ├── checkout/page.js            # Simulated TeleBirr gateway & OTP confirmation
│   │   ├── owner/page.js               # Owner command center: booking requests, fleet, earnings
│   │   └── admin/page.js               # Admin command center: moderation, disputes, user audit
│   │
│   ├── dev/page.js                     # In-app development console & storage inspector
│   ├── styleguide/page.js              # Design system tokens and UI component gallery
│   ├── layout.js                       # Root HTML/Body layout with Google Font bindings
│   ├── not-found.js                    # Custom 404 page
│   ├── robots.js                       # Search engine crawler directives
│   ├── sitemap.js                      # Dynamically generated XML sitemap
│   └── globals.css                     # Tailwind v4 import & design variables
│
├── components/                         # Modular UI Components
│   ├── app/                            # Dashboard layout components (Sidebar, Topbar, Nav)
│   ├── cars/                           # Vehicle components (CarCard, SpecBadge, FilterBar)
│   ├── charts/                         # Recharts data visualizers (EarningsChart, StatusChart)
│   ├── home/                           # Landing page widgets (Hero, Features, Testimonials)
│   ├── layout/                         # Public Header, Footer, and Mobile navigation
│   └── ui/                             # Base atomic UI elements (Button, Modal, Input, Toast)
│
├── lib/                                # Core Business Logic & State Layer
│   ├── storage.js                      # Versioned LocalStorage with corrupt-key recovery
│   ├── store.js                        # React state hooks connected to browser storage
│   ├── session.js                      # Authenticated session lifecycle & persona switcher
│   ├── booking-state.js                # Finite State Machine governing booking transitions
│   ├── permissions.js                  # RBAC definition: canAccess, canPerformAction
│   ├── pricing.js                      # Daily rate, deposit, and platform fee calculations
│   ├── cars-query.js                   # Query engine for search, filter, and sorting
│   ├── format.js                       # Currency (ETB) and date formatting helpers
│   ├── csv.js                          # Client-side CSV generation for exports
│   ├── domain/                         # Sub-domain helper functions
│   └── seed/                           # Initial database records for cars, users, reviews
│
└── public/                             # Static public assets (images, social cards, icons)
```

---

## 4. Data Storage & Persistence Model

Because Sheger Wheels has no remote backend, **`lib/storage.js`** functions as an embedded database driver.

### 4.1 Storage Keys & Schema Collections

| Storage Key | Content Description | Sample Entity Structure |
|---|---|---|
| `sheggar_users_v1` | User accounts and credential profiles | `{ id, name, email, role: 'renter'\|'owner'\|'admin', phone, avatar }` |
| `sheggar_cars_v1` | Vehicle listings with pricing and specs | `{ id, ownerId, make, model, year, pricePerDay, location, status, images }` |
| `sheggar_bookings_v1` | Reservation contracts and state histories | `{ id, carId, renterId, ownerId, startDate, endDate, status, total, payment }` |
| `sheggar_session_v1` | Active authenticated persona pointer | `{ userId, authenticatedAt, activeRole }` |
| `sheggar_disputes_v1` | Moderation flags opened on bookings | `{ id, bookingId, openedBy, reason, status: 'open'\|'resolved' }` |

### 4.2 Versioning & Self-Healing (Auto-Seeding)
1. **Schema Integrity:** Every storage key has a version postfix (`_v1`).
2. **Auto-Bootstrap:** If a user visits the platform for the first time, `initStorage()` detects empty keys and auto-populates them with realistic Addis Ababa car listings, demo personas, and active bookings from `lib/seed/`.
3. **Corrupt-Key Recovery:** If JSON parsing fails (e.g., manual tamper or invalid syntax), the driver catches the error, isolates the damage, and cleanly re-seeds default data.
4. **Dev Reset:** Through the `/dev` page, anyone can click *"Reset to Seed Data"* to restore the initial demo state instantly.

---

## 5. User Roles & RBAC (Role-Based Access Control)

The system enforces permissions through **`lib/permissions.js`**:

```javascript
export const ROLES = {
  RENTER: 'renter',
  OWNER: 'owner',
  ADMIN: 'admin'
};
```

### Permission Matrix

| Capability | Renter | Owner | Admin |
|---|:---:|:---:|:---:|
| Browse & search catalogue | ✅ | ✅ | ✅ |
| Book cars & make TeleBirr payments | ✅ | ❌ | ❌ |
| Cancel own pending bookings | ✅ | ❌ | ✅ |
| List and edit vehicles | ❌ | ✅ | ✅ |
| Accept or decline booking requests | ❌ | ✅ | ❌ |
| View revenue, utilization & payout charts | ❌ | ✅ | ❌ |
| Review new listings in Moderation Queue | ❌ | ❌ | ✅ |
| Resolve disputes & force refunds | ❌ | ❌ | ✅ |
| Publish platform announcements | ❌ | ❌ | ✅ |

---

## 6. Multi-Persona Interaction Workflows

Sheger Wheels provides a seamless **Persona Switcher** in the navigation header, allowing a user or evaluator to switch between a Renter, an Owner, and an Admin in real time to test full end-to-end interactions.

### 6.1 The Renter Journey
1. **Search & Filter:** Renter visits `/cars`, filters by location (*Bole, Kazanchis, Old Airport*), gearbox (*Automatic*), and price range.
2. **Review Vehicle:** Opens `/cars/[id]`, checks high-resolution pictures, verified owner rating, specifications, and unavailable calendar dates.
3. **Select Dates & Calculate:** Chooses rental dates (e.g., 3 days). The price engine computes:
   $$\text{Total} = (\text{Daily Rate} \times \text{Days}) + \text{Deposit} + \text{Platform Fee}$$
4. **TeleBirr Checkout:** At `/checkout`, enters their mobile number, reviews the payment summary, and confirms the simulated OTP.
5. **Trip Execution:** Tracks booking status on `/bookings/[id]`. Upon car return, marks the trip complete and leaves a verified 5-star review.

---

### 6.2 The Owner Journey
1. **Fleet Listing:** Owner goes to `/owner` and clicks *"Add a Car"*. Fills out specifications, upload simulated photos, and sets the daily rate in ETB.
2. **Listing Review:** New cars enter `pending_review` until approved by the Admin.
3. **Incoming Requests:** When a renter submits a booking, the owner receives a real-time request on their dashboard with the renter's profile and trip dates.
4. **Approve or Reject:** The owner clicks **Accept** (transitioning the booking to `confirmed`) or **Decline** (triggering a simulated refund).
5. **Analytics & Financials:** The owner monitors utilization rate, upcoming returns, and 30-day earnings visualized via interactive Recharts.

---

### 6.3 The Admin Journey
1. **Moderation Queue:** Admin visits `/admin` to inspect newly submitted cars and either approves them for public listing or rejects them with feedback.
2. **Dispute Arbitration:** When a renter or owner flags an issue (e.g., late return or vehicle mismatch), the dispute appears in the Admin dispute queue. The admin reviews evidence and can issue a refund or release payment to the owner.
3. **System Broadcasts:** Admin can publish platform-wide notices that appear as banner alerts on all user dashboards.

---

## 7. Booking Finite State Machine (FSM)

Managed by **`lib/booking-state.js`**, this state machine prevents invalid business operations (e.g., reviewing a car that was cancelled):

```
                     ┌──────────────────┐
                     │     PENDING      │
                     │  (Awaiting Owner)│
                     └────────┬─────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
      [Owner Rejects]                   [Owner Accepts]
             ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │    CANCELLED    │               │    CONFIRMED    │
    │ (Refund Issued) │               │(Ready for Pickup│
    └─────────────────┘               └────────┬────────┘
                                               │
                                      [Pickup Confirmed]
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   IN PROGRESS   │
                                      │ (Trip Active)   │
                                      └────────┬────────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         ▼                                           ▼
                 [Car Returned OK]                           [Issue Flagged]
                         ▼                                           ▼
                ┌─────────────────┐                         ┌─────────────────┐
                │    COMPLETED    │                         │    DISPUTED     │
                │(Review Allowed) │                         │(Admin Escalated)│
                └─────────────────┘                         └────────┬────────┘
                                                                     │
                                                             [Admin Resolves]
                                                                     │
                                                                     ▼
                                                            ┌─────────────────┐
                                                            │    RESOLVED     │
                                                            └─────────────────┘
```

---

## 8. Pricing, Settlement & TeleBirr Simulation

Managed by **`lib/pricing.js`**:
* **Base Rental:** $\text{Daily Rate} \times \text{Number of Days}$
* **Security Deposit:** Flat refundable deposit (held in escrow during rental).
* **Platform Service Fee:** Calculated percentage to support platform operations.
* **TeleBirr Integration:** Simulated client-side payment with OTP verification, transaction IDs, and receipt generation with CSV export capabilities.

---

## 9. Developer Tools, Auditing & Quality Assurance

Sheger Wheels comes with built-in evaluation tools:
- **Diagnostic Inspector (`/dev`):** Evaluates local data integrity, checks schema consistency, and provides real-time storage state editing.
- **Interactive Styleguide (`/styleguide`):** Showcases the custom design kit, button variants, badges, form inputs, typography, and color tokens.
- **Automated Tests:** Includes 88 unit tests using Vitest covering pricing math, permission checks, and state machine transitions (`npm run test`).
- **Lighthouse Optimization:** Scored 100 on Accessibility, Best Practices, and SEO.

---
*Document generated for the Sheger Wheels platform.*
