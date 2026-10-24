// @ts-check
"use client";

import { newId } from "../ids.js";
import { hasRole, getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";
import { transitionBooking } from "../booking-state.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getDisputes() {
  return getSnapshot().disputes;
}

export function getDisputeById(id) {
  return getSnapshot().disputes.find((dispute) => dispute.id === id) ?? null;
}

/** Disputes on bookings the user is party to. Admins see everything. */
export function getDisputesForUser(user) {
  if (!user) return [];
  const disputes = getSnapshot().disputes;
  if (hasRole(user, "admin")) return disputes;

  return disputes.filter((dispute) => {
    const booking = getSnapshot().bookings.find((b) => b.id === dispute.bookingId);
    return booking && (booking.renterId === user.id || booking.ownerId === user.id);
  });
}

/**
 * Open a dispute on a booking that is underway or finished.
 * @param {{ bookingId: string, reason: string, description: string }} input
 */
export function openDispute({ bookingId, reason, description }) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to raise an issue.");

  const booking = getSnapshot().bookings.find((b) => b.id === bookingId);
  if (!booking) return fail("NOT_FOUND", "That booking no longer exists.");
  if (booking.renterId !== user.id && booking.ownerId !== user.id) {
    return fail("NOT_YOURS", "Not yours — you are not party to this booking.");
  }

  const subject = String(reason ?? "").trim();
  const text = String(description ?? "").trim();
  if (!subject) return fail("REASON_REQUIRED", "Choose a reason.");
  if (text.length < 15) {
    return fail("DESCRIPTION_TOO_SHORT", "Describe the issue in at least 15 characters.");
  }

  const moved = transitionBooking(bookingId, "dispute");
  if (!moved.ok) return moved;

  /** @type {import('../types.js').Dispute} */
  const dispute = {
    id: newId("dp"),
    bookingId,
    openedBy: user.id,
    reason: subject,
    description: text,
    status: "open",
    resolutionNotes: "",
    createdAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.disputes, (disputes) => [...disputes, dispute]);
  if (!saved) return fail("STORAGE_ERROR", "Could not save the dispute.");

  return { ok: true, dispute };
}

/**
 * Admin resolution. Records the note, the admin and the timestamp, and moves
 * the booking to its terminal `resolved` state.
 * @param {string} disputeId
 * @param {string} notes
 */
export function resolveDispute(disputeId, notes) {
  const admin = getCurrentUser();
  if (!admin) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (!hasRole(admin, "admin")) return fail("FORBIDDEN", "Admin only.");

  const dispute = getDisputeById(disputeId);
  if (!dispute) return fail("NOT_FOUND", "That dispute does not exist.");
  if (dispute.status === "resolved") {
    return fail("ALREADY_RESOLVED", "This dispute is already resolved.");
  }

  const text = String(notes ?? "").trim();
  if (text.length < 5) {
    return fail("NOTES_REQUIRED", "Record what was agreed before resolving.");
  }

  const moved = transitionBooking(dispute.bookingId, "resolve");
  if (!moved.ok) return moved;

  const updated = {
    ...dispute,
    status: "resolved",
    resolutionNotes: text,
    resolvedBy: admin.id,
    resolvedAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.disputes, (disputes) =>
    disputes.map((item) => (item.id === disputeId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save the resolution.");

  return { ok: true, dispute: updated };
}
