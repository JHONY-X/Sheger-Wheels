"use client";

import Link from "next/link";
import Image from "next/image";

import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`size-4 ${filled ? "fill-amber-400" : "fill-sand stroke-line stroke-[1.5]"}`}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-current stroke-2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChauffeurCard({ ch }) {
  const stars = Math.round(ch.rating);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-sand transition-all duration-300 hover:border-forest/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]"
      id={`chauffeur-${ch.id}`}
    >
      {/* Avatar + availability badge */}
      <div className="relative h-56 w-full overflow-hidden bg-canvas">
        <Image
          src={ch.avatar}
          alt={ch.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />

        {/* Available badge */}
        {ch.available && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-900/60 px-2.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        )}

        {/* Gender badge */}
        <span className="absolute left-3 top-3 rounded-full border border-line bg-canvas/70 px-2.5 py-1 text-xs font-medium capitalize text-ink/80 backdrop-blur-sm">
          {ch.gender}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">{ch.name}</h2>
            <p className="text-xs text-muted">{ch.experienceYears} yrs experience</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} filled={n <= stars} />
              ))}
            </div>
            <span className="text-xs text-muted">
              {ch.rating.toFixed(1)} · {ch.tripsCompleted} trips
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="line-clamp-2 flex-1 text-sm text-muted">{ch.bio}</p>

        {/* Languages */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LanguageIcon />
          <span>{ch.languages.join(" · ")}</span>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <span className="text-xl font-bold text-ink">
              ETB {ch.pricePerDay.toLocaleString()}
            </span>
            <span className="text-xs text-muted"> / day</span>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-2 rounded-btn border border-forest bg-forest/10 px-4 py-2 text-sm font-semibold text-forest transition-all hover:bg-forest hover:text-white"
          >
            Book a car
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ChauffeurSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-sand">
      <div className="h-56 bg-canvas" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-1/2 rounded bg-canvas" />
        <div className="h-4 w-3/4 rounded bg-canvas" />
        <div className="h-4 w-full rounded bg-canvas" />
        <div className="h-4 w-2/3 rounded bg-canvas" />
      </div>
    </div>
  );
}

export function ChauffeurListClient() {
  const data = useDemoData();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ChauffeurSkeleton key={k} />
        ))}
      </div>
    );
  }

  const chauffeurs = data.chauffeurs ?? [];

  if (chauffeurs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-sand py-20 text-center">
        <svg viewBox="0 0 48 48" fill="none" className="size-16 text-muted" stroke="currentColor" strokeWidth="1.5">
          <circle cx="24" cy="24" r="20" />
          <circle cx="24" cy="18" r="6" />
          <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" />
        </svg>
        <p className="text-lg font-semibold text-ink">No chauffeurs yet</p>
        <p className="text-sm text-muted">Check back soon — we're onboarding new drivers.</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats bar */}
      <div className="mb-8 flex flex-wrap gap-6 rounded-2xl border border-line bg-sand p-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-ink">{chauffeurs.length}</span>
          <span className="text-xs text-muted">Active chauffeurs</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-ink">
            {chauffeurs.reduce((s, c) => s + c.tripsCompleted, 0).toLocaleString()}
          </span>
          <span className="text-xs text-muted">Trips completed</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-ink">
            {(
              chauffeurs.reduce((s, c) => s + c.rating, 0) / chauffeurs.length
            ).toFixed(1)}
          </span>
          <span className="text-xs text-muted">Average rating</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-ink">
            {[...new Set(chauffeurs.flatMap((c) => c.languages))].length}
          </span>
          <span className="text-xs text-muted">Languages spoken</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {chauffeurs.map((ch) => (
          <ChauffeurCard key={ch.id} ch={ch} />
        ))}
      </div>
    </>
  );
}
