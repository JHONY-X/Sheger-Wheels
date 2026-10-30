import Image from "next/image";
import Link from "next/link";

import { FeaturedCars } from "@/components/site/FeaturedCars";
import { HeroSearch } from "@/components/site/HeroSearch";
import { OwnerEarningsSection } from "@/components/site/OwnerEarningsSection";
import { Badge, Button, DemoChip } from "@/components/ui";
import { NEIGHBOURHOODS, seedCars } from "@/lib/seed/cars";

export const metadata = {
  title: "Car Rental in Addis Ababa",
  description:
    "Rent quality vehicles from local owners in Addis Ababa. Browse the fleet, pick your dates, and book in minutes.",
  alternates: { canonical: "/" },
};

const publicCars = seedCars.filter((car) => car.status === "approved" && car.active);
const heroCar = publicCars.find((car) => car.id === "car_mercedes_c200") ?? publicCars[0];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ---------------------------------------------------- Hero Section */}
      <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-line/40">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.25fr] lg:items-center">
            {/* Left copy */}
            <div className="z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                Premium car rental in Addis Ababa
              </p>

              <h1 className="mt-4 text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.1]">
                The city is yours.
                <br />
                <span className="text-forest">
                  Arrive in&nbsp;style.
                </span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                Browse quality vehicles from verified local owners, pick your dates, and book in minutes. Transparent pricing in ETB, no hidden fees.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/cars"
                  className="inline-flex h-11 items-center gap-2 rounded-btn bg-forest px-5 text-sm font-medium text-white transition-colors hover:bg-forest-600"
                >
                  <span>Explore the Fleet</span>
                  <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-white stroke-2">
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right — hero car image */}
            <div className="relative">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line/60 bg-sand shadow-card">
                <Image
                  src={heroCar.photos[0]}
                  alt={`${heroCar.make} ${heroCar.model}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/60 via-transparent to-transparent" />

                {/* Location chip */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-canvas/75 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur-sm border border-line/40">
                  <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-forest stroke-2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Featured Fleet */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
              Featured Fleet
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
              Choose your next drive
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              From executive sedans to luxury SUVs, find the perfect vehicle for your journey.
            </p>
          </div>

          <Link
            href="/cars"
            className="flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-600 transition-colors"
          >
            <span>View All Vehicles</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-current stroke-2">
              <path d="M4 10h12M12 6l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="mt-8">
          <FeaturedCars />
        </div>
      </section>

      {/* ---------------------------------------------------- Three Value Props */}
      <section className="border-y border-line/60 bg-sand/40 py-12">
        <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-6 sm:grid-cols-3">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-forest/20 bg-forest/8 text-forest">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Curated Fleet</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Well-maintained, premium brands, thoroughly inspected and always ready.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-forest/20 bg-forest/8 text-forest">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Transparent Pricing</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                No hidden fees. What you see is what you pay with straightforward ETB daily rates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-forest/20 bg-forest/8 text-forest">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Personal Support</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Our team is here before, during, and after your rental.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- For Owners Section */}
      <OwnerEarningsSection />
    </div>
  );
}
