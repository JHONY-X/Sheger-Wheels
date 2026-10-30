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
    <section id="for-owners" className="mx-auto w-full max-w-[1280px] px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1.3fr] lg:items-center">
        {/* Left Column: Copy & Checklist */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            For Vehicle Owners
          </p>

          <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Your car <span className="text-forest">earns more</span>
            <br />
            than it costs to park.
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            List your vehicle, get booking requests, and track your earnings — all from your dashboard. Verified renters and full support included.
          </p>

          <ul className="mt-5 space-y-3">
            {[
              "Add your vehicle in minutes",
              "Set your own pricing & calendar",
              "Track bookings & real-time payouts",
              "Full 24/7 support & verified renters",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-ink/90">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                  <svg viewBox="0 0 20 20" fill="none" className="size-3 stroke-current stroke-[2.5]">
                    <path d="m5 10 3.5 3.5L15 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center gap-2 rounded-btn bg-forest px-5 text-sm font-medium text-white transition-colors hover:bg-forest-600"
            >
              <span>List Your Car</span>
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-white stroke-2">
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
            </Link>

            <Link
              href="/owner"
              className="inline-flex h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              <span>Owner Dashboard</span>
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-current stroke-2">
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Column: Earnings Calculator */}
        <div className="rounded-2xl border border-line bg-sand p-5 sm:p-6 shadow-card">
          <h3 className="text-sm font-semibold text-ink">
            Earnings Calculator
          </h3>

          <div className="mt-4 space-y-4">
            {/* Vehicle Type Dropdown */}
            <div>
              <label className="block text-xs font-medium text-muted">
                Vehicle type
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="mt-1.5 w-full rounded-btn border border-line px-3 py-2.5 text-sm font-medium text-ink focus:border-forest focus:outline-none cursor-pointer"
              >
                {Object.keys(VEHICLE_RATES).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rental Days Selector */}
            <div>
              <label className="block text-xs font-medium text-muted">
                Rental days per month
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-btn border border-line px-3 py-2.5 text-sm font-medium text-ink focus:border-forest focus:outline-none cursor-pointer"
              >
                {[5, 10, 15, 20, 25, 30].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </div>

            {/* Output */}
            <div className="rounded-xl border border-forest/15 bg-forest/5 p-4">
              <p className="text-xs text-muted">
                Est. monthly earnings
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-forest" data-numeric>
                {formatETB(netEarnings)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Actual earnings may vary based on demand, season and vehicle condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
