// @ts-check

export const DAY_MS = 86_400_000;

/** Strict YYYY-MM-DD check — rejects 2026-02-31. */
export function isISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** @returns {number|null} UTC midnight in ms */
export function parseISODate(value) {
  if (!isISODate(value)) return null;
  return Date.parse(`${value}T00:00:00Z`);
}

/** Local calendar date as YYYY-MM-DD (what a date picker means by "today"). */
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Shift an ISO date by n days, DST-safe because the arithmetic is in UTC. */
export function addDaysISO(iso, n) {
  const ms = parseISODate(iso);
  if (ms === null) return iso;
  return new Date(ms + n * DAY_MS).toISOString().slice(0, 10);
}

/** Calendar days from start to end inclusive: 24 → 26 Oct is 3 days. */
export function rentalDays(start, end) {
  const a = parseISODate(start);
  const b = parseISODate(end);
  if (a === null || b === null) return 0;
  return Math.round((b - a) / DAY_MS) + 1;
}

/** Inclusive range comparison; ISO date strings sort lexicographically. */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

/** True when `date` falls inside [start, end]. */
export function isWithin(date, start, end) {
  return date >= start && date <= end;
}
