// @ts-check
"use client";

import { newId } from "../ids.js";
import { getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";
import { transitionBooking } from "../booking-state.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getReviews() {
  return getSnapshot().reviews;
}

export function getReviewsForCar(carId) {
  return getSnapshot().reviews.filter((review) => review.carId === carId);
}

export function getReviewsForOwner(ownerId) {
  return getSnapshot().reviews.filter((review) => review.ownerId === ownerId);
}

export function getReviewForBooking(bookingId) {
  return getSnapshot().reviews.find((review) => review.bookingId === bookingId) ?? null;
}

/**
 * A renter may review once, only after the trip is marked completed.
 * The status change and the review record are written together here.
 * @param {{ bookingId: string, rating: number, comment: string }} input
 */
export function createReview({ bookingId, rating, comment }) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to leave a review.");

  const booking = getSnapshot().bookings.find((b) => b.id === bookingId);
  if (!booking) return fail("NOT_FOUND", "That booking no longer exists.");
  if (booking.renterId !== user.id) {
    return fail("NOT_YOURS", "Not yours — you can only review your own trips.");
  }
  if (booking.status !== "completed") {
    return fail("INVALID_STATE", "You can review a trip once it is completed.");
  }
  if (getReviewForBooking(bookingId)) {
    return fail("ALREADY_REVIEWED", "This booking has already been reviewed.");
  }

  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return fail("INVALID_RATING", "Choose a rating from 1 to 5.");
  }
  const text = String(comment ?? "").trim();
  if (text.length < 10) {
    return fail("COMMENT_TOO_SHORT", "Write at least 10 characters.");
  }

  // Gate the lifecycle first: this is what actually enforces the rule.
  const moved = transitionBooking(bookingId, "review");
  if (!moved.ok) return moved;

  /** @type {import('../types.js').Review} */
  const review = {
    id: newId("rv"),
    bookingId,
    carId: booking.carId,
    renterId: user.id,
    ownerId: booking.ownerId,
    rating: score,
    comment: text,
    ownerReply: "",
    createdAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.reviews, (reviews) => [...reviews, review]);
  if (!saved) return fail("STORAGE_ERROR", "Could not save the review.");

  return { ok: true, review };
}

/**
 * Owner reply. One reply per review, and only for a car the owner actually owns.
 * @param {string} reviewId
 * @param {string} reply
 */
export function replyToReview(reviewId, reply) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to reply.");
  if (user.status === "suspended") {
    return fail("ACCOUNT_SUSPENDED", "This demo account is suspended.");
  }

  const review = getSnapshot().reviews.find((item) => item.id === reviewId);
  if (!review) return fail("NOT_FOUND", "That review no longer exists.");
  if (review.ownerId !== user.id) {
    return fail("NOT_YOURS", "Not yours — this review is for another owner's car.");
  }

  const text = String(reply ?? "").trim();
  if (review.ownerReply) {
    return fail("ALREADY_REPLIED", "This review already has a reply.");
  }
  if (text.length < 5) return fail("REPLY_TOO_SHORT", "Write at least 5 characters.");

  const updated = { ...review, ownerReply: text };
  const saved = updateCollection(KEYS.reviews, (reviews) =>
    reviews.map((item) => (item.id === reviewId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save the reply.");

  return { ok: true, review: updated };
}
