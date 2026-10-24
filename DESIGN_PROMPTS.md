# Sheggar Wheels — Google Stitch Prompt Pack

Copy-paste prompts for generating the UI/UX in [Google Stitch](https://stitch.withgoogle.com).

---

## How to use this pack

1. **Create one Stitch project** and stay in the same thread. Stitch carries the established visual language forward, so you only describe the style once (Prompt 1) and then reference it.
2. **Run Prompt 1 first.** It has no screens — it's the design system anchor. If the output is wrong, fix it here before generating anything else.
3. **Then run one screen prompt at a time.** Stitch produces better layouts for one screen than for eight. After each, ask for the mobile version.
4. **Use the experimental/thinking mode** if your account has it — the layouts are noticeably more considered.
5. **Iterate with short deltas** (see §5), not by rewriting the whole prompt.
6. **Export to Figma** for the design file, and use the code export only as a *visual reference*. Stitch doesn't know your data layer, and its markup is not accessible enough for the capstone checklist — you'll rebuild with semantic components.

> **Scope lock matters.** Stitch loves inventing features. Every prompt below ends with a "do not add" list. Keep it. Extra screens cost you marks for scope creep and days you don't have.

---

## 1. Master prompt — design system anchor

```
Design the visual design system and component library for "Sheggar Wheels", a
peer-to-peer car rental marketplace in Addis Ababa, Ethiopia. Car owners list their
idle cars; renters find and book them by the day; admins moderate the platform.
This is a portfolio-quality product, not a discount rental site.

VISUAL DIRECTION — "Neighborhood Modern"
Calm, editorial, trustworthy. Closer to a well-designed property marketplace than a
car-rental chain. Generous whitespace, strong typographic hierarchy, warm off-white
surfaces, one deep brand color, ochre reserved for prices and pending states.
No gradients. No glassmorphism. No neon. No dark mode. No 3D blobs. No AI-generated
faces. No car manufacturer logos.

COLOR
- Ink        #14181A   primary text
- Forest     #0B3D2E   primary: buttons, active nav, links
- Forest-600 #175B45   hover state
- Ochre      #D99A2B   prices, "requested" state, highlight rule
- Sand       #F3EDE3   section bands, chips, image placeholders
- Canvas     #FAF8F4   page background
- Line       #E4DED2   borders and dividers
- Success    #2F7A55   Warning #B5761A   Danger #B3402F   Muted #6B7280

TYPOGRAPHY
- Display: "Fraunces" (soft serif) — hero headline and section headers ONLY.
- UI + body: "Plus Jakarta Sans" — 14px base, 16px for reading text.
- Prices use tabular figures. Never more than three text sizes on one card.

SHAPE AND SPACING
- Radius: 16px cards, 12px inputs and buttons, 999px pills.
- 8px spacing scale. Content max-width 1200px, 24px gutters, 64–96px between sections.
- Cards use a 1px Line border plus a barely-visible shadow. No heavy drop shadows.

COMPONENTS TO DEFINE (show each in its default, hover and disabled state)
Buttons: primary (forest, white label), secondary (white with forest border),
ghost, destructive. Minimum height 44px, 12px radius, medium weight.
Inputs: label above, 44px height, helper text below, error state in Danger with
icon + message. Select, checkbox, radio, segmented control, date-range field,
range slider with ETB value labels.
Car card: 4:3 photo, 16px radius, favourite icon top-right, status pill,
"Toyota Vitz 2019", meta row (4 seats · Automatic · Bole), "ETB 2,400 / day".
Stat card: label, large number, delta line, optional sparkline.
Data table: sticky header, zebra-free, 56px rows, right-aligned numbers,
row hover, status pills, pagination footer with current page indicator.
Status pills: requested = ochre tint, confirmed = forest tint, in_progress = blue
tint, completed = neutral, reviewed = neutral outline, declined/cancelled = muted
outline, disputed = danger tint, resolved = success tint. Always pill + written label,
never color alone.
Empty state, loading skeleton, error notice, toast, modal.

GLOBAL RULES
- A small "Demo data" chip sits in the global header on every page.
- Prices always read "ETB 2,400" with "/ day" in muted small text.
- Focus ring: 2px forest, 2px offset. All targets at least 44×44px.
- Labels are never placeholder-only. AA contrast everywhere.
- Fictional but realistic Ethiopian names and places: Selam Tesfaye,
  Dawit Bekele, Hanna Girma; Bole, Kazanchis, CMC, Sarbet, Piassa, Mekaniska,
  Gerji, Ayat.

DO NOT ADD: dark mode, social login, chat or messaging, live GPS tracking,
real payment branding, loyalty points, multi-currency, language switcher.
```

---

## 2. Landing page

```
Using the Sheggar Wheels design system already established, design the public
landing page at desktop 1440px.

HEADER — sticky, 72px, Canvas background with a 1px bottom border.
Left: wordmark "sheggar" in Fraunces lowercase with a small circular wheel mark,
then nav links "Browse cars", "How it works", "For owners".
Right: a subtle "Demo data" chip, "Sign in" ghost button, "List your car" primary button.

HERO — two columns, 60/40, 96px top padding.
Left column: eyebrow "Peer-to-peer car rental · Addis Ababa" in ochre uppercase
12px tracking-wide; H1 in Fraunces 64px, three lines: "The car next door."
Supporting line 18px muted, max 46 characters per line: "Rent from verified owners
in your neighbourhood — or earn from the car sitting idle in your parking spot."
Then a search panel: a white card, 16px radius, 1px Line border, containing four
inline fields — Neighbourhood (select), Pick-up date, Return date, and a forest
"Search cars" button with a magnifier icon. Below it a muted micro-line:
"Free cancellation up to 48 hours before pickup."
Right column: a large photograph of a compact silver hatchback parked on a quiet
Addis street with jacaranda trees, 20px radius. Overlay a faint thin route line.
Float a small white card at the lower left of the image: thumbnail of the car,
"Toyota Vitz · Bole", "ETB 2,400 / day", and a small "Available today" pill.
Below the hero, a trust row of three items separated by thin dividers:
"4.8 average rating", "120+ cars", "8 neighbourhoods".

SECTION "Available near you" — header row with H2 in Fraunces and a text link
"View all cars →" on the right. A four-column grid of car cards: Toyota Vitz,
Suzuki Dzire, Hyundai i10, Toyota Corolla — different prices, neighbourhoods and
photos. One card shows a "New" pill.

SECTION "How it works" — Sand background band, three numbered columns with thin
circular numerals: 01 Find your car, 02 Request and confirm, 03 Pick up and drive.
One short sentence each, plus a muted line under the third: "Payment is simulated
in this demo."

SECTION "Own a car?" — a two-column band: left a short pitch in Fraunces 40px
"Your car earns while you sleep." with a primary CTA "List your car"; right a
small earnings illustration card showing "Est. ETB 18,400 / month" over a simple
bar sparkline.

FOOTER — Canvas with top border, four columns of links, the wordmark, and a muted
disclaimer: "Sheggar Wheels is a student demo. Bookings, payments and reviews are
simulated; no real transaction occurs."

MOBILE 390px: stack everything, collapse the search panel into a single
"Where and when?" button that expands, 1-column car grid, horizontal scroll for
"How it works" only if it stays readable.
```

---

## 3. Car catalogue

```
Using the Sheggar Wheels design system, design the car catalogue at desktop 1440px.

PAGE HEADER — breadcrumb "Home / Cars", H1 in Fraunces "Cars in Addis Ababa",
muted line "38 cars available · 12–18 October".

LAYOUT — a 280px filter rail on the left, results on the right, 32px gap.

FILTER RAIL — a white card, 1px border, 16px radius, sticky on scroll.
Sections separated by thin dividers:
1. Search input with magnifier, placeholder "Make or model".
2. Neighbourhood — checkbox list of Bole, Kazanchis, CMC, Sarbet, Piassa, Gerji,
   Ayat, with counts on the right in muted text.
3. Price per day — a dual-handle range slider from ETB 1,000 to 10,000 with the
   selected range shown above in tabular figures, e.g. "ETB 1,800 – 4,500".
4. Transmission — a segmented control: Any / Automatic / Manual.
5. Seats — a row of pill toggles: 2+, 4+, 5+, 7+.
6. Dates — pick-up and return date fields side by side.
7. Footer of the rail: "Clear all" text button on the left, "Show 12 cars"
   primary button on the right.
Mobile: this becomes a "Filters" button that opens a full-height bottom sheet with
the same sections and a sticky apply bar.

RESULTS TOOLBAR — left: "12 cars" in medium weight plus active filter chips
("Bole ×", "Automatic ×", "Under ETB 4,500 ×") in Sand pills with a small close icon.
Right: sort select "Price: low to high" and a grid/map segmented toggle.

GRID — three columns, 24px gap, 12 car cards. Vary the data so the design is
tested: one card with a "New" pill, one with "Rare find" in ochre, one without a
rating, prices from ETB 1,800 to ETB 9,500. Show at least one card where the
title wraps to two lines.

PAGINATION — centered at the bottom: previous, 1, 2, 3, …, 7, next; the current
page as a filled forest square with white text, 44px targets.

EMPTY STATE (show as a second frame) — a centered illustration-free composition:
a thin-line car outline in Line color, H3 "No cars match those filters",
muted line "Try widening your price range or removing a date.",
a secondary button "Clear all filters".
```

---

## 4. Car detail

```
Using the Sheggar Wheels design system, design the car detail page at desktop 1440px.

TOP — breadcrumb "Cars / Toyota Vitz 2019". A photo gallery: one large 16:9 image
on the left at 20px radius, and a 2×2 grid of four thumbnails on the right, same
height, 12px gaps. The last thumbnail has a dark scrim and "View all 12 photos"
in white.

BODY — two columns, 65/35, 48px gap.

LEFT COLUMN
- H1 "Toyota Vitz 2019" in Fraunces 40px. Under it a meta row:
  "4 seats · Automatic · Petrol · Bole, Addis Ababa" with small line icons.
- A horizontal divider, then an owner strip: 40px avatar, "Selam Tesfaye",
  "Owner since 2023 · responds in about 1 hour", and a "Superhost" style pill in
  Sand that reads "Top rated owner" (no invented review counts).
- Section "About this car" — two short paragraphs.
- Section "Specifications" — a 3-column definition grid: Transmission, Seats,
  Fuel, Year, Doors, Luggage, each as small label above value.
- Section "Availability" — a month calendar with available days in Canvas,
  unavailable days struck through in Muted, selected range in a Sand band with
  forest endpoints. Legend below. A muted note: "Dates shown are demo
  availability, not live."
- Section "Location" — a muted map with a soft circular radius marker over Bole,
  a white address card pinned at the corner: "Bole, near Edna Mall",
  "Exact address shared after confirmation". A text fallback line under the map.
- Section "Reviews" — three review cards: avatar, name, star row, date, two-line
  comment, and on one card an owner reply indented in a Sand block labelled
  "Response from Selam".

RIGHT COLUMN — a sticky booking card, white, 1px border, 20px radius, 24px padding.
- Price line: "ETB 2,400" in 28px tabular figures with "/ day" muted.
- Rating row: star, "4.9", muted "· 23 trips".
- Two date fields stacked with a thin divider and a small swap icon between them.
- A price breakdown: "ETB 2,400 × 3 days" … "ETB 7,200", "Service fee (10%)"
  … "ETB 720", divider, "Total" … "ETB 7,920" in semibold.
- Primary full-width button "Request to book".
- Muted micro-copy under the button: "You won't be charged yet. This demo
  simulates payment."
- A thin bordered notice at the bottom of the card with a shield icon:
  "Free cancellation up to 48 hours before pickup."

MOBILE 390px: gallery becomes a swipeable carousel with dots, booking card becomes
a fixed bottom bar showing "ETB 2,400 / day" and a "Request" button, which expands
into a sheet.
```

---

## 5. Sign in / sign up

```
Using the Sheggar Wheels design system, design the sign-in screen at desktop 1440px,
as a split screen.

LEFT PANEL (55%) — a full-bleed photograph of an empty road at golden hour,
dark forest overlay at 55% opacity. On it, bottom-left, in white: the wordmark,
then a quote in Fraunces 32px — "The car next door, whenever you need it." —
and a muted line "Addis Ababa · peer-to-peer car rental".

RIGHT PANEL (45%) — Canvas background, content vertically centered, max-width 420px.
- H1 in Fraunces "Welcome back", muted line "Sign in to manage your trips."
- A "Demo accounts" label in 12px uppercase tracking-wide with a small "Demo data" chip.
- Three selectable account cards stacked, each 72px: avatar initials in a Sand
  circle, name, role line ("Renter · 4 trips", "Owner · 3 cars", "Admin"),
  and a chevron. The renter card is shown in a selected state with a 2px forest
  border and a check icon.
- A divider with the word "or".
- Email field with label "Email" and helper "Demo accounts only — no password
  required."
- Primary button "Continue".
- A bordered info strip in Sand: "This is a demonstration. No password is stored
  and no real account is created."
- Footer line: "New here? Create a demo account" as a forest text link.

Show a second frame for the error state: email input in the Danger border state
with the message "That email isn't in the demo data." and the info strip still
visible.

MOBILE 390px: hide the photo panel, keep a 96px forest band at the top with the
wordmark, stack the account cards.
```

---

## 6. Renter dashboard

```
Using the Sheggar Wheels design system, design the renter dashboard at desktop
1440px. This is the signed-in renter view, not the public site.

SHELL — a top header like the public site but the nav becomes
"Dashboard / Bookings / Favourites", with an avatar menu on the right.
Below the header, a page header row: H1 in Fraunces "Good morning, Dawit",
muted "You have 1 upcoming trip."

STAT ROW — four stat cards in a row, equal width:
Upcoming trips 1 · Completed trips 7 · Cancelled 1 · Total spend ETB 46,800.
Each card: small muted label, 32px tabular number, and a muted second line
("next on 24 Oct", "since 2023", "1 refunded", "last 12 months").

NEXT TRIP CARD — the visual focus, spanning full width.
Left: 240×160 photo of the booked car at 16px radius.
Middle: "Toyota Corolla 2021" in 24px, meta row "Bole, Addis Ababa ·
24–26 October · 3 days", and a horizontal stepper: Requested ✓ — Confirmed ✓ —
In progress — Completed, with the confirmed step filled forest and the rest in Line.
Right: "ETB 7,920" total in tabular figures, a status pill "Confirmed",
a primary button "View trip" and a ghost button "Message owner" (disabled with a
tooltip-style muted note "Not available in this demo").

BOOKINGS TABLE — H2 "Recent bookings" with a text link "View all" and a secondary
button "Export CSV" with a download icon.
Table columns: Car, Dates, Days, Total, Status, Actions. Five rows covering
statuses: requested, confirmed, in_progress, completed, cancelled.
Actions column uses quiet icon buttons (view, cancel) with the cancel disabled
where the state doesn't allow it.
Mobile: the table converts to stacked cards with the same information.

EMPTY STATE (second frame) — a centered card on Sand: thin-line calendar icon,
"No trips yet", muted "Your first booking will appear here.",
primary button "Browse cars".
```

---

## 7. Booking detail and mock checkout

```
Using the Sheggar Wheels design system, design two screens at desktop 1440px.

SCREEN A — BOOKING DETAIL
Page header: breadcrumb "Bookings / SW-8F3A21", H1 "Booking SW-8F3A21",
and a status pill "Confirmed" next to the title.
Two columns, 65/35.
Left: a trip summary card with car thumbnail, make and model, owner name, and a
four-item detail grid (Pick-up, Return, Duration, Neighbourhood). Below it a
vertical timeline of the booking lifecycle — Requested 18 Oct 10:04,
Confirmed 18 Oct 14:22, In progress, Completed — with the completed steps
in forest and future steps in Line, timestamps in muted text. Below that a
receipt block: subtotal, service fee, total, payment status "Paid (simulated)"
with a muted note and a fake transaction reference "DEMO-TB-4471-9021" in a
monospace style.
Right: an actions card — primary "Cancel booking", ghost "Raise an issue",
and a muted paragraph explaining the cancellation window.
Show a disabled/refused state as a small inline notice in the actions card:
"You can't cancel a trip that has already started." in a Sand block with an
info icon.

SCREEN B — CHECKOUT
A three-step horizontal progress indicator at the top:
"1 Review · 2 Payment · 3 Confirmation", with step 2 active.
Left column: an order summary card, then a "Payment" card containing a segmented
choice of two methods — "TeleBirr" (selected, with a small phone icon) and
"Cash on pickup" — and a bordered Sand banner across the card:
"Simulated payment. No money moves and no credentials are collected."
A primary button "Complete demo payment".
Right column: a sticky price card with the full breakdown, total in 28px tabular
figures, and a muted security line.
MOBILE 390px: progress indicator becomes compact, the sticky price card becomes
a collapsible summary at the top.
```

---

## 8. Owner dashboard

```
Using the Sheggar Wheels design system, design the owner area at desktop 1440px.
The owner experience must look structurally different from the renter dashboard:
a persistent left sidebar, not a top nav.

SIDEBAR — 240px, Forest #0B3D2E background, full height, rounded only on the
right side. Wordmark in white at the top. Nav items in white at 70% opacity:
Overview, My cars, Bookings, Earnings, Reviews, Disputes, with line icons.
The active item has a white 12% background pill and full-opacity text.
At the bottom: the signed-in owner's avatar, "Selam Tesfaye", "Owner", and a
sign-out icon. A small "Demo data" chip sits above the avatar.

MAIN AREA — Canvas background, 32px padding.
Page header: H1 in Fraunces "Overview", muted date range, and a secondary button
"Export earnings".

STAT ROW — four cards: Total earnings ETB 128,400 · This month ETB 18,900 ·
Active listings 3 · Pending requests 2.

CHART — a white card, 16px radius, titled "Earnings" with a segmented control
(6 months / 12 months). A smooth forest area chart with a soft Sand fill,
month labels on the x-axis, ETB labels on the y-axis, no gridlines except a
faint horizontal baseline. Include a hover tooltip frame showing "August ·
ETB 22,400". Under the chart, a compact accessible table of the same data in
14px, collapsible.

BOOKING REQUESTS — H2 "Requests waiting for you" with a count pill.
Two rows, each a white card: renter avatar + name, car thumbnail + name,
"24–26 Oct · 3 days", total, and two buttons — a primary "Approve" and a
secondary "Decline". One declined row shows the muted terminal state instead
of buttons.

MY CARS — H2 "Your cars" with a primary "Add car" button on the right.
A three-column grid of owner car cards: photo, title, price per day, a status
pill (approved / pending review / inactive), a small utilization bar
("72% booked this month"), and a quiet actions row: Edit · Availability · Bookings.

MOBILE 390px: the sidebar collapses into a bottom tab bar with five icons,
stat cards become a 2×2 grid.
```

---

## 9. Admin area

```
Using the Sheggar Wheels design system, design the admin area at desktop 1440px.
The admin experience should feel denser and more utilitarian than the others —
a control room, not a storefront.

SIDEBAR — 248px, near-black Ink #14181A background, white text at 65% opacity.
Wordmark with an "Admin" pill beside it. Nav: Overview, Listings, Users,
Bookings, Disputes, Reports, Announcements. Active item has an ochre left rule
and full-opacity text. Bottom: "Demo data" chip and the admin identity
"Platform admin".

TOP BAR — a global search input with a keyboard hint "⌘K", a notification bell
with a small dot, and an avatar.

OVERVIEW SCREEN
- H1 "Platform overview" with a muted "Last 30 days" select on the right.
- Four KPI cards with small sparklines: Total users 128 · Active listings 34 ·
  Bookings this month 76 · Platform fee ETB 24,180. One card shows a downward
  delta in Danger to prove the component handles negatives.
- Two charts side by side at equal height: a stacked bar chart "Bookings by
  status" (requested, confirmed, in progress, completed, cancelled) using the
  status palette, and a line chart "Monthly booking volume".
- A "Needs attention" list: two pending listings and one open dispute, each row
  with an entity name, a reason line, an age ("2 days ago"), and a
  "Review" text link.

LISTINGS MODERATION SCREEN (second frame)
- A data table: thumbnail + car name, owner, neighbourhood, price, submitted
  date, status pill, actions. Three rows show "Pending review" with a primary
  "Approve" and a secondary "Reject" button in the actions cell.
- A filter row above the table: status select, search, and a date range.
- A bulk action bar appears when rows are selected: "2 selected · Approve ·
  Reject", on a Sand background.

USERS SCREEN (third frame)
- Table: avatar + name, email, roles as small sand pills ("renter", "owner"),
  status pill (active / suspended), joined date, actions (view, suspend).
- One suspended row is visually de-emphasized with a Danger-tinted status pill
  and a "Reinstate" action instead of "Suspend".

Tables must have 56px rows, sticky headers, right-aligned numeric columns and
44px touch targets. No color-only status.
```

---

## 10. States pass

```
Using the Sheggar Wheels design system, design a single reference sheet showing
these UI states side by side on a Canvas background, each labelled in small
uppercase muted text above it:

1. Empty — "You have no bookings yet" with a thin-line calendar illustration,
   a muted supporting line and a primary CTA.
2. Filtered-empty — "No cars match those filters" with a "Clear all filters"
   secondary CTA.
3. Loading — a car card skeleton: Sand blocks with a subtle pulse for image,
   title, meta and price lines.
4. Error — a bordered card in Danger tint: "We couldn't read your saved demo
   data." plus a muted line explaining recovery and two buttons:
   "Reset demo data" (primary) and "Reload" (secondary).
5. Success toast — bottom-right, white card with a success icon, "Booking
   requested", muted "Waiting for the owner to confirm.", and a close icon.
6. Refused action — an inline notice on Sand: "Not yours — this booking belongs
   to another renter." with a lock icon, no CTA.
7. Access blocked — a centered card for a suspended account: forest lock icon,
   "Your demo account is suspended", muted explanation, and a ghost
   "Sign out" button.

Keep every state within the same page width so they read as a system.
```

---

## 11. Iteration vocabulary

Short, surgical follow-ups work better than regenerating:

- "Increase spacing between the cards to 24px and reduce the card radius to 12."
- "The price is too quiet — make it semibold and 20px."
- "Rewrite the hero headline in a calmer, less salesy tone."
- "This table is too dense. Increase row height to 64px and remove the zebra striping."
- "Show the pending state for that button, not just the default."
- "Reduce the number of font weights to three."
- "The status pill relies on color alone — add an icon."
- "Re-run the same layout at 390px width and keep the hierarchy."

---

## 12. Handoff to code

Once you like the result, translate — don't copy.

| Stitch output | Your project |
|---|---|
| Hex palette | `tailwind.config.js` `theme.extend.colors` |
| Font names | `next/font/google` (`Fraunces`, `Plus_Jakarta_Sans`) |
| Radius scale | `theme.extend.borderRadius` |
| Components | `components/ui/*.js` — one file each, built from semantic HTML |
| Table / form styling | Tailwind classes on real `<table>`, `<label>`, `<input>` |
| Exported code | Reference only — never paste. It won't be accessible or data-aware. |

**Check before you build:** every colour pair you plan to use passes contrast, every
interactive element is at least 44×44, and nothing in the design relies on colour
alone to convey booking status. Those three are explicit checklist items, and they're
much cheaper to fix in the mockup than in code.
