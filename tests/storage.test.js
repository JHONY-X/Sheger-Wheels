import { beforeEach, describe, expect, it } from "vitest";
import {
  getStorageReport,
  initializeDemoData,
  KEYS,
  readStorage,
  resetDemoData,
  SEED_VERSION,
  writeStorage,
} from "../lib/storage.js";
import { getSnapshot, refresh } from "../lib/store.js";
import { resetApp } from "./helpers.js";

beforeEach(() => {
  resetApp();
});

describe("seeding", () => {
  it("seeds every collection on first run", () => {
    const data = getSnapshot();
    expect(data.users.length).toBeGreaterThan(0);
    expect(data.cars.length).toBe(20);
    expect(data.bookings.length).toBe(10);
    expect(data.reviews.length).toBe(2);
    expect(data.disputes.length).toBe(2);
    expect(data.announcements.length).toBe(2);
    expect(readStorage(KEYS.meta, null)).toMatchObject({
      seedVersion: SEED_VERSION,
    });
  });

  it("does not overwrite existing records on a second run", () => {
    const cars = readStorage(KEYS.cars, []);
    cars[0] = { ...cars[0], pricePerDay: 7777 };
    writeStorage(KEYS.cars, cars);
    refresh();

    initializeDemoData();
    refresh();

    expect(readStorage(KEYS.cars, [])[0].pricePerDay).toBe(7777);
  });

  it("derives stored seed car names from image filenames", () => {
    const cars = readStorage(KEYS.cars, []).filter((car) =>
      ["car_vitz", "car_dzire", "car_i10", "car_corolla", "car_crv", "car_landcruiser", "car_sportage", "car_sunny", "car_rav4"].includes(car.id),
    );
    const outdatedCars = cars.map((car) =>
      car.id === "car_vitz"
        ? { ...car, make: "Toyota", model: "Vitz", year: 2019, photos: [] }
        : car,
    );
    const customCar = { ...cars[0], id: "custom_car", make: "Custom" };
    writeStorage(KEYS.cars, [...outdatedCars, customCar]);
    writeStorage(KEYS.meta, { seedVersion: 1, seededAt: "2025-01-01T00:00:00.000Z" });

    initializeDemoData();
    refresh();

    const storedCars = readStorage(KEYS.cars, []);
    expect(storedCars.find((car) => car.id === "car_vitz")).toMatchObject({
      make: "Toyota",
      model: "Yaris",
      year: 2014,
      photos: ["/2014%20Toyota%20Yaris.jpg"],
    });
    expect(storedCars).toHaveLength(21);
    expect(storedCars.find((car) => car.id === "custom_car")).toEqual(customCar);
  });

  it("keeps IDs stable across refreshes", () => {
    const first = getSnapshot().cars.map((car) => car.id).join(",");
    for (let i = 0; i < 5; i += 1) {
      refresh();
      getSnapshot();
    }
    expect(getSnapshot().cars.map((car) => car.id).join(",")).toBe(first);
  });
});

describe("recovery", () => {
  it("repairs malformed JSON instead of crashing", () => {
    window.localStorage.setItem(KEYS.cars, "{ this is not json");
    initializeDemoData();
    refresh();

    const cars = readStorage(KEYS.cars, null, Array.isArray);
    expect(Array.isArray(cars)).toBe(true);
    expect(cars.length).toBe(20);
    expect(getStorageReport().recoveredKeys).toContain(KEYS.cars);
  });

  it("repairs a value of the wrong shape", () => {
    writeStorage(KEYS.bookings, { nope: true });
    initializeDemoData();
    refresh();

    expect(Array.isArray(readStorage(KEYS.bookings, null, Array.isArray))).toBe(true);
  });

  it("returns the fallback when reading a missing key", () => {
    expect(readStorage("sw_does_not_exist", "fallback")).toBe("fallback");
  });
});

describe("reset", () => {
  it("restores the seed data", () => {
    writeStorage(KEYS.cars, []);
    refresh();
    expect(getSnapshot().cars).toHaveLength(0);

    resetDemoData();
    refresh();

    expect(getSnapshot().cars).toHaveLength(20);
  });

  it("can clear the session too", () => {
    window.sessionStorage.setItem("sw_session_v1", JSON.stringify({ userId: "usr_dawit" }));
    resetDemoData({ clearSession: true });
    expect(window.sessionStorage.getItem("sw_session_v1")).toBeNull();
  });
});
