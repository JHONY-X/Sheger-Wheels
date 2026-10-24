// @ts-check
import { SEED_BOOKING_IDS, seedBookings } from "./bookings.js";
import { SEED_USER_IDS } from "./users.js";

/** Resolve car/owner from the booking so the review stays consistent. */
function makeReview({ id, bookingId, renterId, rating, comment, ownerReply, createdAt }) {
  const booking = seedBookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error(`Seed booking not found: ${bookingId}`);
  return {
    id,
    bookingId,
    carId: booking.carId,
    renterId,
    ownerId: booking.ownerId,
    rating,
    comment,
    ownerReply: ownerReply ?? "",
    createdAt,
  };
}

/** @type {import('../types.js').Review[]} */
export const seedReviews = [
  makeReview({
    id: "rv_crv_dawit",
    bookingId: SEED_BOOKING_IDS.reviewed,
    renterId: SEED_USER_IDS.dawit,
    rating: 5,
    comment:
      "Car was spotless and Hanna met me at the Sarbet roundabout on time. Boot took two large suitcases without a squeeze.",
    ownerReply:
      "Thank you Dawit — glad the airport run went smoothly. Welcome back any time.",
    createdAt: "2025-11-02T18:20:00.000Z",
  }),
  makeReview({
    id: "rv_crv_marta",
    bookingId: SEED_BOOKING_IDS.reviewedOld,
    renterId: SEED_USER_IDS.marta,
    rating: 4,
    comment:
      "Comfortable for a family trip. Pick-up took a little longer than agreed, otherwise no complaints.",
    ownerReply: "",
    createdAt: "2025-09-14T09:05:00.000Z",
  }),
];
