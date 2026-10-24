// @ts-check
"use client";

import { newId } from "../ids.js";
import { hasRole, getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getUsers() {
  return getSnapshot().users;
}

export function getUserById(id) {
  return getSnapshot().users.find((user) => user.id === id) ?? null;
}

export function getUserByEmail(email) {
  const needle = String(email ?? "").trim().toLowerCase();
  return getSnapshot().users.find((user) => user.email.toLowerCase() === needle) ?? null;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

/**
 * Public sign-up can create a renter, optionally with owner tools enabled.
 * The admin role is seeded only — it can never be self-assigned.
 * @param {{ name?: string, email?: string, phone?: string, asOwner?: boolean }} input
 */
export function createDemoAccount(input) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const phone = String(input.phone ?? "").trim();

  if (name.length < 2) return fail("NAME_REQUIRED", "Enter your full name.");
  if (!isEmail(email)) return fail("EMAIL_INVALID", "Enter a valid email address.");
  if (phone.length < 7) return fail("PHONE_REQUIRED", "Enter a phone number we can reach you on.");
  if (getUserByEmail(email)) {
    return fail("EMAIL_TAKEN", "That email already has a demo account.");
  }

  /** @type {import('../types.js').User} */
  const user = {
    id: newId("usr"),
    name,
    email,
    phone,
    roles: input.asOwner ? ["renter", "owner"] : ["renter"],
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const saved = updateCollection(KEYS.users, (users) => [...users, user]);
  if (!saved) return fail("STORAGE_ERROR", "Could not save the account.");

  return { ok: true, user };
}

/**
 * Admin-only account moderation.
 * @param {string} userId
 * @param {'active'|'suspended'} status
 */
export function setUserStatus(userId, status) {
  const actor = getCurrentUser();
  if (!actor) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (!hasRole(actor, "admin")) return fail("FORBIDDEN", "Admin only.");

  const target = getUserById(userId);
  if (!target) return fail("NOT_FOUND", "That demo user does not exist.");
  if (target.id === actor.id) {
    return fail("SELF_ACTION", "You cannot suspend your own admin account.");
  }

  const updated = { ...target, status };
  const saved = updateCollection(KEYS.users, (users) =>
    users.map((user) => (user.id === userId ? updated : user)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not save the change.");

  return { ok: true, user: updated };
}
