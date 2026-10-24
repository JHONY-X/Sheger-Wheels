import { describe, expect, it } from "vitest";
import {
  conflictingBookings,
  isCarAvailable,
  priceBreakdown,
  validateDateRange,
} from "../lib/pricing.js";
import { addDaysISO, isISODate, rentalDays, rangesOverlap } from "../lib/dates.js";

describe("rentalDays", () => {
  it("counts both pick-up and return day", () => {
    expect(rentalDays("2026-10-24", "2026-10-26")).toBe(3);
    expect(rentalDays("2026-10-24", "2026-10-24")).toBe(1);
  });

  it("returns 0 for invalid input", () => {
    expect(rentalDays("nope", "2026-10-26")).toBe(0);
    expect(rentalDays("2026-02-31", "2026-03-02")).toBe(0);
  });
});

describe("rangesOverlap", () => {
  it("treats a shared boundary day as a conflict", () => {
    expect(rangesOverlap("2026-10-24", "2026-10-26", "2026-10-26", "2026-10-28")).toBe(true);
  });

  it("returns false for back-to-back ranges", () => {
    expect(rangesOverlap("2026-10-24", "2026-10-25", "2026-10-26", "2026-10-28")).toBe(false);
  });
});

describe("priceBreakdown", () => {
  it("charges the nightly rate for every day plus a 10% fee", () => {
    expect(priceBreakdown(2400, "2026-10-24", "2026-10-26")).toEqual({
      days: 3,
      subtotal: 7200,
      fee: 720,
      total: 7920,
    });
  });

  it("rounds the fee to whole Birr", () => {
    const price = priceBreakdown(1850, "2026-10-24", "2026-10-26");
    expect(price.subtotal).toBe(5550);
    expect(price.fee).toBe(555);
    expect(Number.isInteger(price.total)).toBe(true);
  });

  it("rejects a zero or negative rate", () => {
    expect(priceBreakdown(0, "2026-10-24", "2026-10-26")).toBeNull();
    expect(priceBreakdown(-100, "2026-10-24", "2026-10-26")).toBeNull();
  });
});

describe("validateDateRange", () => {
  const today = "2026-10-21";

  it("accepts a valid forward range", () => {
    expect(validateDateRange("2026-10-24", "2026-10-26", today)).toEqual({ ok: true });
  });

  it("rejects a past pick-up", () => {
    const result = validateDateRange("2026-10-20", "2026-10-22", today);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/past/i);
  });

  it("rejects a return before pick-up", () => {
    expect(validateDateRange("2026-10-26", "2026-10-24", today).ok).toBe(false);
  });

  it("rejects malformed dates and impossible calendar days", () => {
    expect(validateDateRange("24/10/2026", "2026-10-26", today).ok).toBe(false);
    expect(validateDateRange("2026-02-31", "2026-03-02", today).ok).toBe(false);
  });

  it("caps a booking at 60 days", () => {
    expect(validateDateRange("2026-10-24", "2027-01-24", today).ok).toBe(false);
  });
});

describe("availability", () => {
  const car = { unavailableDates: ["2026-11-05", "2026-11-06"] };

  it("blocks a range that touches a blocked day", () => {
    expect(isCarAvailable(car, "2026-11-04", "2026-11-05")).toBe(false);
  });

  it("allows a range around blocked days", () => {
    expect(isCarAvailable(car, "2026-11-01", "2026-11-03")).toBe(true);
  });

  it("only counts active bookings as conflicts", () => {
    const bookings = [
      { id: "a", carId: "c1", startDate: "2026-10-24", endDate: "2026-10-26", status: "cancelled" },
      { id: "b", carId: "c1", startDate: "2026-11-01", endDate: "2026-11-03", status: "confirmed" },
    ];
    expect(conflictingBookings(bookings, "c1", "2026-10-24", "2026-10-26")).toHaveLength(0);
    expect(conflictingBookings(bookings, "c1", "2026-11-02", "2026-11-04")).toHaveLength(1);
  });
});

describe("date helpers", () => {
  it("only accepts real ISO dates", () => {
    expect(isISODate("2026-10-21")).toBe(true);
    expect(isISODate("2026-13-01")).toBe(false);
    expect(isISODate("21-10-2026")).toBe(false);
  });

  it("shifts across a month boundary", () => {
    expect(addDaysISO("2026-10-30", 3)).toBe("2026-11-02");
  });
});
