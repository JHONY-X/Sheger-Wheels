// @ts-check
import { isISODate, todayISO } from "./dates.js";
import { conflictingBookings, isCarAvailable } from "./pricing.js";

export const PAGE_SIZE = 6;

/** Neighbourhoods come from the seeded geometry so the filter and map agree. */
export const NEIGHBOURHOOD_OPTIONS = [
  "Bole",
  "Kazanchis",
  "CMC",
  "Sarbet",
  "Piassa",
  "Gerji",
  "Mekanisa",
  "Ayat",
];

export const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest listings" },
  { value: "popular", label: "Most booked" },
];

export const DEFAULT_QUERY = {
  q: "",
  neighbourhoods: [],
  minPrice: null,
  maxPrice: null,
  transmission: "any",
  seats: null,
  from: "",
  to: "",
  sort: "recommended",
  page: 1,
};

/** @param {Record<string, string|string[]|undefined>} params */
function first(params, key) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** @param {unknown} value */
function positiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

/**
 * Turn raw search params into a normalised query. Unknown or malformed values
 * are dropped rather than throwing, so a hand-edited URL still renders.
 * @param {Record<string, string|string[]|undefined>} params
 */
export function parseCarQuery(params) {
  const neighbourhoods = String(first(params, "neighbourhood") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => NEIGHBOURHOOD_OPTIONS.includes(value));

  const transmission = first(params, "transmission");
  const sort = first(params, "sort");
  const from = first(params, "from");
  const to = first(params, "to");
  const page = Number.parseInt(String(first(params, "page") ?? "1"), 10);

  return {
    q: String(first(params, "q") ?? "").trim(),
    neighbourhoods: [...new Set(neighbourhoods)],
    minPrice: positiveNumber(first(params, "min")),
    maxPrice: positiveNumber(first(params, "max")),
    transmission:
      transmission === "automatic" || transmission === "manual"
        ? transmission
        : "any",
    seats: positiveNumber(first(params, "seats")),
    from: isISODate(from) ? from : "",
    to: isISODate(to) ? to : "",
    sort: SORTS.some((option) => option.value === sort) ? sort : "recommended",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Completed trips, used for the "Most booked" sort. */
export function countCarBookings(bookings, carId) {
  return bookings.filter(
    (booking) =>
      booking.carId === carId &&
      (booking.status === "completed" || booking.status === "reviewed"),
  ).length;
}

/** Average rating from reviews, or null when a car has none yet. */
export function ratingForCar(reviews, carId) {
  const scores = reviews
    .filter((review) => review.carId === carId)
    .map((review) => review.rating);
  if (scores.length === 0) return null;
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return { average: Math.round(average * 10) / 10, count: scores.length };
}

/**
 * Public catalogue only, then every active filter.
 * @param {import('./types.js').Car[]} cars
 * @param {ReturnType<typeof parseCarQuery>} query
 * @param {{ bookings?: import('./types.js').Booking[], today?: string }} [context]
 */
export function filterCars(cars, query, context = {}) {
  const bookings = context.bookings ?? [];
  const today = context.today ?? todayISO();
  const needle = query.q.toLowerCase();

  /* A one-sided date filter means that single day. */
  const from = query.from || query.to;
  const to = query.to || query.from;

  return cars.filter((car) => {
    if (car.status !== "approved" || car.active !== true) return false;

    if (needle) {
      const haystack =
        `${car.make} ${car.model} ${car.year} ${car.neighbourhood} ${car.description}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (
      query.neighbourhoods.length > 0 &&
      !query.neighbourhoods.includes(car.neighbourhood)
    ) {
      return false;
    }

    if (query.minPrice !== null && car.pricePerDay < query.minPrice)
      return false;
    if (query.maxPrice !== null && car.pricePerDay > query.maxPrice)
      return false;

    if (
      query.transmission !== "any" &&
      car.transmission !== query.transmission
    ) {
      return false;
    }

    if (query.seats !== null && car.seats < query.seats) return false;

    if (from && to) {
      if (to < from) return false;
      if (from < today) return false;
      if (!isCarAvailable(car, from, to)) return false;
      if (conflictingBookings(bookings, car.id, from, to).length > 0)
        return false;
    }

    return true;
  });
}

/**
 * @param {import('./types.js').Car[]} cars
 * @param {string} sort
 * @param {{ bookings?: import('./types.js').Booking[] }} [context]
 */
export function sortCars(cars, sort, context = {}) {
  const bookings = context.bookings ?? [];
  const byPrice = (a, b) => a.pricePerDay - b.pricePerDay;

  switch (sort) {
    case "price-asc":
      return [...cars].sort(byPrice);
    case "price-desc":
      return [...cars].sort((a, b) => byPrice(b, a));
    case "newest":
      return [...cars].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
      return [...cars].sort(
        (a, b) =>
          countCarBookings(bookings, b.id) - countCarBookings(bookings, a.id),
      );
    default:
      /* Recommended: proven cars first, then the cheaper one. */
      return [...cars].sort((a, b) => {
        const difference =
          countCarBookings(bookings, b.id) - countCarBookings(bookings, a.id);
        return difference !== 0 ? difference : byPrice(a, b);
      });
  }
}

/** Clamp the page so ?page=99 shows the last page, not an empty grid. */
export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
    pageSize,
  };
}

/**
 * Build a URL for the same catalogue with some params changed.
 * Passing null/"" removes a param. `page` is dropped unless stated.
 * @param {ReturnType<typeof parseCarQuery>} query
 * @param {Record<string, string|number|null>} overrides
 */
export function buildCarsHref(query, overrides = {}) {
  const params = new URLSearchParams();

  const set = (key, value) => {
    if (value === null || value === undefined || value === "") return;
    params.set(key, String(value));
  };

  const merged = {
    q: query.q,
    neighbourhood: query.neighbourhoods.join(","),
    min: query.minPrice,
    max: query.maxPrice,
    transmission: query.transmission === "any" ? "" : query.transmission,
    seats: query.seats,
    from: query.from,
    to: query.to,
    sort: query.sort === "recommended" ? "" : query.sort,
    ...overrides,
  };

  /* `page` is intentionally absent from the defaults: changing a filter
     therefore drops it, while an explicit override can still set it. */
  for (const [key, value] of Object.entries(merged)) {
    set(key, value);
  }

  const search = params.toString();
  return search ? `/cars?${search}` : "/cars";
}

/** Number of filters in play, for the "Filters (3)" label. */
export function activeFilterCount(query) {
  let count = 0;
  if (query.q) count += 1;
  if (query.neighbourhoods.length) count += 1;
  if (query.minPrice !== null || query.maxPrice !== null) count += 1;
  if (query.transmission !== "any") count += 1;
  if (query.seats !== null) count += 1;
  if (query.from || query.to) count += 1;
  return count;
}

/** Human-readable chips for the active filters. */
export function activeFilters(query) {
  const chips = [];

  if (query.q) chips.push({ key: "q", label: `“${query.q}”` });
  for (const neighbourhood of query.neighbourhoods) {
    chips.push({
      key: `place:${neighbourhood}`,
      label: neighbourhood,
    });
  }
  if (query.minPrice !== null && query.maxPrice !== null) {
    chips.push({
      key: "price",
      label: `ETB ${query.minPrice.toLocaleString("en-ET")} – ${query.maxPrice.toLocaleString("en-ET")}`,
    });
  } else if (query.minPrice !== null) {
    chips.push({
      key: "price",
      label: `From ETB ${query.minPrice.toLocaleString("en-ET")}`,
    });
  } else if (query.maxPrice !== null) {
    chips.push({
      key: "price",
      label: `Up to ETB ${query.maxPrice.toLocaleString("en-ET")}`,
    });
  }
  if (query.transmission !== "any") {
    chips.push({ key: "transmission", label: query.transmission });
  }
  if (query.seats !== null) {
    chips.push({ key: "seats", label: `${query.seats}+ seats` });
  }
  if (query.from || query.to) {
    const from = query.from || query.to;
    const to = query.to || query.from;
    chips.push({
      key: "dates",
      label: from === to ? from : `${from} → ${to}`,
    });
  }

  return chips;
}
