import Link from "next/link";
import {
  Badge,
  BOOKING_STATUS,
  Button,
  Card,
  CardBody,
  CardHeader,
  CarCardSkeleton,
  Checkbox,
  DemoChip,
  EmptyState,
  Input,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  StatCard,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
} from "@/components/ui";
import { CarCard } from "@/components/car/CarCard";

export const metadata = {
  title: "Design system",
  description: "Sheggar Wheels component and token reference.",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "Ink", token: "--color-ink", hex: "#14181A", note: "Primary text" },
  { name: "Forest", token: "--color-forest", hex: "#0B3D2E", note: "Primary action" },
  { name: "Forest 600", token: "--color-forest-600", hex: "#175B45", note: "Hover" },
  { name: "Ochre", token: "--color-ochre", hex: "#D99A2B", note: "Price, pending" },
  { name: "Sand", token: "--color-sand", hex: "#F3EDE3", note: "Bands, chips" },
  { name: "Canvas", token: "--color-canvas", hex: "#FAF8F4", note: "Page" },
  { name: "Line", token: "--color-line", hex: "#E4DED2", note: "Borders" },
  { name: "Muted", token: "--color-muted", hex: "#6B7280", note: "Secondary text" },
  { name: "Success", token: "--color-success", hex: "#2F7A55", note: "Resolved" },
  { name: "Danger", token: "--color-danger", hex: "#B3402F", note: "Errors" },
];

const CARS = [
  {
    id: "sw-car-1",
    make: "Toyota",
    model: "Vitz",
    year: 2019,
    seats: 4,
    transmission: "Automatic",
    neighbourhood: "Bole",
    pricePerDay: 2400,
    rating: 4.9,
  },
  {
    id: "sw-car-2",
    make: "Suzuki",
    model: "Dzire",
    year: 2021,
    seats: 4,
    transmission: "Manual",
    neighbourhood: "Kazanchis",
    pricePerDay: 1800,
    rating: 4.7,
  },
  {
    id: "sw-car-3",
    make: "Toyota",
    model: "Land Cruiser",
    year: 2018,
    seats: 7,
    transmission: "Automatic",
    neighbourhood: "CMC",
    pricePerDay: 9500,
    rating: 5,
  },
];

const BOOKINGS = [
  { ref: "SW-8F3A21", car: "Toyota Corolla 2021", dates: "24–26 Oct", days: 3, total: 7920, status: "confirmed" },
  { ref: "SW-2B91C4", car: "Suzuki Dzire 2021", dates: "12–14 Oct", days: 3, total: 5940, status: "completed" },
  { ref: "SW-77D0E2", car: "Hyundai i10 2020", dates: "2–3 Nov", days: 2, total: 3960, status: "requested" },
  { ref: "SW-51A9F7", car: "Kia Sportage 2022", dates: "8–9 Sep", days: 2, total: 11_000, status: "cancelled" },
];

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-12">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Label({ children }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
      {children}
    </p>
  );
}

export default function StyleGuidePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1200px] px-6 pb-24 pt-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-forest hover:underline hover:underline-offset-4"
          >
            ← Sheggar Wheels
          </Link>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
            Design system
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            The single source of truth for the build. Tokens live in{" "}
            <code className="rounded bg-sand px-1.5 py-0.5 text-xs text-ink">
              app/globals.css
            </code>
            ; components live in{" "}
            <code className="rounded bg-sand px-1.5 py-0.5 text-xs text-ink">
              components/ui
            </code>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="forest">v1</Badge>
          <DemoChip />
        </div>
      </header>

      <div className="mt-12 space-y-14">
        {/* ---------------------------------------------------------- Colour */}
        <Section
          id="colour"
          title="Colour"
          description="One brand colour, one accent for prices and pending states. Status is never conveyed by colour alone."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLORS.map((c) => (
              <div
                key={c.name}
                className="overflow-hidden rounded-card border border-line bg-white"
              >
                <div
                  className="h-20 w-full border-b border-line"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase text-muted">
                    {c.hex}
                  </p>
                  <p className="mt-1 text-xs text-muted">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------------- Typography */}
        <Section
          id="type"
          title="Typography"
          description="Fraunces for display, Plus Jakarta Sans for everything else. Prices use tabular figures so columns don't jitter."
        >
          <div className="space-y-8 rounded-card border border-line bg-white p-6 sm:p-8">
            <div>
              <Label>Display — Fraunces</Label>
              <p className="font-display text-4xl leading-tight text-ink sm:text-6xl">
                The car next door.
              </p>
            </div>
            <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <Label>H2 — 30px</Label>
                <p className="font-display text-3xl text-ink">
                  Available near you
                </p>
              </div>
              <div>
                <Label>H3 — 18px</Label>
                <p className="text-lg font-semibold text-ink">
                  Booking summary
                </p>
              </div>
              <div>
                <Label>Body — 14/16px</Label>
                <p className="text-sm leading-relaxed text-muted">
                  Rent from verified owners in your neighbourhood, or earn
                  from the car sitting idle in your parking spot.
                </p>
              </div>
            </div>
            <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              <div>
                <Label>Numeric — tabular</Label>
                <p data-numeric className="text-2xl font-semibold text-ink">
                  ETB 7,920
                </p>
                <p data-numeric className="text-2xl font-semibold text-ink">
                  ETB 11,110
                </p>
              </div>
              <div>
                <Label>Eyebrow — 12px, tracked</Label>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ochre-ink">
                  Peer-to-peer car rental · Addis Ababa
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- Buttons */}
        <Section
          id="buttons"
          title="Buttons"
          description="Minimum 44px height on the default size. All four variants, three sizes, plus disabled and link rendering."
        >
          <div className="space-y-8">
            <div>
              <Label>Variants</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Request to book</Button>
                <Button variant="secondary">View details</Button>
                <Button variant="ghost">Cancel</Button>
                <Button variant="destructive">Decline request</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <Label>With icon and as a link</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="size-4 fill-none stroke-current stroke-2"
                  >
                    <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                  </svg>
                  List your car
                </Button>
                <Button variant="secondary" href="/styleguide#forms">
                  Browse the form kit
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Forms */}
        <Section
          id="forms"
          title="Forms"
          description="Labels above every field, helper text below, errors wired with aria-invalid and aria-describedby. Never placeholder-only."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Default and helper" />
              <CardBody className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  hint="Demo accounts only — no password required."
                />
                <Input label="Phone" type="tel" placeholder="+251 9•• ••• •••" />
                <Select label="Neighbourhood" defaultValue="Bole">
                  <option>Bole</option>
                  <option>Kazanchis</option>
                  <option>CMC</option>
                  <option>Sarbet</option>
                </Select>
                <Input label="Price per day (ETB)" type="number" defaultValue={2400} />
                <Textarea
                  label="Description"
                  className="sm:col-span-2"
                  placeholder="Tell renters what makes this car a good trip."
                  hint="Maximum 400 characters."
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Error, disabled and selection" />
              <CardBody className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  defaultValue="not-an-email"
                  error="Enter a valid email address."
                />
                <Input
                  label="Booking reference"
                  defaultValue="SW-8F3A21"
                  disabled
                  hint="Read-only in this demo."
                />
                <div className="sm:col-span-2">
                  <Label>Segmented control</Label>
                  <Segmented
                    label="Transmission"
                    value="automatic"
                    options={[
                      { value: "any", label: "Any" },
                      { value: "automatic", label: "Automatic" },
                      { value: "manual", label: "Manual" },
                    ]}
                  />
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Checkbox
                    label="Free cancellation"
                    hint="Up to 48 hours before pickup."
                    defaultChecked
                  />
                  <Checkbox label="Instant booking" hint="Not available in this demo." disabled />
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* ----------------------------------------------------------- Status */}
        <Section
          id="status"
          title="Status"
          description="Every booking state, always as a written label. The dot is decoration, not the message."
        >
          <div className="flex flex-wrap gap-3">
            {Object.entries(BOOKING_STATUS).map(([status]) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge tone="forest">Approved</Badge>
            <Badge tone="warning">Pending review</Badge>
            <Badge tone="muted">Inactive</Badge>
            <Badge tone="success">Active</Badge>
            <Badge tone="danger">Suspended</Badge>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Cards */}
        <Section
          id="cards"
          title="Cards"
          description="The car card is the signature component. Hover raises the shadow, the favourite control is a real button with an accessible name."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CarCard car={CARS[0]} />
            <CarCard car={CARS[1]} flag="new" />
            <CarCard car={CARS[2]} flag="rare" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Upcoming trips" value="1" hint="next on 24 Oct" />
            <StatCard label="Completed trips" value="7" hint="since 2023" />
            <StatCard label="Cancelled" value="1" hint="1 refunded" />
            <StatCard
              label="Total spend"
              value="ETB 46,800"
              delta={{ value: "+12%", direction: "up" }}
              hint="vs last year"
            />
          </div>
        </Section>

        {/* ---------------------------------------------------------- Table */}
        <Section
          id="table"
          title="Data table"
          description="Semantic markup, a screen-reader caption, right-aligned numerals and 44px-row rhythm. Scrolls horizontally on narrow screens instead of overflowing the page."
        >
          <Table caption="Recent renter bookings">
            <THead>
              <TR>
                <TH>Reference</TH>
                <TH>Car</TH>
                <TH>Dates</TH>
                <TH align="right">Days</TH>
                <TH align="right">Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {BOOKINGS.map((b) => (
                <TR key={b.ref}>
                  <TD className="font-mono text-xs text-muted">{b.ref}</TD>
                  <TD className="font-medium">{b.car}</TD>
                  <TD className="text-muted">{b.dates}</TD>
                  <TD align="right" numeric>
                    {b.days}
                  </TD>
                  <TD align="right" numeric className="font-medium">
                    ETB {b.total.toLocaleString("en-ET")}
                  </TD>
                  <TD>
                    <StatusBadge status={b.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Section>

        {/* ---------------------------------------------------------- States */}
        <Section
          id="states"
          title="States"
          description="Empty, filtered-empty, error, loading and pagination. These are checklist items, not decoration."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState
              title="No cars match those filters"
              description="Try widening your price range or removing a date."
              action={
                <Button variant="secondary" size="sm">
                  Clear all filters
                </Button>
              }
              icon={
                <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="6" />
                  <path d="m16 16 4 4" strokeLinecap="round" />
                </svg>
              }
            />

            <EmptyState
              tone="error"
              title="We couldn't read your saved demo data"
              description="The stored data is malformed. Reset the demo to restore the seeded records — this only affects this browser."
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button size="sm">Reset demo data</Button>
                  <Button variant="secondary" size="sm">
                    Reload page
                  </Button>
                </div>
              }
              icon={
                <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2">
                  <path d="M12 8v5" strokeLinecap="round" />
                  <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
                  <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="min-w-0">
              <Label>Card skeleton</Label>
              <CarCardSkeleton />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <Label>Table skeleton</Label>
              <div className="overflow-hidden rounded-card border border-line bg-white">
                <div className="flex items-center gap-4 border-b border-line p-4">
                  <Skeleton className="h-4 w-20 shrink-0" />
                  <Skeleton className="h-4 min-w-0 flex-1" />
                  <Skeleton className="h-4 w-14 shrink-0" />
                </div>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-line p-4 last:border-0">
                    <Skeleton className="h-4 w-16 shrink-0" />
                    <Skeleton className="h-4 min-w-0 flex-1" />
                    <Skeleton className="h-4 w-16 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Label>Pagination</Label>
            <Pagination page={3} totalPages={9} />
          </div>
        </Section>
      </div>
    </main>
  );
}
