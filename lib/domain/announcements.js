// @ts-check
"use client";

import { newId } from "../ids.js";
import { hasRole, getCurrentUser } from "../session.js";
import { KEYS } from "../storage.js";
import { getSnapshot, updateCollection } from "../store.js";

const fail = (code, message) => ({ ok: false, code, message });

export function getAnnouncements() {
  return getSnapshot().announcements;
}

/** Active announcements, newest first — for the public banner. */
export function getActiveAnnouncements() {
  return getSnapshot()
    .announcements.filter((item) => item.active)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** @param {{ title: string, message: string }} input */
export function createAnnouncement({ title, message }) {
  const admin = getCurrentUser();
  if (!admin) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (!hasRole(admin, "admin")) return fail("FORBIDDEN", "Admin only.");

  const heading = String(title ?? "").trim();
  const body = String(message ?? "").trim();
  if (heading.length < 3) return fail("TITLE_REQUIRED", "Add a title.");
  if (body.length < 10) return fail("MESSAGE_REQUIRED", "Write at least 10 characters.");

  /** @type {import('../types.js').Announcement} */
  const announcement = {
    id: newId("ann"),
    title: heading,
    message: body,
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: admin.id,
  };

  const saved = updateCollection(KEYS.announcements, (items) => [
    announcement,
    ...items,
  ]);
  if (!saved) return fail("STORAGE_ERROR", "Could not publish the announcement.");

  return { ok: true, announcement };
}

/** @param {string} id @param {boolean} active */
export function setAnnouncementActive(id, active) {
  const admin = getCurrentUser();
  if (!admin) return fail("NOT_SIGNED_IN", "Sign in to continue.");
  if (!hasRole(admin, "admin")) return fail("FORBIDDEN", "Admin only.");

  const existing = getSnapshot().announcements.find((item) => item.id === id);
  if (!existing) return fail("NOT_FOUND", "That announcement does not exist.");

  const updated = { ...existing, active: Boolean(active) };
  const saved = updateCollection(KEYS.announcements, (items) =>
    items.map((item) => (item.id === id ? updated : item)),
  );
  if (!saved) return fail("STORAGE_ERROR", "Could not update the announcement.");

  return { ok: true, announcement: updated };
}
