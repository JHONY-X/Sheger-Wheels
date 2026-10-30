import Image from "next/image";
import Link from "next/link";

import { FeaturedCars } from "@/components/site/FeaturedCars";
import { HeroSearch } from "@/components/site/HeroSearch";
import { OwnerEarningsSection } from "@/components/site/OwnerEarningsSection";
import { Badge, Button, DemoChip } from "@/components/ui";
import { NEIGHBOURHOODS, seedCars } from "@/lib/seed/cars";

export const metadata = {
  title: "Luxury Car Rental in Addis Ababa",
  description:
    "Premium vehicles, professional chauffeurs, and effortless reservations. Experience Addis Ababa in comfort and style with Sheger Drive.",
  alternates: { canonical: "/" },
};

const publicCars = seedCars.filter((car) => car.status === "approved" && car.active);
const heroCar = publicCars.find((car) => car.id === "car_mercedes_c200") ?? publicCars[0];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ---------------------------------------------------- Hero Section */}
      <section className="relative min-h-[640px] pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-line/40">
        {/* Ambient background glow and city skyline aesthetics */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[680px] rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="absolute top-1/3 right-10 size-[400px] rounded-full bg-sky-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1.25fr] lg:items-center">
            {/* Left copy */}
            <div className="z-10">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
                  Premium Car Rental in Addis Ababa
                </span>
                <span className="h-px w-8 bg-blue-500/50" />
              </div>

              <h1 className="mt-5 text-balance text-4xl sm:text-5xl lg:text-[3.85rem] font-bold tracking-tight text-white leading-[1.05]">
                The city is yours.
                <br />
                <span className="italic font-normal text-blue-400 bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                  Arrive exceptionally.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-muted">
                Premium vehicles, professional chauffeurs, and effortless reservations. Experience Addis Ababa in comfort and style with Sheger Drive.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/cars"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(37,99,235,0.65)]"
                >
                  <span>Explore the Fleet</span>
                  <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-white stroke-2">
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                </Link>

                <button
                  type="button"
                  className="flex h-12 items-center gap-2.5 rounded-xl border border-line bg-sand/40 px-5 text-xs font-semibold text-white/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-blue-400">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Intro</span>
                </button>
              </div>
            </div>

            {/* Right showcase with Mercedes luxury vehicle */}
            <div className="relative">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-line/60 bg-[#161a22]/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                <Image
                  src={heroCar.photos[0]}
                  alt={`${heroCar.make} ${heroCar.model}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-transparent to-transparent opacity-80" />

                {/* Location indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md border border-white/10">
                  <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-blue-400 stroke-2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Addis Ababa, Ethiopia</span>
                </div>

                {/* Slider pagination pill */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 rounded-full bg-black/50 p-2 text-[10px] font-medium text-white/60 backdrop-blur-md border border-white/10">
                  <span className="text-white font-bold">01</span>
                  <span className="h-4 w-px bg-white/20" />
                  <span>03</span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Search Filter Bar */}
          <div className="mt-12">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Featured Fleet */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                Featured Fleet
              </span>
              <span className="h-px w-8 bg-blue-500/50" />
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Choose your next drive
            </h2>
            <p className="mt-2 text-xs text-muted sm:text-sm">
              From executive sedans to luxury SUVs, find the perfect vehicle for your journey.
            </p>
          </div>

          <Link
            href="/cars"
            className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All Vehicles</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-current stroke-2">
              <path d="M4 10h12M12 6l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="mt-10">
          <FeaturedCars />
        </div>
      </section>

      {/* ---------------------------------------------------- Three Value Props */}
      <section className="border-y border-line/60 bg-[#12161f]/50 py-12">
        <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-6 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Curated Fleet</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Well-maintained, premium brands, thoroughly inspected and always ready.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Transparent Pricing</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                No hidden fees. What you see is what you pay with straightforward ETB daily rates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Personal Support</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Our concierge team is here before, during, and after your journey.
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
