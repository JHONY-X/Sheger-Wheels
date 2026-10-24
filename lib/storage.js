// @ts-check
import {
  seedAnnouncements,
  seedBookings,
  seedCars,
  seedDisputes,
  seedReviews,
  seedUsers,
} from "./seed/index.js";

/** Durable demo records. Bump when stored seed data needs a migration. */
export const KEYS = {
  users: "sw_users_v1",
  cars: "sw_cars_v1",
  bookings: "sw_bookings_v1",
  reviews: "sw_reviews_v1",
  disputes: "sw_disputes_v1",
  announcements: "sw_announcements_v1",
  meta: "sw_meta_v1",
};

/** Per-tab state. Cleared when the tab closes, and on sign-out. */
export const SESSION_KEY = "sw_session_v1";
export const CHECKOUT_DRAFT_KEY = "sw_checkout_draft_v1";

export const SEED_VERSION = 3;

const COLLECTION_KEYS = [
  KEYS.users,
  KEYS.cars,
  KEYS.bookings,
  KEYS.reviews,
  KEYS.disputes,
  KEYS.announcements,
];

export function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

/** @returns {Storage|null} */
function safeStorage(kind) {
  try {
    return isBrowser() ? window[kind] : null;
  } catch {
    // Access can throw when cookies/storage are blocked by the browser.
    return null;
  }
}

/**
 * Parse JSON without ever throwing. Malformed or missing data returns fallback.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @param {(value: unknown) => boolean} [validate]
 * @returns {T}
 */
export function readStorage(key, fallback, validate) {
  const store = safeStorage("localStorage");
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return /** @type {T} */ (parsed);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} false when storage is unavailable or over quota
 */
export function writeStorage(key, value) {
  const store = safeStorage("localStorage");
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  const store = safeStorage("localStorage");
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** @template T @returns {T|null} */
export function readSession(key, fallback = null) {
  const store = safeStorage("sessionStorage");
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeSession(key, value) {
  const store = safeStorage("sessionStorage");
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeSession(key) {
  const store = safeStorage("sessionStorage");
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Keys that were present but unreadable, so the UI can explain a recovery. */
const recovered = new Set();

/**
 * Seed any missing collection exactly once. Never overwrites existing data,
 * except where the stored value is unreadable — then it is repaired and the
 * key is reported so the user can be told.
 * @returns {{ seeded: boolean, recoveredKeys: string[] }}
 */
export function initializeDemoData() {
  if (!isBrowser()) return { seeded: false, recoveredKeys: [] };

  /** @type {Record<string, unknown[]>} */
  const seeds = {
    [KEYS.users]: seedUsers,
    [KEYS.cars]: seedCars,
    [KEYS.bookings]: seedBookings,
    [KEYS.reviews]: seedReviews,
    [KEYS.disputes]: seedDisputes,
    [KEYS.announcements]: seedAnnouncements,
  };

  let seeded = false;

  for (const key of COLLECTION_KEYS) {
    const existing = readStorage(key, null, Array.isArray);
    if (Array.isArray(existing)) continue;

    const raw = safeStorage("localStorage")?.getItem(key) ?? null;
    if (raw !== null) recovered.add(key);

    writeStorage(key, seeds[key]);
    seeded = true;
  }

  const meta = readStorage(KEYS.meta, null);
  if ((meta?.seedVersion ?? 0) < SEED_VERSION) {
    const seedCarsById = new Map(seedCars.map((car) => [car.id, car]));
    const existingCars = readStorage(KEYS.cars, null, Array.isArray);

    if (existingCars) {
      const existingIds = new Set(existingCars.map((car) => car.id));
      writeStorage(
        KEYS.cars,
        [
          ...existingCars.map((car) => {
            const seedCar = seedCarsById.get(car.id);
            if (!seedCar) return car;

            return {
              ...car,
              make: seedCar.make,
              model: seedCar.model,
              year: seedCar.year,
              photos:
                Array.isArray(car.photos) && car.photos.length > 0
                  ? car.photos
                  : seedCar.photos,
            };
          }),
          ...seedCars.filter((car) => !existingIds.has(car.id)),
        ],
      );
    }

    writeStorage(KEYS.meta, {
      ...(meta && typeof meta === "object" ? meta : {}),
      seedVersion: SEED_VERSION,
      seededAt: meta?.seededAt ?? new Date().toISOString(),
    });
  }

  return { seeded, recoveredKeys: [...recovered] };
}

/**
 * Development-only recovery. Removes demo records and re-seeds them.
 * @param {{ clearSession?: boolean }} [options]
 */
export function resetDemoData(options = {}) {
  for (const key of [...COLLECTION_KEYS, KEYS.meta]) {
    removeStorage(key);
  }
  recovered.clear();
  if (options.clearSession) {
    removeSession(SESSION_KEY);
    removeSession(CHECKOUT_DRAFT_KEY);
  }
  return initializeDemoData();
}

/** @returns {{ available: boolean, recoveredKeys: string[] }} */
export function getStorageReport() {
  return {
    available: isBrowser() && safeStorage("localStorage") !== null,
    recoveredKeys: [...recovered],
  };
}

export { COLLECTION_KEYS };
