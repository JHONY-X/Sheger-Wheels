// @ts-check
"use client";

import { newBookingRef, newId } from "../ids.js";
import {
  conflictingBookings,
  isCarAvailable,
  priceBreakdown,
  validateDateRange,
} from "../pricing.js";
import { getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";
import { getCarById } from "./cars.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getBookings() {
  return getSnapshot().bookings;
}

export function getBookingById(id) {
  return getSnapshot().bookings.find((booking) => booking.id === id) ?? null;
}

export function getBookingsForRenter(renterId) {
  return getSnapshot().bookings.filter((booking) => booking.renterId === renterId);
}

export function getBookingsForOwner(ownerId) {
  return getSnapshot().bookings.filter((booking) => booking.ownerId === ownerId);
}

export function getBookingsForCar(carId) {
  return getSnapshot().bookings.filter((booking) => booking.carId === carId);
}

/**
 * Create a booking request. Every guard here is repeated in the UI, and both
 * call sites use this function — there is no second implementation.
 * @param {{ carId: string, startDate: string, endDate: string, chauffeurId?: string|null }} input
 */
export function requestBooking({ carId, startDate, endDate, chauffeurId }) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to request a booking.");
  if (user.status === "suspended") {
    return fail("ACCOUNT_SUSPENDED", "This demo account is suspended.");
  }

  const car = getCarById(carId);
  if (!car) return fail("NOT_FOUND", "That car no longer exists.");
  if (car.status !== "approved" || car.active !== true) {
    return fail("UNAVAILABLE", "This car is not accepting bookings.");
  }
  if (car.ownerId === user.id) {
    return fail("OWN_CAR", "You cannot book your own car.");
  }

  const range = validateDateRange(startDate, endDate);
  if (!range.ok) return fail("INVALID_DATES", range.message);

  if (!isCarAvailable(car, startDate, endDate)) {
    return fail("BLOCKED_DATES", "The owner has blocked one of those dates.");
  }

  const clash = conflictingBookings(
    getSnapshot().bookings,
    car.id,
    startDate,
    endDate,
  );
  if (clash.length > 0) {
    return fail("DATE_CONFLICT", "Those dates are already booked for this car.");
  }

  // Chauffeur check
  const snapshot = getSnapshot();
  const chauffeur = chauffeurId
    ? (snapshot.chauffeurs ?? []).find((c) => c.id === chauffeurId)
    : null;

  const chauffeurPricePerDay = chauffeur?.pricePerDay ?? 0;
  const price = priceBreakdown(car.pricePerDay, startDate, endDate, chauffeurPricePerDay);
  if (!price) return fail("INVALID_DATES", "Choose a valid date range.");

  const now = new Date().toISOString();
  /** @type {import('../types.js').Booking} */
  const booking = {
    id: newId("bk"),
    reference: newBookingRef(),
    carId: car.id,
    renterId: user.id,
    ownerId: car.ownerId,
    startDate,
    endDate,
    days: price.days,
    pricePerDay: car.pricePerDay,
    subtotal: price.subtotal,
    fee: price.fee,
    total: price.total,
    ...(chauffeur
      ? {
          chauffeurId: chauffeur.id,
          chauffeurName: chauffeur.name,
          chauffeurPricePerDay: chauffeur.pricePerDay,
          chauffeurTotal: price.chauffeurTotal,
        }
      : {}),
    paymentStatus: "unpaid",
    status: "requested",
    createdAt: now,
    updatedAt: now,
  };

  const saved = updateCollection(KEYS.bookings, (bookings) => [...bookings, booking]);
  if (!saved) return fail("STORAGE_ERROR", "Could not save the booking.");

  return { ok: true, booking };
}

/**
 * Mock checkout. Never collects credentials and never charges anything.
 * @param {string} bookingId
 */
export function completeMockPayment(bookingId) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to continue.");

  const booking = getBookingById(bookingId);
  if (!booking) return fail("NOT_FOUND", "That booking no longer exists.");
  if (booking.renterId !== user.id) {
    return fail("NOT_YOURS", "Not yours — this booking belongs to another renter.");
  }
  if (booking.paymentStatus === "paid") {
    return fail("ALREADY_PAID", "This booking is already marked paid in the demo.");
  }
  if (!["requested", "confirmed"].includes(booking.status)) {
    return fail("INVALID_STATE", "Payment is not available for this booking.");
  }

  const updated = {
    ...booking,
    paymentStatus: "paid",
    transactionRef: `DEMO-TB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    updatedAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.bookings, (bookings) =>
    bookings.map((item) => (item.id === bookingId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not record the demo payment.");

  return { ok: true, booking: updated };
}

/** True when another active booking already covers those dates. */
export function hasConflict(carId, startDate, endDate, ignoreId) {
  return (
    conflictingBookings(
      getSnapshot().bookings,
      carId,
      startDate,
      endDate,
      ignoreId,
    ).length > 0
  );
}
