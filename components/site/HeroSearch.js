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

    const search = params.toString();
    router.push(search ? `/cars?${search}` : "/cars");
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Find a car"
      className="premium-search rounded-card border border-line bg-white p-4 shadow-float sm:p-5"
    >
      <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-end">
        <Select
          label="Neighbourhood"
          value={place}
          onChange={(event) => setPlace(event.target.value)}
        >
          <option value="">Anywhere in Addis</option>
          {NEIGHBOURHOOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

        <Input
          label="Pick-up"
          type="date"
          min={today || undefined}
          value={from}
          onChange={(event) => {
            const value = event.target.value;
            setFrom(value);
            if (to && value && to < value) setTo("");
          }}
        />

        <Input
          label="Return"
          type="date"
          min={from || today || undefined}
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />

        <Button type="submit" size="md" className="whitespace-nowrap">
          Search cars
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-muted">
        Prices are per day in ETB. Dates are checked against real seeded
        availability.
      </p>
    </form>
  );
}
