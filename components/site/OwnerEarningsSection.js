"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatETB } from "@/lib/format";

const VEHICLE_RATES = {
  "Toyota Corolla Cross": 6400,
  "Mercedes-Benz E-Class": 8500,
  "Range Rover Sport": 14000,
  "Toyota Land Cruiser": 9500,
  "BYD Song Plus": 7200,
};

export function OwnerEarningsSection() {
  const [vehicle, setVehicle] = useState("Toyota Corolla Cross");
  const [days, setDays] = useState(15);

  const rate = VEHICLE_RATES[vehicle] || 6400;
  const gross = rate * days;
  const netEarnings = Math.round(gross * 0.9); // 10% platform fee

  return (
    <section id="for-owners" className="mx-auto w-full max-w-[1280px] px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1.3fr] lg:items-center">
        {/* Left Column: Copy & Checklist */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              For Vehicle Owners
            </span>
            <span className="h-px w-8 bg-blue-500/50" />
          </div>

          <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">
            Your car <span className="text-blue-400">earns more</span>
            <br />
            than it <span className="italic text-sky-300">costs to park.</span>
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
            List your vehicle, get booking requests, and track your earnings — all from your dedicated dashboard with guaranteed safety and verified drivers.
          </p>

          <ul className="mt-6 space-y-3.5">
            {[
              "Add your vehicle in minutes",
              "Set your own pricing & calendar",
              "Track bookings & real-time payouts",
              "Full 24/7 support & verified renters",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-ink/90">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-blue-400 stroke-[2.5]">
                    <path d="m5 10 3.5 3.5L15 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500"
            >
              <span>List Your Car</span>
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-white stroke-2">
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
            </Link>

            <Link
              href="/owner"
              className="inline-flex h-11 items-center gap-2 text-xs font-semibold text-muted hover:text-white transition-colors"
            >
              <span>Owner Dashboard</span>
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-current stroke-2">
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Column: Earnings Calculator Card + Car Preview */}
        <div className="relative grid gap-6 sm:grid-cols-[1.1fr_1.1fr] items-center rounded-3xl border border-line/60 bg-[#141822]/90 p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {/* Calculator Controls */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white">
              Earnings Calculator
            </h3>

            {/* Vehicle Type Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Vehicle type
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line/80 bg-sand/60 px-3.5 py-2.5 text-xs font-medium text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {Object.keys(VEHICLE_RATES).map((name) => (
                  <option key={name} value={name} className="bg-[#141822] text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rental Days Selector */}
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Rental days per month
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-line/80 bg-sand/60 px-3.5 py-2.5 text-xs font-medium text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {[5, 10, 15, 20, 25, 30].map((d) => (
                  <option key={d} value={d} className="bg-[#141822] text-white">
                    {d} days
                  </option>
                ))}
              </select>
            </div>

            {/* Output */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span>Est. monthly earnings</span>
                <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-muted stroke-2">
                  <circle cx="10" cy="10" r="8" />
                  <line x1="10" y1="9" x2="10" y2="14" />
                  <circle cx="10" cy="6" r="0.5" fill="currentColor" />
                </svg>
              </div>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight text-blue-400">
                {formatETB(netEarnings)}
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted/70">
                Actual earnings may vary based on demand, season and vehicle condition.
              </p>
            </div>
          </div>

          {/* Car Image Preview */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line/40 bg-sand/40">
            <Image
              src="/2020%20Hyundai%20Tucson.jpg"
              alt="Luxury vehicle for owners"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141822]/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
              <span className="font-medium">{vehicle}</span>
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] text-blue-300 backdrop-blur-sm">
                High Demand
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
