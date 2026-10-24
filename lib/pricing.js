// @ts-check

import { isISODate, rangesOverlap, rentalDays, todayISO } from "./dates.js";

/** Platform service fee. One constant, used by the form and the guard. */
export const FEE_RATE = 0.1;

/** Statuses that hold a car's dates. */
export const ACTIVE_BOOKING_STATUSES = ["requested", "confirmed", "in_progress"];

/** @param {string} status */
export function isActiveBookingStatus(status) {
  return ACTIVE_BOOKING_STATUSES.includes(status);
}

/**
 * @param {number} pricePerDay
 * @param {string} start
 * @param {string} end
 * @returns {{ days: number, subtotal: number, fee: number, total: number }|null}
 */
export function priceBreakdown(pricePerDay, start, end) {
  const days = rentalDays(start, end);
  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0 || days < 1) return null;

  const subtotal = Math.round(pricePerDay * days);
  const fee = Math.round(subtotal * FEE_RATE);
  return { days, subtotal, fee, total: subtotal + fee };
}

/**
 * Owner-blocked dates. Availability is checked independently of bookings so
 * an owner can block a day without a booking existing.
 * @param {{ unavailableDates?: string[] }} car
 */
export function isCarAvailable(car, start, end) {
  const blocked = car?.unavailableDates ?? [];
  return !blocked.some((date) => date >= start && date <= end);
}

/**
 * Existing bookings that would collide with a proposed range.
 * @param {import('./types.js').Booking[]} bookings
 */
export function conflictingBookings(bookings, carId, start, end, ignoreId) {
  return bookings.filter(
    (b) =>
      b.carId === carId &&
      b.id !== ignoreId &&
      isActiveBookingStatus(b.status) &&
      rangesOverlap(b.startDate, b.endDate, start, end),
  );
}

/**
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateDateRange(start, end, today = todayISO()) {
  if (!isISODate(start) || !isISODate(end)) {
    return { ok: false, message: "Choose a valid pick-up and return date." };
  }
  if (end < start) {
    return { ok: false, message: "The return date must be on or after pick-up." };
  }
  if (start < today) {
    return { ok: false, message: "Pick-up cannot be in the past." };
  }
  if (rentalDays(start, end) > 60) {
    return { ok: false, message: "Bookings are limited to 60 days." };
  }
  return { ok: true };
}
