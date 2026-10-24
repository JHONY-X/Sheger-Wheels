// @ts-check
"use client";

import { useSyncExternalStore } from "react";
import {
  getStorageReport,
  initializeDemoData,
  KEYS,
  readSession,
  readStorage,
  SESSION_KEY,
  writeStorage,
} from "./storage.js";

/** @type {import('./types.js').Snapshot} */
const EMPTY = Object.freeze({
  users: [],
  cars: [],
  bookings: [],
  reviews: [],
  disputes: [],
  announcements: [],
  session: null,
  storage: { available: false, recoveredKeys: [] },
});

/** @type {import('./types.js').Snapshot|null} */
let snapshot = null;
/** @type {Set<() => void>} */
const listeners = new Set();

function hydrate() {
  initializeDemoData();

  return {
    users: readStorage(KEYS.users, [], Array.isArray),
    cars: readStorage(KEYS.cars, [], Array.isArray),
    bookings: readStorage(KEYS.bookings, [], Array.isArray),
    reviews: readStorage(KEYS.reviews, [], Array.isArray),
    disputes: readStorage(KEYS.disputes, [], Array.isArray),
    announcements: readStorage(KEYS.announcements, [], Array.isArray),
    session: readSession(SESSION_KEY, null),
    storage: getStorageReport(),
  };
}

/**
 * Cached snapshot. React compares references, so this must return the same
 * object until something actually changes — hence the null-out in refresh().
 * @returns {import('./types.js').Snapshot}
 */
export function getSnapshot() {
  if (snapshot === null) snapshot = hydrate();
  return snapshot;
}

/** Server and hydration render: no records, no session. */
export function getServerSnapshot() {
  return EMPTY;
}

/** @param {() => void} listener */
export function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Drop the cache and notify every subscriber. */
export function refresh() {
  snapshot = null;
  listeners.forEach((listener) => listener());
}

/**
 * Persist a whole collection, then refresh. Domain modules are the only callers.
 * @param {string} key
 * @param {(current: any[]) => any[]|undefined} updater return undefined to abort
 * @returns {boolean}
 */
export function updateCollection(key, updater) {
  const current = readStorage(key, [], Array.isArray);
  const next = updater(current);
  if (!Array.isArray(next)) return false;

  const ok = writeStorage(key, next);
  if (ok) refresh();
  return ok;
}

/** React hook. Client components only. */
export function useDemoData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* Cross-tab: another tab wrote, so drop our cache. Not server-backed sync. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key.startsWith("sw_")) refresh();
  });
}
