// @ts-check
import { addDaysISO, todayISO } from "../dates.js";
import { priceBreakdown } from "../pricing.js";
import { SEED_CAR_IDS, seedCars } from "./cars.js";
import { SEED_USER_IDS } from "./users.js";

const TODAY = todayISO();

/** Stable human-facing reference derived from the seed id. */
function refFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return `SW-${hash.toString(16).toUpperCase().padStart(6, "0").slice(-6)}`;
}

/** Build a booking from day offsets so the demo always has upcoming and past trips. */
function makeBooking({
  id,
  carId,
  renterId,
  from,
  to,
  status,
  paymentStatus,
  transactionRef,
}) {
  const car = seedCars.find((c) => c.id === carId);
  if (!car) throw new Error(`Seed car not found: ${carId}`);

  const startDate = addDaysISO(TODAY, from);
  const endDate = addDaysISO(TODAY, to);
  const price = priceBreakdown(car.pricePerDay, startDate, endDate);

  return {
    id,
    reference: refFor(id),
    carId,
    renterId,
    ownerId: car.ownerId,
    startDate,
    endDate,
    days: price.days,
    pricePerDay: car.pricePerDay,
    subtotal: price.subtotal,
    fee: price.fee,
    total: price.total,
    paymentStatus,
    ...(transactionRef ? { transactionRef } : {}),
    status,
    createdAt: `${addDaysISO(TODAY, from - 4)}T09:15:00.000Z`,
    updatedAt: `${addDaysISO(TODAY, from - 2)}T11:30:00.000Z`,
  };
}

export const SEED_BOOKING_IDS = {
  requested: "bk_requested",
  confirmed: "bk_confirmed",
  inProgress: "bk_inprogress",
  completed: "bk_completed",
  reviewed: "bk_reviewed",
  reviewedOld: "bk_reviewed_old",
  declined: "bk_declined",
  cancelled: "bk_cancelled",
  disputed: "bk_disputed",
  resolved: "bk_resolved",
};

/** One booking per lifecycle status, so every view has data on first load. */
/** @type {import('../types.js').Booking[]} */
export const seedBookings = [
  makeBooking({
    id: SEED_BOOKING_IDS.requested,
    carId: SEED_CAR_IDS.vitz,
    renterId: SEED_USER_IDS.dawit,
    from: 7,
    to: 9,
    status: "requested",
    paymentStatus: "unpaid",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.confirmed,
    carId: SEED_CAR_IDS.corolla,
    renterId: SEED_USER_IDS.dawit,
    from: 14,
    to: 16,
    status: "confirmed",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-4471-9021",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.inProgress,
    carId: SEED_CAR_IDS.i10,
    renterId: SEED_USER_IDS.marta,
    from: -1,
    to: 1,
    status: "in_progress",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-5520-1187",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.completed,
    carId: SEED_CAR_IDS.dzire,
    renterId: SEED_USER_IDS.dawit,
    from: -20,
    to: -18,
    status: "completed",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-3311-7745",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.reviewed,
    carId: SEED_CAR_IDS.crv,
    renterId: SEED_USER_IDS.dawit,
    from: -45,
    to: -42,
    status: "reviewed",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-2204-6690",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.reviewedOld,
    carId: SEED_CAR_IDS.crv,
    renterId: SEED_USER_IDS.marta,
    from: -80,
    to: -78,
    status: "reviewed",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-1188-3342",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.declined,
    carId: SEED_CAR_IDS.vitz,
    renterId: SEED_USER_IDS.marta,
    from: 20,
    to: 22,
    status: "declined",
    paymentStatus: "unpaid",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.cancelled,
    carId: SEED_CAR_IDS.i10,
    renterId: SEED_USER_IDS.dawit,
    from: -10,
    to: -8,
    status: "cancelled",
    paymentStatus: "refunded",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.disputed,
    carId: SEED_CAR_IDS.landcruiser,
    renterId: SEED_USER_IDS.marta,
    from: -30,
    to: -27,
    status: "disputed",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-9032-5518",
  }),
  makeBooking({
    id: SEED_BOOKING_IDS.resolved,
    carId: SEED_CAR_IDS.vitz,
    renterId: SEED_USER_IDS.dawit,
    from: -60,
    to: -58,
    status: "resolved",
    paymentStatus: "paid",
    transactionRef: "DEMO-TB-7720-4419",
  }),
];
