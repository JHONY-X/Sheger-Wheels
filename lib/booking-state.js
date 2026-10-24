// @ts-check
"use client";

import { conflictingBookings } from "./pricing.js";
import { getCurrentUser } from "./session.js";
import { KEYS } from "./storage.js";
import { getSnapshot, updateCollection } from "./store.js";

/**
 * The booking lifecycle as data. Adding a transition means editing this table,
 * not hunting for scattered `if (status === ...)` checks.
 *
 * `actor` is who may fire the action when they are party to the booking.
 * @type {Record<string, {
 *   label: string,
 *   from: import('./types.js').BookingStatus[],
 *   actor: import('./types.js').Actor,
 *   to: import('./types.js').BookingStatus,
 *   variant: 'primary'|'secondary'|'destructive',
 *   needsConfirm?: string,
 * }>}
 */
export const ACTIONS = {
  confirm: {
    label: "Approve request",
    from: ["requested"],
    actor: "owner",
    to: "confirmed",
    variant: "primary",
  },
  decline: {
    label: "Decline",
    from: ["requested"],
    actor: "owner",
    to: "declined",
    variant: "secondary",
  },
  cancel: {
    label: "Cancel booking",
    from: ["requested", "confirmed"],
    actor: "either",
    to: "cancelled",
    variant: "destructive",
    needsConfirm: "Cancel this booking request?",
  },
  start: {
    label: "Start rental",
    from: ["confirmed"],
    actor: "owner",
    to: "in_progress",
    variant: "primary",
  },
  complete: {
    label: "Mark returned",
    from: ["in_progress"],
    actor: "owner",
    to: "completed",
    variant: "primary",
  },
  review: {
    label: "Leave a review",
    from: ["completed"],
    actor: "renter",
    to: "reviewed",
    variant: "primary",
  },
  dispute: {
    label: "Raise an issue",
    from: ["in_progress", "completed"],
    actor: "either",
    to: "disputed",
    variant: "secondary",
    needsConfirm: "Open a dispute for this booking?",
  },
  resolve: {
    label: "Resolve dispute",
    from: ["disputed"],
    actor: "admin",
    to: "resolved",
    variant: "primary",
  },
};

const MESSAGES = {
  NOT_SIGNED_IN: "Sign in to manage this booking.",
  ACCOUNT_SUSPENDED: "This demo account is suspended.",
  NOT_FOUND: "That booking no longer exists.",
  UNKNOWN_ACTION: "That action is not part of the booking workflow.",
  NOT_YOURS: "Not yours — this booking belongs to someone else.",
  FORBIDDEN: "Your demo role cannot perform this action.",
  INVALID_STATE: "That action is not allowed from the booking's current status.",
  DATE_CONFLICT: "Another active booking already covers those dates.",
  ALREADY_REVIEWED: "This booking has already been reviewed.",
  STORAGE_ERROR: "Could not save the change. Browser storage may be full or blocked.",
};

/** @param {string} code */
function fail(code) {
  return { ok: false, code, message: MESSAGES[code] ?? "Something went wrong." };
}

/**
 * Single source of truth for "may this user fire this action on this booking".
 * @param {string} action
 * @param {import('./types.js').User} user
 * @param {import('./types.js').Booking} booking
 */
export function actorAllows(action, user, booking) {
  const meta = ACTIONS[action];
  if (!meta || !user || user.status === "suspended") return false;

  switch (meta.actor) {
    case "admin":
      return user.roles.includes("admin");
    case "owner":
      return booking.ownerId === user.id;
    case "renter":
      return booking.renterId === user.id;
    case "either":
      return booking.ownerId === user.id || booking.renterId === user.id;
    default:
      return false;
  }
}

/**
 * Actions to render for this booking. The same rules are enforced again inside
 * transitionBooking — the UI is a convenience, not the guard.
 * @param {import('./types.js').Booking|null|undefined} booking
 * @param {import('./types.js').User|null} user
 */
export function allowedActions(booking, user) {
  if (!booking || !user || user.status === "suspended") return [];

  return Object.keys(ACTIONS).filter(
    (action) =>
      ACTIONS[action].from.includes(booking.status) &&
      actorAllows(action, user, booking),
  );
}

/** @param {import('./types.js').Booking} booking */
function hasConflict(booking) {
  const others = conflictingBookings(
    getSnapshot().bookings,
    booking.carId,
    booking.startDate,
    booking.endDate,
    booking.id,
  );
  return others.length > 0;
}

/**
 * The only place a booking status changes.
 * @param {string} bookingId
 * @param {string} action
 */
export function transitionBooking(bookingId, action) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN");
  if (user.status === "suspended") return fail("ACCOUNT_SUSPENDED");

  const booking = getSnapshot().bookings.find((b) => b.id === bookingId);
  if (!booking) return fail("NOT_FOUND");

  const meta = ACTIONS[action];
  if (!meta) return fail("UNKNOWN_ACTION");

  const mine = actorAllows(action, user, booking);
  if (!mine) {
    return meta.actor === "admin" ? fail("FORBIDDEN") : fail("NOT_YOURS");
  }

  if (!meta.from.includes(booking.status)) return fail("INVALID_STATE");

  if (action === "confirm" && hasConflict(booking)) return fail("DATE_CONFLICT");

  if (
    action === "review" &&
    getSnapshot().reviews.some((review) => review.bookingId === booking.id)
  ) {
    return fail("ALREADY_REVIEWED");
  }

  const updated = {
    ...booking,
    status: meta.to,
    updatedAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.bookings, (bookings) =>
    bookings.map((b) => (b.id === booking.id ? updated : b)),
  );

  if (!saved) return fail("STORAGE_ERROR");

  return { ok: true, booking: updated };
}

/** @param {string} status @returns {string[]} */
export function actionsForStatus(status) {
  return Object.keys(ACTIONS).filter((action) =>
    ACTIONS[action].from.includes(/** @type {any} */ (status)),
  );
}
