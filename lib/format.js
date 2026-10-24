// @ts-check

import { parseISODate } from "./dates.js";

const ETB = new Intl.NumberFormat("en-ET", {
  maximumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** 2400 -> "ETB 2,400" */
export function formatETB(amount) {
  if (!Number.isFinite(amount)) return "ETB —";
  return `ETB ${ETB.format(Math.round(amount))}`;
}

/** "2026-10-24" -> "24 Oct 2026". Parsed as UTC so it never shifts a day. */
export function formatDate(iso) {
  const ms = parseISODate(iso);
  return ms === null ? "—" : DATE.format(ms);
}

/** "2026-10-24" -> "24 Oct" */
export function formatDateShort(iso) {
  const ms = parseISODate(iso);
  return ms === null ? "—" : DATE_SHORT.format(ms);
}

/** "24 Oct 2026" or "24 – 26 Oct 2026" within one month. */
export function formatDateRange(start, end) {
  const a = parseISODate(start);
  const b = parseISODate(end);
  if (a === null || b === null) return "—";
  if (start === end) return formatDate(start);
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${DATE_SHORT.format(a)} – ${formatDate(end)}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** ISO date-time -> "24 Oct 2026, 14:22" */
export function formatDateTime(value) {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

/**
 * "3 days ago". Pass `now` explicitly for deterministic output — relative time
 * must never be computed during render on the server.
 */
export function formatRelative(value, now = Date.now()) {
  const ms = typeof value === "number" ? value : Date.parse(value);
  if (Number.isNaN(ms)) return "—";

  const diff = Math.max(0, now - ms);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;

  return formatDate(new Date(ms).toISOString().slice(0, 10));
}
