"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CarCard } from "@/components/car/CarCard";
import {
  Button,
  CarCardSkeleton,
  Checkbox,
  EmptyState,
  Input,
  Pagination,
  Segmented,
  Select,
} from "@/components/ui";
import {
  NEIGHBOURHOOD_OPTIONS,
  SORTS,
  activeFilterCount,
  activeFilters,
  filterCars,
  paginate,
  parseCarQuery,
  ratingForCar,
  sortCars,
} from "@/lib/cars-query";
import { todayISO } from "@/lib/dates";
import { formatETB } from "@/lib/format";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { useTodayISO } from "@/lib/use-today";

const TRANSMISSION_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const SEAT_OPTIONS = [
  { value: "", label: "Any" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
  { value: "7", label: "7+" },
];

/**
 * Text and price are committed on submit, not on every keystroke. Giving the
 * form a key derived from the URL means back/forward and "clear all" reset the
 * inputs without mirroring URL state into React state.
 */
function FilterFields({ query, actions, idPrefix }) {
  const today = useTodayISO();
  const signature = `${query.q}|${query.minPrice ?? ""}|${query.maxPrice ?? ""}`;

  return (
    <div className="space-y-6">
      <form
        key={signature}
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          actions.applyTextAndPrice(
            String(values.get("q") ?? ""),
            String(values.get("min") ?? ""),
            String(values.get("max") ?? ""),
          );
        }}
      >
        <Input
          id={`${idPrefix}-q`}
          name="q"
          label="Search"
          type="search"
          defaultValue={query.q}
          placeholder="Vitz, Corolla, Bole…"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input
            id={`${idPrefix}-min`}
            name="min"
            label="Min ETB"
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            placeholder="0"
            defaultValue={query.minPrice ?? ""}
          />
          <Input
            id={`${idPrefix}-max`}
            name="max"
            label="Max ETB"
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            placeholder="Any"
            defaultValue={query.maxPrice ?? ""}
          />
        </div>

        <Button type="submit" size="sm" variant="secondary" className="mt-3 w-full">
          Apply search
        </Button>
      </form>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Pick-up and return</legend>
        <div className="grid grid-cols-1 gap-3">
          <Input
            id={`${idPrefix}-from`}
            label="From"
            type="date"
            min={today || undefined}
            value={query.from}
            onChange={(event) => actions.setDates(event.target.value, query.to)}
          />
          <Input
            id={`${idPrefix}-to`}
            label="To"
            type="date"
            min={query.from || today || undefined}
            value={query.to}
            onChange={(event) => actions.setDates(query.from, event.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Transmission</legend>
        <Segmented
          label="Transmission"
          options={TRANSMISSION_OPTIONS}
          value={query.transmission}
          onChange={actions.setTransmission}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Seats</legend>
        <Segmented
          label="Minimum seats"
          options={SEAT_OPTIONS}
          value={query.seats === null ? "" : String(query.seats)}
          onChange={actions.setSeats}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Neighbourhood</legend>
        <div className="space-y-2.5">
          {NEIGHBOURHOOD_OPTIONS.map((place) => (
            <Checkbox
              key={place}
              id={`${idPrefix}-place-${place}`}
              label={place}
              checked={query.neighbourhoods.includes(place)}
              onChange={(event) => actions.togglePlace(place, event.target.checked)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <CarCardSkeleton key={key} />
      ))}
    </div>
  );
}

export function CatalogueClient() {
  const data = useDemoData();
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const query = useMemo(() => parseCarQuery(raw), [raw]);

  function pushParams(changes, { keepPage = false } = {}) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    if (!keepPage) params.delete("page");

    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  const actions = {
    applyTextAndPrice(q, min, max) {
      pushParams({
        q: q.trim() || null,
        min: min.trim() || null,
        max: max.trim() || null,
      });
    },
    togglePlace(place, checked) {
      const next = checked
        ? [...query.neighbourhoods, place]
        : query.neighbourhoods.filter((item) => item !== place);
      pushParams({ neighbourhood: next.join(",") || null });
    },
    setTransmission(value) {
      pushParams({ transmission: value === "any" ? null : value });
    },
    setSeats(value) {
      pushParams({ seats: value || null });
    },
    setDates(from, to) {
      const safeTo = to && from && to < from ? "" : to;
      pushParams({ from: from || null, to: safeTo || null });
    },
    clearAll() {
      router.replace(pathname, { scroll: false });
    },
    removeFilter(key) {
      if (key === "q") return pushParams({ q: null });
      if (key === "price") return pushParams({ min: null, max: null });
      if (key === "transmission") return pushParams({ transmission: null });
      if (key === "seats") return pushParams({ seats: null });
      if (key === "dates") return pushParams({ from: null, to: null });
      if (key.startsWith("place:")) {
        const place = key.slice("place:".length);
        return pushParams({
          neighbourhood:
            query.neighbourhoods.filter((item) => item !== place).join(",") || null,
        });
      }
      return undefined;
    },
  };

  const filtered = filterCars(data.cars, query, { bookings: data.bookings });
  const sorted = sortCars(filtered, query.sort, { bookings: data.bookings });
  const page = paginate(sorted, query.page);
  const filters = activeFilters(query);

  const sortSelect = (
    <Select
      label="Sort"
      value={query.sort}
      onChange={(event) =>
        pushParams({
          sort: event.target.value === "recommended" ? null : event.target.value,
        })
      }
      className="w-48"
    >
      {SORTS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );

  return (
    <div className="lg:grid lg:grid-cols-[264px_1fr] lg:items-start lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-card border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-ink">Filters</h2>
            {activeFilterCount(query) > 0 && (
              <button
                type="button"
                onClick={actions.clearAll}
                className="text-sm font-medium text-forest hover:underline hover:underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="mt-5">
            <FilterFields
              query={query}
              actions={actions}
              idPrefix="desktop"
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-ink">Cars in Addis Ababa</h1>
            <p className="mt-1 text-sm text-muted">
              {hydrated ? (
                <>
                  <span data-numeric className="font-medium text-ink">
                    {page.total}
                  </span>{" "}
                  {page.total === 1 ? "car" : "cars"} available
                  {query.from || query.to ? " for those dates" : ""}
                </>
              ) : (
                "Loading the catalogue…"
              )}
            </p>
          </div>

          <div className="hidden sm:block">{sortSelect}</div>
        </div>

        <details className="mt-6 rounded-card border border-line bg-white p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Filters
            {activeFilterCount(query) > 0 && ` (${activeFilterCount(query)})`}
          </summary>
          <div className="mt-5">
            <FilterFields query={query} actions={actions} idPrefix="mobile" />
          </div>
        </details>

        <div className="mt-4 sm:hidden">{sortSelect}</div>

        <h2 className="sr-only">Catalogue results</h2>

        {filters.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => actions.removeFilter(filter.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink hover:border-forest"
              >
                {filter.label}
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="size-3.5 fill-none stroke-muted stroke-[2]"
                >
                  <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={actions.clearAll}
              className="text-xs font-medium text-forest hover:underline hover:underline-offset-4"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-6">
          {!hydrated ? (
            <CatalogueSkeleton />
          ) : page.items.length === 0 ? (
            data.cars.length === 0 ? (
              <EmptyState
                title="The catalogue is empty"
                description="No demo records are loaded. Reset the seeded data to restore the listings."
                action={
                  <Button href="/dev" variant="secondary">
                    Open developer tools
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No cars match those filters"
                description="Try a wider price range, another neighbourhood, or clear the dates."
                action={
                  <Button variant="secondary" onClick={actions.clearAll}>
                    Clear all filters
                  </Button>
                }
              />
            )
          ) : (
            <>
              <p className="text-sm text-muted lg:hidden">
                Showing {page.items.length} of {page.total}
              </p>

              <div className="mt-2 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {page.items.map((car) => {
                  const rating = ratingForCar(data.reviews, car.id);
                  return (
                    <CarCard key={car.id} car={{ ...car, rating: rating?.average }} />
                  );
                })}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="text-sm text-muted">
                  {formatETB(Math.min(...page.items.map((car) => car.pricePerDay)))} –{" "}
                  {formatETB(Math.max(...page.items.map((car) => car.pricePerDay)))} on
                  this page
                </p>
                <Pagination
                  page={page.page}
                  totalPages={page.totalPages}
                  getHref={(target) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(target));
                    return `${pathname}?${params.toString()}`;
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
