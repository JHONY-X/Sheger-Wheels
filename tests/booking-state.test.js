import { beforeEach, describe, expect, it } from "vitest";
import {
  allowedActions,
  transitionBooking,
} from "../lib/booking-state.js";
import {
  getBookingById,
  getBookings,
  requestBooking,
} from "../lib/domain/bookings.js";
import { createReview, getReviewForBooking, replyToReview } from "../lib/domain/reviews.js";
import { resolveDispute } from "../lib/domain/disputes.js";
import { getCurrentUser } from "../lib/session.js";
import { KEYS, writeStorage } from "../lib/storage.js";
import { refresh } from "../lib/store.js";
import { addDaysISO, todayISO } from "../lib/dates.js";
import { SEED_BOOKING_IDS } from "../lib/seed/bookings.js";
import { SEED_CAR_IDS } from "../lib/seed/cars.js";
import { A, resetApp, signIn } from "./helpers.js";

const day = (offset) => addDaysISO(todayISO(), offset);

beforeEach(() => {
  resetApp();
});

describe("negative test 1 — signed-out write", () => {
  it("refuses the booking and writes nothing", () => {
    const before = getBookings().length;
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(40),
      endDate: day(42),
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_SIGNED_IN");
    expect(getBookings()).toHaveLength(before);
  });
});

describe("negative test 2 — cross-user ownership", () => {
  it("refuses a renter cancelling someone else's booking", () => {
    signIn(A.dawit);
    const created = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(40),
      endDate: day(42),
    });
    expect(created.ok).toBe(true);

    signIn(A.marta);
    const result = transitionBooking(created.booking.id, "cancel");

    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_YOURS");
    expect(getBookingById(created.booking.id).status).toBe("requested");
  });

  it("refuses an owner acting on another owner's booking", () => {
    signIn(A.hanna);
    const result = transitionBooking(SEED_BOOKING_IDS.requested, "confirm");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_YOURS");
    expect(getBookingById(SEED_BOOKING_IDS.requested).status).toBe("requested");
  });
});

describe("negative test 3 — unsafe return URL", () => {
  it("is covered in session.test.js", () => {
    expect(true).toBe(true);
  });
});

describe("booking lifecycle", () => {
  it("moves requested → confirmed → cancelled with the right actors", () => {
    signIn(A.dawit);
    const created = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(40),
      endDate: day(42),
    });

    signIn(A.selam);
    const confirmed = transitionBooking(created.booking.id, "confirm");
    expect(confirmed.ok).toBe(true);
    expect(confirmed.booking.status).toBe("confirmed");
    expect(confirmed.booking.paymentStatus).toBe("unpaid");

    signIn(A.dawit);
    const cancelled = transitionBooking(created.booking.id, "cancel");
    expect(cancelled.ok).toBe(true);
    expect(cancelled.booking.status).toBe("cancelled");
  });

  it("refuses an invalid transition from a terminal status", () => {
    signIn(A.dawit);
    const result = transitionBooking(SEED_BOOKING_IDS.reviewed, "cancel");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("INVALID_STATE");
  });

  it("blocks a suspended account", () => {
    signIn(A.yonas);
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(50),
      endDate: day(52),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("ACCOUNT_SUSPENDED");
  });

  it("blocks booking your own car", () => {
    signIn(A.selam);
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(50),
      endDate: day(52),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("OWN_CAR");
  });

  it("blocks a range that overlaps an active booking", () => {
    signIn(A.dawit);
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(8),
      endDate: day(10),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("DATE_CONFLICT");
  });

  it("refuses to confirm when another active booking already holds the dates", () => {
    signIn(A.dawit);
    const created = requestBooking({
      carId: SEED_CAR_IDS.dzire,
      startDate: day(40),
      endDate: day(42),
    });
    expect(created.ok).toBe(true);

    // Simulate a second tab confirming an overlapping booking at the same time.
    // Writing straight to storage is the only way to reach this race in a test.
    writeStorage(KEYS.bookings, [
      ...getBookings(),
      {
        ...created.booking,
        id: "bk_racing_tab",
        reference: "SW-RACE01",
        startDate: day(41),
        endDate: day(43),
        status: "confirmed",
      },
    ]);
    refresh();

    signIn(A.selam);
    const result = transitionBooking(created.booking.id, "confirm");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("DATE_CONFLICT");
    expect(getBookingById(created.booking.id).status).toBe("requested");
  });

  it("exposes only the actions the actor may perform", () => {
    signIn(A.selam);
    const asOwner = allowedActions(getBookingById(SEED_BOOKING_IDS.requested), getCurrentUser());
    expect(asOwner).toEqual(expect.arrayContaining(["confirm", "decline"]));
    expect(asOwner).not.toContain("review");

    signIn(A.marta);
    const asStranger = allowedActions(getBookingById(SEED_BOOKING_IDS.requested), getCurrentUser());
    expect(asStranger).toEqual([]);
  });

  it("lets an admin resolve a disputed booking", () => {
    signIn(A.admin);
    const result = resolveDispute("dp_open_landcruiser", "Owner refunded the tyre replacement.");
    expect(result.ok).toBe(true);
    expect(result.dispute.status).toBe("resolved");
    expect(result.dispute.resolvedBy).toBe(A.admin);
    expect(getBookingById(SEED_BOOKING_IDS.disputed).status).toBe("resolved");
  });

  it("refuses a non-admin resolving a dispute", () => {
    signIn(A.marta);
    const result = resolveDispute("dp_open_landcruiser", "Not allowed.");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("FORBIDDEN");
  });
});

describe("reviews", () => {
  it("allows one review, only after completion, and closes the lifecycle", () => {
    signIn(A.dawit);
    const result = createReview({
      bookingId: SEED_BOOKING_IDS.completed,
      rating: 5,
      comment: "Spotless car and a smooth handover in Kazanchis.",
    });

    expect(result.ok).toBe(true);
    expect(getBookingById(SEED_BOOKING_IDS.completed).status).toBe("reviewed");

    const second = createReview({
      bookingId: SEED_BOOKING_IDS.completed,
      rating: 4,
      comment: "Trying to review twice should fail.",
    });
    expect(second.ok).toBe(false);
  });

  it("refuses reviewing a trip that is still running", () => {
    signIn(A.marta);
    const result = createReview({
      bookingId: SEED_BOOKING_IDS.inProgress,
      rating: 5,
      comment: "Cannot review before the trip ends.",
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("INVALID_STATE");
  });

  it("refuses reviewing someone else's trip", () => {
    signIn(A.marta);
    const result = createReview({
      bookingId: SEED_BOOKING_IDS.completed,
      rating: 5,
      comment: "Not my booking, so this must be refused.",
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_YOURS");
  });
});

describe("owner review replies", () => {
  it("lets the owner of the car reply once", () => {
    signIn(A.hanna);
    const result = replyToReview(
      "rv_crv_marta",
      "Thanks Marta — we fixed the handover timing.",
    );

    expect(result.ok).toBe(true);
    expect(getReviewForBooking(SEED_BOOKING_IDS.reviewedOld).ownerReply).toContain(
      "Thanks Marta",
    );

    const second = replyToReview("rv_crv_marta", "A second reply must be refused.");
    expect(second.ok).toBe(false);
    expect(second.code).toBe("ALREADY_REPLIED");
  });

  it("refuses a reply from someone who does not own the car", () => {
    signIn(A.dawit);
    const result = replyToReview("rv_crv_marta", "Not my car, not my reply.");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_YOURS");
  });

  it("refuses a reply that is too short", () => {
    signIn(A.hanna);
    const result = replyToReview("rv_crv_marta", "ok");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("REPLY_TOO_SHORT");
  });

  it("refuses a reply when signed out", () => {
    const result = replyToReview("rv_crv_marta", "Sign in first.");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_SIGNED_IN");
  });
});
