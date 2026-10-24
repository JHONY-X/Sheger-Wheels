// @ts-check
"use client";

import {
  CHECKOUT_DRAFT_KEY,
  readSession,
  removeSession,
  SESSION_KEY,
  writeSession,
} from "./storage.js";
import { getSnapshot, refresh } from "./store.js";

/** @returns {import('./types.js').Session|null} */
export function getSession() {
  return readSession(SESSION_KEY, null);
}

export function isSignedIn() {
  return Boolean(getSession()?.userId);
}

/**
 * Resolve the signed-in user from the users collection.
 * A session pointing at a deleted user is treated as signed out.
 * @returns {import('./types.js').User|null}
 */
export function getCurrentUser() {
  const session = getSession();
  if (!session?.userId) return null;
  return getSnapshot().users.find((user) => user.id === session.userId) ?? null;
}

/**
 * Demo sign-in: no password, no verification. Stores only the user id.
 * Suspended accounts may sign in so the blocked-state screen can explain why.
 * @param {string} userId
 */
export function signInAsDemo(userId) {
  const user = getSnapshot().users.find((u) => u.id === userId);
  if (!user) {
    return { ok: false, code: "USER_NOT_FOUND", message: "That demo account does not exist." };
  }

  const stored = writeSession(SESSION_KEY, {
    userId: user.id,
    signedInAt: new Date().toISOString(),
  });

  if (!stored) {
    return {
      ok: false,
      code: "SESSION_UNAVAILABLE",
      message: "This browser blocked session storage. Demo sign-in is unavailable.",
    };
  }

  refresh();
  return { ok: true, user };
}

/** Clears the session and any in-progress checkout draft. */
export function signOut() {
  removeSession(SESSION_KEY);
  removeSession(CHECKOUT_DRAFT_KEY);
  refresh();
}

/** @param {import('./types.js').User|null} user */
export function hasRole(user, role) {
  return Boolean(user?.roles?.includes(role));
}

/**
 * Guard for protected areas. Returns a result instead of redirecting, so both
 * layouts and domain functions can share it.
 * @param {'renter'|'owner'|'admin'} role
 * @param {import('./types.js').User|null} [user]
 */
export function requireRole(role, user = getCurrentUser()) {
  if (!user) {
    return { ok: false, code: "NOT_SIGNED_IN", message: "Sign in to continue." };
  }
  if (user.status === "suspended") {
    return {
      ok: false,
      code: "ACCOUNT_SUSPENDED",
      message: "This demo account is suspended.",
    };
  }
  if (!hasRole(user, role)) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "This area needs a different demo role.",
    };
  }
  return { ok: true, user };
}

/**
 * Only internal paths are accepted. Rejects absolute URLs, protocol-relative
 * URLs and the backslash variant that some browsers normalise to `//`.
 * @param {unknown} value
 * @param {string} [fallback]
 */
export function safeReturnPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;

  const path = value.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;

  // Reject control characters that can smuggle a second destination.
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;

  return path;
}

/** Create a sign-in URL that preserves where the user was going. */
export function signInHref(nextPath, fallback = "/dashboard") {
  return `/signin?next=${encodeURIComponent(safeReturnPath(nextPath, fallback))}`;
}
