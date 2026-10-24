import { beforeEach, describe, expect, it } from "vitest";
import { can } from "../lib/permissions.js";
import { getCarById } from "../lib/domain/cars.js";
import { getBookingById } from "../lib/domain/bookings.js";
import { getCurrentUser } from "../lib/session.js";
import { SEED_CAR_IDS } from "../lib/seed/cars.js";
import { SEED_BOOKING_IDS } from "../lib/seed/bookings.js";
import { A, resetApp, signIn } from "./helpers.js";

beforeEach(() => {
  resetApp();
});

describe("can()", () => {
  it("lets an owner edit only their own car", () => {
    const car = getCarById(SEED_CAR_IDS.vitz);

    signIn(A.selam);
    expect(can(getCurrentUser(), "editCar", car)).toBe(true);

    signIn(A.hanna);
    expect(can(getCurrentUser(), "editCar", car)).toBe(false);
  });

  it("lets an admin moderate but not edit an owner's car", () => {
    const car = getCarById(SEED_CAR_IDS.vitz);
    signIn(A.admin);
    expect(can(getCurrentUser(), "moderateCar", car)).toBe(true);
    expect(can(getCurrentUser(), "editCar", car)).toBe(false);
  });

  it("scopes booking visibility to the parties and admins", () => {
    const booking = getBookingById(SEED_BOOKING_IDS.requested);

    signIn(A.dawit);
    expect(can(getCurrentUser(), "viewBooking", booking)).toBe(true);

    signIn(A.marta);
    expect(can(getCurrentUser(), "viewBooking", booking)).toBe(false);

    signIn(A.admin);
    expect(can(getCurrentUser(), "viewBooking", booking)).toBe(true);
  });

  it("mirrors the state machine for lifecycle actions", () => {
    const booking = getBookingById(SEED_BOOKING_IDS.requested);

    signIn(A.selam);
    expect(can(getCurrentUser(), "confirm", booking)).toBe(true);

    signIn(A.dawit);
    expect(can(getCurrentUser(), "confirm", booking)).toBe(false);
    expect(can(getCurrentUser(), "cancel", booking)).toBe(true);
  });

  it("denies everything to a suspended account", () => {
    signIn(A.yonas);
    const booking = getBookingById(SEED_BOOKING_IDS.confirmed);
    expect(can(getCurrentUser(), "viewBooking", booking)).toBe(false);
  });

  it("requires an approved, active car for a new booking", () => {
    signIn(A.dawit);
    expect(can(getCurrentUser(), "requestBooking", getCarById(SEED_CAR_IDS.vitz))).toBe(true);
    expect(can(getCurrentUser(), "requestBooking", getCarById(SEED_CAR_IDS.sportage))).toBe(false);
    expect(can(getCurrentUser(), "requestBooking", getCarById(SEED_CAR_IDS.sunny))).toBe(false);
  });
});
