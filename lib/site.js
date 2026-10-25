// @ts-check

/**
 * Public origin used for canonical URLs, the sitemap and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL when the demo is deployed.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sheger-wheels.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Sheggar Wheels";

export const SITE_DESCRIPTION =
  "Peer-to-peer car rental in Addis Ababa. Rent from a verified owner in your neighbourhood, or list your own car. Student demo with simulated bookings and payments.";

/** @param {string} path */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
