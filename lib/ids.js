// @ts-check

/**
 * Stable IDs. `crypto.randomUUID()` needs a secure context, which a demo on
 * http://192.168.x.x is not, so fall back to random base36.
 * @returns {string}
 */
export function newId(prefix = "sw") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand()}${rand()}`;
}

/**
 * Human-facing booking reference: SW-8F3A21.
 * @returns {string}
 */
export function newBookingRef() {
  const alphabet = "0123456789ABCDEF";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SW-${out}`;
}
