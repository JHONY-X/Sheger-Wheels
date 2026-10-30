"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

function CarGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 64"
      className="h-16 w-auto text-forest/25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 30h132" />
      <rect x="12" y="30" width="136" height="16" rx="8" />
      <path d="M42 30 60 16h38l20 14" />
      <circle cx="46" cy="48" r="7" />
      <circle cx="118" cy="48" r="7" />
    </svg>
  );
}

/**
 * The signature catalogue card.
 * @param {Object} props
 * @param {Object} props.car   make, model, year, seats, transmission, neighbourhood, pricePerDay, rating
 * @param {string} [props.photo]   local path under /public
 * @param {'new'|'rare'} [props.flag]
 */
export function CarCard({ car, photo, flag, className }) {
  const [saved, setSaved] = useState(false);
  const title = `${car.make} ${car.model}`;
  const image = photo ?? car.photos?.[0];

  return (
    <article
      className={cn(
        "premium-car-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-sand shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float",
        className,
      )}
    >
      <div>
        <div className="premium-car-photo relative aspect-[16/10] overflow-hidden bg-sand">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <CarGlyph />
            </div>
          )}

          {/* Available badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-canvas/80 px-2 py-1 text-xs font-medium text-success backdrop-blur-sm border border-line/40">
            <span className="size-1.5 rounded-full bg-success" />
            <span>Available</span>
          </div>

          {/* Heart button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((v) => !v);
            }}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-canvas/80 text-muted backdrop-blur-sm border border-line/40 transition-colors hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={cn(
                "size-4 transition-colors",
                saved ? "fill-danger stroke-danger" : "fill-none stroke-current",
              )}
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-ink">
            <Link
              href={`/cars/${car.id ?? "#"}`}
              className="hover:text-forest transition-colors"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {car.fuel || "Sedan"} · {car.neighbourhood}
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{car.seats || 4} Passengers</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18" />
              </svg>
              <span className="capitalize">{car.transmission}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line/60 px-4 py-3.5">
        <div>
          <span className="text-sm font-bold text-forest">
            ETB {car.pricePerDay?.toLocaleString("en-ET")}
          </span>
          <span className="text-xs text-muted"> /day</span>
        </div>

        <Link
          href={`/cars/${car.id ?? "#"}`}
          aria-label={`View ${title}`}
          className="flex size-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-forest hover:text-white hover:border-forest"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4 stroke-current stroke-2">
            <path d="M4 10h12M12 6l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
