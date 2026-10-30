"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input, Select } from "@/components/ui";
import { NEIGHBOURHOOD_OPTIONS } from "@/lib/cars-query";
import { useTodayISO } from "@/lib/use-today";

/**
 * Hero search. It only builds a URL — the catalogue owns filtering, so the
 * result is shareable and the back button behaves.
 */
export function HeroSearch() {
  const router = useRouter();
  const today = useTodayISO();

  const [place, setPlace] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vehicleClass, setVehicleClass] = useState("all");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (from && to && to < from) {
      setError("The return date must be on or after pick-up.");
      return;
    }

    const params = new URLSearchParams();
    if (place) params.set("neighbourhood", place);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (vehicleClass && vehicleClass !== "all") params.set("q", vehicleClass);

    const search = params.toString();
    router.push(search ? `/cars?${search}` : "/cars");
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        aria-label="Find a car"
        className="premium-search rounded-2xl border border-line/80 bg-[#161a22]/95 p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.1fr_1.1fr_1.1fr_auto] gap-3 items-center">
          {/* Location field */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand/50 border border-line/40 hover:border-blue-500/50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 stroke-blue-400 stroke-2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                Pick-up Location
              </span>
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#161a22] text-white">Addis Ababa (All)</option>
                {NEIGHBOURHOOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#161a22] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pick-up Date */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand/50 border border-line/40 hover:border-blue-500/50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 stroke-blue-400 stroke-2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                Pick-up Date
              </span>
              <input
                type="date"
                min={today || undefined}
                value={from}
                onChange={(e) => {
                  const val = e.target.value;
                  setFrom(val);
                  if (to && val && to < val) setTo("");
                }}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand/50 border border-line/40 hover:border-blue-500/50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 stroke-blue-400 stroke-2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                Return Date
              </span>
              <input
                type="date"
                min={from || today || undefined}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Vehicle Class */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand/50 border border-line/40 hover:border-blue-500/50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 stroke-blue-400 stroke-2">
              <path d="M5 17h14M5 17a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2M5 17l-2 3M19 17l2 3" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                Vehicle Class
              </span>
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#161a22] text-white">All Classes</option>
                <option value="Mercedes" className="bg-[#161a22] text-white">Executive Sedans</option>
                <option value="Toyota" className="bg-[#161a22] text-white">Luxury SUVs</option>
                <option value="BYD" className="bg-[#161a22] text-white">Electric & Hybrid</option>
              </select>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(37,99,235,0.6)] cursor-pointer"
          >
            <span>Find Your Car</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-white stroke-2">
              <path d="M4 10h12M12 6l4 4-4 4" />
            </svg>
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-2.5 text-xs text-danger">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
