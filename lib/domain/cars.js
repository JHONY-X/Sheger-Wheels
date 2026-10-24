// @ts-check
"use client";

import { newId } from "../ids.js";
import { hasRole, getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";
import { NEIGHBOURHOODS } from "../seed/cars.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getCars() {
  return getSnapshot().cars;
}

/** Public catalogue: only approved, active listings. */
export function getPublicCars() {
  return getSnapshot().cars.filter((car) => car.status === "approved" && car.active);
}

export function getCarById(id) {
  return getSnapshot().cars.find((car) => car.id === id) ?? null;
}

export function getCarsByOwner(ownerId) {
  return getSnapshot().cars.filter((car) => car.ownerId === ownerId);
}

/**
 * Shape and range checks shared by create and edit.
 * @param {Record<string, any>} input
 */
function validateCar(input) {
  if (!String(input.make ?? "").trim()) return "Enter the make.";
  if (!String(input.model ?? "").trim()) return "Enter the model.";

  const year = Number(input.year);
  const nextYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 1990 || year > nextYear) {
    return `Year must be between 1990 and ${nextYear}.`;
  }

  const price = Number(input.pricePerDay);
  if (!Number.isFinite(price) || price < 500) {
    return "Price per day must be at least ETB 500.";
  }

  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 2 || seats > 12) {
    return "Seats must be between 2 and 12.";
  }

  if (!["automatic", "manual"].includes(input.transmission)) {
    return "Choose a transmission.";
  }
  if (!Object.keys(NEIGHBOURHOODS).includes(input.neighbourhood)) {
    return "Choose a neighbourhood.";
  }
  if (String(input.description ?? "").trim().length < 20) {
    return "Add a description of at least 20 characters.";
  }
  return null;
}

/**
 * Create or update an owner's car. New listings start as `pending` so the
 * admin moderation queue has something to do.
 * @param {Record<string, any>} input
 * @param {{ id?: string }} [options]
 */
export function saveCar(input, options = {}) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (user.status === "suspended") return fail("ACCOUNT_SUSPENDED", "This demo account is suspended.");
  if (!hasRole(user, "owner")) return fail("FORBIDDEN", "Owner access required.");

  const problem = validateCar(input);
  if (problem) return fail("INVALID", problem);

  const existing = options.id ? getCarById(options.id) : null;
  if (options.id && !existing) return fail("NOT_FOUND", "That listing does not exist.");
  if (existing && existing.ownerId !== user.id) {
    return fail("NOT_YOURS", "Not yours — this listing belongs to another owner.");
  }

  const geo = NEIGHBOURHOODS[input.neighbourhood];
  const base = {
    ownerId: user.id,
    make: String(input.make).trim(),
    model: String(input.model).trim(),
    year: Number(input.year),
    transmission: input.transmission,
    seats: Number(input.seats),
    fuel: String(input.fuel ?? "Petrol").trim(),
    city: geo.city,
    neighbourhood: input.neighbourhood,
    latitude: geo.latitude,
    longitude: geo.longitude,
    pricePerDay: Number(input.pricePerDay),
    photos: Array.isArray(input.photos) ? input.photos : existing?.photos ?? [],
    description: String(input.description).trim(),
    status: existing ? existing.status : "pending",
    active: existing ? existing.active : true,
    unavailableDates: Array.isArray(input.unavailableDates)
      ? input.unavailableDates
      : existing?.unavailableDates ?? [],
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };

  const car = existing
    ? { ...existing, ...base, id: existing.id }
    : { ...base, id: newId("car") };

  const saved = updateCollection(KEYS.cars, (cars) =>
    existing
      ? cars.map((item) => (item.id === car.id ? car : item))
      : [...cars, car],
  );

  if (!saved) return fail("STORAGE_ERROR", "Could not save the listing.");
  return { ok: true, car };
}

/**
 * Admin moderation: approve or reject a pending listing.
 * @param {string} carId
 * @param {'approved'|'rejected'} status
 */
export function moderateCar(carId, status) {
  const actor = getCurrentUser();
  if (!actor) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (!hasRole(actor, "admin")) return fail("FORBIDDEN", "Admin only.");
  if (!["approved", "rejected"].includes(status)) {
    return fail("INVALID", "Unknown moderation status.");
  }

  const car = getCarById(carId);
  if (!car) return fail("NOT_FOUND", "That listing does not exist.");

  const updated = {
    ...car,
    status,
    active: status === "approved" ? true : car.active,
  };

  const saved = updateCollection(KEYS.cars, (cars) =>
    cars.map((item) => (item.id === carId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save the decision.");
  return { ok: true, car: updated };
}

/** Owner deactivates or reactivates their own listing. */
export function setCarActive(carId, active) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (user.status === "suspended") return fail("ACCOUNT_SUSPENDED", "This demo account is suspended.");

  const car = getCarById(carId);
  if (!car) return fail("NOT_FOUND", "That listing does not exist.");
  if (car.ownerId !== user.id) {
    return fail("NOT_YOURS", "Not yours — this listing belongs to another owner.");
  }

  const updated = {
    ...car,
    active: Boolean(active),
    /* Hiding marks the listing inactive; showing it restores approval, but a
       pending or rejected listing must still go through moderation. */
    status: active
      ? car.status === "inactive"
        ? "approved"
        : car.status
      : "inactive",
  };

  const saved = updateCollection(KEYS.cars, (cars) =>
    cars.map((item) => (item.id === carId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save the change.");
  return { ok: true, car: updated };
}

/**
 * Replace the owner's blocked dates.
 * @param {string} carId
 * @param {string[]} dates YYYY-MM-DD
 */
export function setCarAvailability(carId, dates) {
  const user = getCurrentUser();
  if (!user) return fail("NOT_SIGNED_IN", "Sign in to continue.");

  const car = getCarById(carId);
  if (!car) return fail("NOT_FOUND", "That listing does not exist.");
  if (car.ownerId !== user.id) {
    return fail("NOT_YOURS", "Not yours — this listing belongs to another owner.");
  }

  const unique = [...new Set(dates)].sort();
  const updated = { ...car, unavailableDates: unique };

  const saved = updateCollection(KEYS.cars, (cars) =>
    cars.map((item) => (item.id === carId ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save availability.");
  return { ok: true, car: updated };
}
