"use client";

import dynamic from "next/dynamic";

/**
 * Leaflet touches `window`, so the canvas is client-only. Keeping the import
 * behind `dynamic` also keeps Leaflet's CSS out of the initial route bundle.
 */
const CarMapCanvas = dynamic(() => import("./CarMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
      Loading map…
    </div>
  ),
});

export function CarMap({ car }) {
  const osmHref = `https://www.openstreetmap.org/?mlat=${car.latitude}&mlon=${car.longitude}#map=15/${car.latitude}/${car.longitude}`;

  return (
    <div>
      <div className="h-64 overflow-hidden rounded-btn border border-line bg-sand">
        <CarMapCanvas
          latitude={car.latitude}
          longitude={car.longitude}
          label={`${car.make} ${car.model} — ${car.neighbourhood}`}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <p className="max-w-md text-xs leading-relaxed text-muted">
          Approximate location: {car.neighbourhood}, {car.city}. Coordinates are
          seeded demo data, not live GPS. The exact pick-up point is agreed with
          the owner.
        </p>
        <a
          href={osmHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-xs font-medium text-forest hover:underline hover:underline-offset-4"
        >
          Open in OpenStreetMap
        </a>
      </div>
    </div>
  );
}
