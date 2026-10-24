// @ts-check
import { SEED_BOOKING_IDS } from "./bookings.js";
import { SEED_USER_IDS } from "./users.js";

/** @type {import('../types.js').Dispute[]} */
export const seedDisputes = [
  {
    id: "dp_open_landcruiser",
    bookingId: SEED_BOOKING_IDS.disputed,
    openedBy: SEED_USER_IDS.marta,
    reason: "Vehicle condition",
    description:
      "The rear tyre was below the legal tread depth and the spare was flat. I had to arrange a replacement before leaving Gerji.",
    status: "open",
    resolutionNotes: "",
    createdAt: "2025-10-28T07:40:00.000Z",
  },
  {
    id: "dp_resolved_vitz",
    bookingId: SEED_BOOKING_IDS.resolved,
    openedBy: SEED_USER_IDS.dawit,
    reason: "Refund",
    description:
      "Returned the car a day early because of a family emergency. Requesting a partial refund for the unused day.",
    status: "resolved",
    resolutionNotes:
      "Owner agreed to refund one day. The demo booking is marked resolved; no real money moved.",
    resolvedBy: SEED_USER_IDS.admin,
    createdAt: "2025-09-01T12:10:00.000Z",
    resolvedAt: "2025-09-03T09:25:00.000Z",
  },
];
