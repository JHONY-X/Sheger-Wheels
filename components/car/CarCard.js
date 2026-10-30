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
  const title = `${car.make} ${car.model} ${car.year}`;
  const image = photo ?? car.photos?.[0];

  return (
    <article
      className={cn(
        "premium-car-card group overflow-hidden rounded-card border border-line bg-white shadow-card transition-shadow hover:shadow-float",
        className,
      )}
    >
      <div className="premium-car-photo relative aspect-[16/10] overflow-hidden bg-sand">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <CarGlyph />
          </div>
        )}

        {flag && (
          <Badge
            tone={flag === "rare" ? "warning" : "forest"}
            className="absolute left-3 top-3 bg-white/95"
          >
            {flag === "rare" ? "Rare find" : "New"}
          </Badge>
        )}

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-card transition-colors hover:bg-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={cn(
              "size-5 transition-colors",
              saved ? "fill-danger stroke-danger" : "fill-none stroke-ink",
            )}
            strokeWidth="1.75"
          >
            <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z" />
          </svg>
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base font-semibold leading-snug text-ink">
            <Link
              href={`/cars/${car.id ?? "#"}`}
              className="hover:text-forest hover:underline hover:underline-offset-4"
            >
              {title}
            </Link>
          </h3>
          {car.rating && (
            <span
              data-numeric
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-ochre">
                <path d="m10 1.8 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8 2.4-5Z" />
              </svg>
              {car.rating}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-muted">
          {car.seats} seats · {car.transmission} · {car.neighbourhood}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <p className="text-ink">
            <span data-numeric className="text-lg font-semibold">
              ETB {car.pricePerDay.toLocaleString("en-ET")}
            </span>
            <span className="ml-1 text-sm text-muted">/ day</span>
          </p>
          <span className="text-sm font-medium text-forest opacity-0 transition-opacity group-hover:opacity-100">
            View car →
          </span>
        </div>
      </div>
    </article>
  );
}
