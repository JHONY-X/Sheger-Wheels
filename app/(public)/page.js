import Image from "next/image";
import Link from "next/link";

import { FeaturedCars } from "@/components/site/FeaturedCars";
import { HeroSearch } from "@/components/site/HeroSearch";
import { Badge, Button, DemoChip } from "@/components/ui";
import { FEE_RATE } from "@/lib/pricing";
import { formatETB } from "@/lib/format";
import { NEIGHBOURHOODS, seedCars } from "@/lib/seed/cars";

export const metadata = {
  title: "Peer-to-peer car rental in Addis Ababa",
  description:
    "Rent a car from a verified owner in your neighbourhood, or list the car in your parking spot and earn from it. A student demo with simulated bookings and payments.",
  alternates: { canonical: "/" },
};

const publicCars = seedCars.filter((car) => car.status === "approved" && car.active);
const heroCar = publicCars.find((car) => car.model === "C-200") ?? publicCars[0];
const places = Object.keys(NEIGHBOURHOODS).length;
const fromPrice = Math.min(...publicCars.map((car) => car.pricePerDay));

const STEPS = [
  {
    title: "Search by neighbourhood",
    body: "Filter by area, dates, price and transmission. Results only show cars that are genuinely free for your window.",
  },
  {
    title: "Request the dates",
    body: "Send a request with your pick-up and return dates. The owner sees the total and accepts or declines.",
  },
  {
    title: "Meet and drive",
    body: "Collect the car nearby, then mark the trip returned. Leave a review once it is completed.",
  },
];

const OWNER_POINTS = [
  "Add a car, set the daily rate and block dates you need it",
  "Every request shows the full payout before you accept",
  "Disputes are handled by the platform admin, not in private",
];

export default function Home() {
  const exampleDays = 4;
  const exampleRate = 2400;
  const exampleSubtotal = exampleRate * exampleDays;
  const exampleFee = Math.round(exampleSubtotal * FEE_RATE);
  const exampleNet = exampleSubtotal - exampleFee;

  return (
    <>
      <section className="premium-home-hero border-b border-line">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-6 pb-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-16 lg:pb-12">
          <div className="premium-home-copy">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ochre-200">
              Addis Ababa · Thoughtful mobility
            </p>
            <h1 className="mt-5 max-w-2xl text-balance text-5xl leading-[0.98] text-ink sm:text-6xl lg:text-[4.25rem]">
              Drive the <span className="premium-gold-text">exceptional.</span>
              <br />Arrive in style.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              Discover a considered collection of cars for city journeys, family
              trips and the road beyond. Browse trusted local listings with clear
              ETB pricing and flexible dates.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" href="/cars">
                Explore the fleet <span aria-hidden>→</span>
              </Button>
              <Button size="lg" variant="secondary" href="/signup">
                List your car
              </Button>
              <DemoChip className="ml-1" />
            </div>

            <dl className="premium-home-stats mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
              {[
                [`${publicCars.length}`, "cars available"],
                [`${places}`, "local areas"],
                [`${formatETB(fromPrice)}`, "starting / day"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dd data-numeric className="font-display text-2xl text-ochre-200">
                    {value}
                  </dd>
                  <dt className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <Link
            href={`/cars/${heroCar.id}`}
            className="premium-featured-car group relative block aspect-[4/3] overflow-hidden rounded-card border border-ochre/35 bg-sand"
          >
            <Image
              src={heroCar.photos[0]}
              alt={`${heroCar.make} ${heroCar.model} ${heroCar.year}`}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
            <span className="premium-featured-tag absolute left-4 top-4 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em]">
              Addis Ababa · Featured
            </span>
            <div className="premium-featured-caption absolute inset-x-0 bottom-0 px-5 pb-5 pt-20 sm:px-6 sm:pb-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ochre-200">
                {heroCar.year} · {heroCar.transmission} · {heroCar.neighbourhood}
              </p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-2xl text-white sm:text-3xl">
                  {heroCar.make} {heroCar.model}
                </h2>
                <p className="text-xs text-white/80">
                  From <span data-numeric className="text-base font-semibold text-ochre-200">{formatETB(heroCar.pricePerDay)}</span> / day
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[1160px] px-6 pb-10">
          <HeroSearch />
        </div>
      </section>

      <section className="premium-collection mx-auto w-full max-w-[1240px] px-6 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ochre-200">
              The collection
            </p>
            <h2 className="mt-2 text-3xl text-ink sm:text-4xl">Choose your next drive</h2>
            <p className="mt-2 text-sm text-muted">
              Considered local listings, with transparent daily pricing.
            </p>
          </div>
          <Button variant="secondary" size="sm" href="/cars">
            View the full fleet <span aria-hidden>→</span>
          </Button>
        </div>

        <div className="mt-8">
          <FeaturedCars />
        </div>
      </section>

      <section id="how-it-works" className="premium-how-section border-y border-line bg-white/60">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl text-ink sm:text-3xl">How it works</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Three steps, and the state of every booking is visible to both
              sides the whole way through.
            </p>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-card border border-line bg-canvas p-6"
              >
                <span
                  data-numeric
                  className="flex size-9 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="for-owners" className="mx-auto w-full max-w-[1200px] px-6 py-16">
        <div className="premium-owner-panel overflow-hidden rounded-card bg-forest text-white">
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div>
              <Badge tone="onDark">For owners</Badge>
              <h2 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">
                Your car earns more than it costs to park.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75">
                Set your own rate and availability. Every request shows the
                payout before you accept, and you can block dates whenever you
                need the car yourself.
              </p>

              <ul className="mt-6 space-y-3">
                {OWNER_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/85">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3 fill-none stroke-current stroke-[2.5]"
                      >
                        <path
                          d="m5 10.5 3.5 3.5L15 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="inverse" href="/signup">
                  List your car
                </Button>
                <Link
                  href="/signin"
                  className="inline-flex h-11 items-center px-2 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  Sign in to your owner dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-card border border-white/15 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/75">
                Example payout
              </p>
              <p className="mt-2 text-sm text-white/70">
                Toyota Vitz · {exampleDays} days at {formatETB(exampleRate)}
              </p>

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Rental subtotal</dt>
                  <dd data-numeric className="font-medium text-white">
                    {formatETB(exampleSubtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Platform fee (10%)</dt>
                  <dd data-numeric className="font-medium text-white">
                    − {formatETB(exampleFee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/15 pt-3">
                  <dt className="font-medium text-white">You receive</dt>
                  <dd data-numeric className="text-lg font-semibold text-ochre-200">
                    {formatETB(exampleNet)}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/70">
                Illustrative numbers from the demo seed. No payment is taken and
                no money moves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-trust-section border-t border-line bg-white/60">
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-6 py-12 sm:grid-cols-3">
          {[
            {
              title: "Ownership checked twice",
              body: "The interface hides what you cannot do, and the action refuses it again on the way in.",
            },
            {
              title: "One booking state machine",
              body: "Every status change goes through the same guarded transition, so no screen can skip a step.",
            },
            {
              title: "Disputes are on the record",
              body: "Either side can raise an issue; the admin resolution and its notes stay attached to the booking.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-card border border-line bg-canvas p-5">
              <h2 className="font-sans text-sm font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
