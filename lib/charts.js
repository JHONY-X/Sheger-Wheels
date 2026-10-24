/**
 * Pure data transformation helpers for Recharts visualizations.
 */

/** Status -> display label and palette color */
export const STATUS_META = {
  requested:   { label: "Requested",   fill: "#d1ad59" },
  confirmed:   { label: "Confirmed",   fill: "#529b77" },
  in_progress: { label: "In progress", fill: "#3ea884" },
  completed:   { label: "Completed",   fill: "#68b593" },
  reviewed:    { label: "Reviewed",    fill: "#9ec5b2" },
  declined:    { label: "Declined",    fill: "#c4883b" },
  cancelled:   { label: "Cancelled",   fill: "#828894" },
  disputed:    { label: "Disputed",    fill: "#df8277" },
  resolved:    { label: "Resolved",    fill: "#8297b2" },
};

/**
 * Build the last N months of earnings data from an owner's bookings array.
 * @param {import('./types').Booking[]} bookings - owner's bookings
 * @param {number} [months=6] - how many calendar months back to show
 * @returns {{ month: string, label: string, earnings: number }[]}
 */
export function buildMonthlyEarnings(bookings, months = 6) {
  const PAID = ["confirmed", "in_progress", "completed", "reviewed", "resolved"];

  /** @type {Map<string, number>} */
  const byMonth = new Map();

  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, 0);
  }

  for (const booking of bookings) {
    if (!PAID.includes(booking.status)) continue;
    if (booking.paymentStatus !== "paid") continue;
    const month = booking.createdAt.slice(0, 7);
    if (byMonth.has(month)) {
      byMonth.set(month, (byMonth.get(month) ?? 0) + booking.total);
    }
  }

  return Array.from(byMonth.entries()).map(([month, earnings]) => {
    const [year, mo] = month.split("-");
    const label = new Date(Number(year), Number(mo) - 1, 1).toLocaleString(
      "en-GB",
      { month: "short" },
    );
    return { month, label, earnings: Math.round(earnings) };
  });
}

/**
 * Build status counts and metadata from all platform bookings.
 * @param {import('./types').Booking[]} bookings
 * @returns {{ status: string, label: string, count: number, fill: string }[]}
 */
export function buildStatusData(bookings) {
  /** @type {Map<string, number>} */
  const counts = new Map();

  for (const key of Object.keys(STATUS_META)) counts.set(key, 0);
  for (const booking of bookings) {
    if (counts.has(booking.status)) {
      counts.set(booking.status, (counts.get(booking.status) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      label: STATUS_META[status]?.label ?? status,
      count,
      fill: STATUS_META[status]?.fill ?? "#5b6472",
    }));
}
