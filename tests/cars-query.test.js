import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  buildCarsHref,
  DEFAULT_QUERY,
  filterCars,
  PAGE_SIZE,
  paginate,
  parseCarQuery,
  ratingForCar,
  sortCars,
} from "../lib/cars-query.js";
import { seedCars } from "../lib/seed/cars.js";
import { seedBookings } from "../lib/seed/bookings.js";
import { addDaysISO, todayISO } from "../lib/dates.js";

const query = (overrides = {}) => ({ ...DEFAULT_QUERY, ...overrides });
const day = (offset) => addDaysISO(todayISO(), offset);

describe("parseCarQuery", () => {
  it("normalises a well-formed query", () => {
    const parsed = parseCarQuery({
      q: "  vitz ",
      neighbourhood: "Bole,CMC",
      min: "2000",
      max: "6000",
      transmission: "automatic",
      seats: "4",
      from: "2026-11-01",
      to: "2026-11-03",
      sort: "price-asc",
      page: "2",
    });

    expect(parsed.q).toBe("vitz");
    expect(parsed.neighbourhoods).toEqual(["Bole", "CMC"]);
    expect(parsed.minPrice).toBe(2000);
    expect(parsed.transmission).toBe("automatic");
    expect(parsed.sort).toBe("price-asc");
    expect(parsed.page).toBe(2);
  });

  it("drops junk instead of throwing", () => {
    const parsed = parseCarQuery({
      neighbourhood: "Atlantis,Bole",
      min: "-5",
      transmission: "hovercraft",
      from: "01/11/2026",
      sort: "cheapest",
      page: "999999999",
    });

    expect(parsed.neighbourhoods).toEqual(["Bole"]);
    expect(parsed.minPrice).toBeNull();
    expect(parsed.transmission).toBe("any");
    expect(parsed.from).toBe("");
    expect(parsed.sort).toBe("recommended");
    expect(parsed.page).toBe(999999999);
  });

  it("accepts a repeated param and keeps the first value", () => {
    expect(parseCarQuery({ q: ["vitz", "corolla"] }).q).toBe("vitz");
  });
});

describe("filterCars", () => {
  it("only shows approved, active listings", () => {
    const result = filterCars(seedCars, query());
    expect(result).toHaveLength(17);
    expect(new Set(result.map((car) => car.photos[0])).size).toBe(17);
    expect(result.every((car) => car.status === "approved" && car.active)).toBe(
      true,
    );
    expect(result.map((car) => car.id)).not.toContain("car_sportage");
    expect(result.map((car) => car.id)).not.toContain("car_sunny");
    expect(result.map((car) => car.id)).not.toContain("car_rav4");
  });

  it("matches make, model, neighbourhood and description", () => {
    expect(filterCars(seedCars, query({ q: "corolla" }))).toHaveLength(2);
    expect(filterCars(seedCars, query({ q: "BOLE" }))).toHaveLength(2);
    expect(filterCars(seedCars, query({ q: "nonsense" }))).toHaveLength(0);
  });

  it("filters by neighbourhood list", () => {
    const result = filterCars(
      seedCars,
      query({ neighbourhoods: ["CMC", "Ayat"] }),
    );
    expect(result.map((car) => car.id)).toEqual([
      "car_i10",
      "car_rav4_2012",
      "car_f150",
      "car_tucson_2022",
    ]);
  });

  it("filters by price band", () => {
    const result = filterCars(
      seedCars,
      query({ minPrice: 3000, maxPrice: 5000 }),
    );
    expect(result.map((car) => car.make)).toEqual(
      expect.arrayContaining(["Toyota", "Hyundai"]),
    );
    expect(
      result.every((car) => car.pricePerDay >= 3000 && car.pricePerDay <= 5000),
    ).toBe(true);
  });

  it("filters by transmission and seats", () => {
    const manual = filterCars(seedCars, query({ transmission: "manual" }));
    expect(manual.map((car) => car.id)).toEqual([
      "car_dzire",
      "car_tacoma_2014_a",
    ]);

    const big = filterCars(seedCars, query({ seats: 5 }));
    expect(big.every((car) => car.seats >= 5)).toBe(true);
  });

  it("removes cars already booked in the requested window", () => {
    const car = seedCars.find((item) => item.id === "car_vitz");
    const booking = seedBookings.find((item) => item.id === "bk_requested");
    const result = filterCars(
      seedCars,
      query({ from: booking.startDate, to: booking.endDate }),
      {
        bookings: seedBookings,
      },
    );

    expect(result.map((item) => item.id)).not.toContain(car.id);
  });

  it("keeps a car that is free on those dates", () => {
    const result = filterCars(
      seedCars,
      query({ from: day(200), to: day(202) }),
      {
        bookings: seedBookings,
      },
    );
    expect(result).toHaveLength(17);
  });

  it("rejects a reversed or past date window", () => {
    expect(
      filterCars(seedCars, query({ from: day(10), to: day(8) })),
    ).toHaveLength(0);
    expect(
      filterCars(seedCars, query({ from: day(-10), to: day(-8) })),
    ).toHaveLength(0);
  });
});

describe("sortCars", () => {
  it("sorts by price in both directions", () => {
    const ascending = sortCars(seedCars, "price-asc");
    const descending = sortCars(seedCars, "price-desc");

    expect(ascending[0].pricePerDay).toBeLessThan(ascending.at(-1).pricePerDay);
    expect(descending[0].pricePerDay).toBeGreaterThan(
      descending.at(-1).pricePerDay,
    );
  });

  it("does not mutate the input", () => {
    const original = seedCars.map((car) => car.id).join(",");
    sortCars(seedCars, "price-desc");
    expect(seedCars.map((car) => car.id).join(",")).toBe(original);
  });

  it("ranks most-booked cars first", () => {
    const result = sortCars(seedCars, "popular", { bookings: seedBookings });
    /* car_crv has two completed trips, every other car has at most one. */
    expect(result[0].id).toBe("car_crv");
  });
});

describe("paginate", () => {
  it("splits into pages", () => {
    const items = Array.from({ length: 23 }, (_, i) => i);
    const first = paginate(items, 1);
    expect(first.items).toHaveLength(6);
    expect(PAGE_SIZE).toBe(6);
    expect(first.totalPages).toBe(4);
    expect(first.total).toBe(23);
  });

  it("clamps out-of-range pages", () => {
    const items = Array.from({ length: 4 }, (_, i) => i);
    expect(paginate(items, 99).page).toBe(1);
    expect(paginate(items, 0).page).toBe(1);
    expect(paginate(items, -3).page).toBe(1);
  });

  it("returns one empty page for no results", () => {
    const empty = paginate([], 1);
    expect(empty.items).toEqual([]);
    expect(empty.totalPages).toBe(1);
  });
});

describe("buildCarsHref", () => {
  it("drops defaults to keep the URL short", () => {
    expect(buildCarsHref(query())).toBe("/cars");
  });

  it("keeps active filters and removes page when a filter changes", () => {
    const href = buildCarsHref(query({ q: "vitz", page: 3 }), {
      transmission: "manual",
    });
    expect(href).toContain("q=vitz");
    expect(href).toContain("transmission=manual");
    expect(href).not.toContain("page=");
  });

  it("allows an explicit page", () => {
    expect(buildCarsHref(query({ q: "vitz" }), { page: 2 })).toBe(
      "/cars?q=vitz&page=2",
    );
  });

  it("removes a filter when given null", () => {
    const href = buildCarsHref(query({ minimum: 1, minPrice: 2000 }), {
      min: null,
    });
    expect(href).not.toContain("min=");
  });
});

describe("summaries", () => {
  it("counts filters", () => {
    expect(activeFilterCount(query())).toBe(0);
    expect(
      activeFilterCount(
        query({ q: "vitz", transmission: "manual", seats: 4, minPrice: 1000 }),
      ),
    ).toBe(4);
  });

  it("averages ratings per car", () => {
    const reviews = [
      { carId: "a", rating: 5 },
      { carId: "a", rating: 4 },
      { carId: "b", rating: 3 },
    ];
    expect(ratingForCar(reviews, "a")).toEqual({ average: 4.5, count: 2 });
    expect(ratingForCar(reviews, "b")).toEqual({ average: 3, count: 1 });
    expect(ratingForCar(reviews, "c")).toBeNull();
  });
});
