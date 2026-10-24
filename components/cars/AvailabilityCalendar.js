"use client";

import { useMemo, useState } from "react";

import { addDaysISO } from "@/lib/dates";
import { isActiveBookingStatus } from "@/lib/pricing";
import { useTodayISO } from "@/lib/use-today";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(date) {
  return date.slice(0, 7);
}

function shiftMonth(key, delta) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function daysInMonth(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function firstWeekday(key) {
  const [year, month] = key.split("-").map(Number);
  /* Monday-first index: 0 = Monday … 6 = Sunday. */
  return (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
}

/** Expand a booking or a blocked range into individual ISO dates. */
function expandRange(start, end) {
  const dates = [];
  let cursor = start;
  let guard = 0;

  while (cursor <= end && guard < 400) {
    dates.push(cursor);
    cursor = addDaysISO(cursor, 1);
    guard += 1;
  }
  return dates;
}

/**
 * Read-only month calendar. Blocked and booked days are marked; choosing the
 * dates themselves happens in the booking panel, which keeps this component
 * from owning form state it does not need.
 */
export function AvailabilityCalendar({ car, bookings }) {
  const today = useTodayISO();
  const [month, setMonth] = useState(null);
  const activeMonth = month ?? (today ? monthKey(today) : null);

  const booked = useMemo(() => {
    const set = new Set();

    for (const booking of bookings) {
      if (!isActiveBookingStatus(booking.status)) continue;
      if (booking.carId !== car.id) continue;
      for (const date of expandRange(booking.startDate, booking.endDate)) {
        set.add(date);
      }
    }

    for (const date of car.unavailableDates ?? []) set.add(date);

    return set;
  }, [bookings, car.id, car.unavailableDates]);

  /* Prerender-safe: no clock, no calendar. */
  if (!activeMonth) return null;

  const total = daysInMonth(activeMonth);
  const offset = firstWeekday(activeMonth);
  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];

  const canGoBack = activeMonth > monthKey(today);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{monthLabel(activeMonth)}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((value) => shiftMonth(value ?? activeMonth, -1))}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="flex size-11 items-center justify-center rounded-btn border border-line bg-white text-ink disabled:opacity-40"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2">
              <path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMonth((value) => shiftMonth(value ?? activeMonth, 1))}
            aria-label="Next month"
            className="flex size-11 items-center justify-center rounded-btn border border-line bg-white text-ink"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2">
              <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="pb-1 text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
            {day.slice(0, 1)}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} aria-hidden />;

          const iso = `${activeMonth}-${String(day).padStart(2, "0")}`;
          const isPast = iso < today;
          const isToday = iso === today;
          const isBooked = booked.has(iso);

          return (
            <span
              key={iso}
              aria-label={`${iso}${isBooked ? " — unavailable" : isPast ? " — past" : " — available"}`}
              className={[
                "flex aspect-square items-center justify-center rounded-[7px] text-sm",
                isBooked
                  ? "bg-danger-tint text-danger line-through"
                  : isPast
                    ? "bg-muted-tint/60 text-muted"
                    : "bg-sand/70 text-ink",
                isToday ? "ring-1 ring-forest" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </span>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] bg-sand/70 ring-1 ring-line" />
          Available
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] bg-danger-tint ring-1 ring-danger/20" />
          Booked or blocked
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] ring-1 ring-forest" />
          Today
        </li>
      </ul>
    </div>
  );
}
