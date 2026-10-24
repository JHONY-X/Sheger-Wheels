"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CarCard } from "@/components/car/CarCard";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  Skeleton,
} from "@/components/ui";
import { ratingForCar } from "@/lib/cars-query";
import { addDaysISO } from "@/lib/dates";
import { requestBooking } from "@/lib/domain/bookings";
import { formatDate, formatETB } from "@/lib/format";
import {
  FEE_RATE,
  conflictingBookings,
  isCarAvailable,
  priceBreakdown,
} from "@/lib/pricing";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { CHECKOUT_DRAFT_KEY, writeSession } from "@/lib/storage";
import { useTodayISO } from "@/lib/use-today";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { CarMap } from "./CarMap";

const CAR_GLYPH = (
  <svg
    aria-hidden
    viewBox="0 0 160 64"
    className="h-32 w-auto text-forest/20 sm:h-40"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          aria-hidden
          viewBox="0 0 20 20"
          className={star <= Math.round(value) ? "size-4 fill-ochre" : "size-4 fill-line"}
        >
          <path d="m10 1.8 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8 2.4-5Z" />
        </svg>
      ))}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-[16/10] w-full rounded-card" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    </div>
  );
}

export function CarDetailClient({ id }) {
  const data = useDemoData();
  const hydrated = useHydrated();
  const router = useRouter();

  const today = useTodayISO();
  const [fromInput, setFrom] = useState("");
  const [toInput, setTo] = useState("");

  /* Prefill three nights ahead once the client knows today's date. */
  const from = fromInput || (today ? addDaysISO(today, 3) : "");
  const to = toInput || (today ? addDaysISO(today, 5) : "");
  const [error, setError] = useState(null);

  const car = data.cars.find((item) => item.id === id) ?? null;
  const owner = car ? data.users.find((item) => item.id === car.ownerId) ?? null : null;

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const reviews = useMemo(
    () =>
      data.reviews
        .filter((review) => review.carId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.reviews, id],
  );

  const rating = ratingForCar(data.reviews, id);
  const breakdown = priceBreakdown(car?.pricePerDay ?? 0, from, to);

  const conflict = (() => {
    if (!car || !from || !to || to < from) return null;
    if (!isCarAvailable(car, from, to)) return "The owner has blocked one of those dates.";
    if (conflictingBookings(data.bookings, car.id, from, to).length > 0) {
      return "Another booking already covers those dates.";
    }
    return null;
  })();

  if (!hydrated) return <DetailSkeleton />;

  if (!car || car.status !== "approved" || !car.active) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-6 py-20">
        <EmptyState
          title="This car is not available"
          description="It may be unlisted, awaiting approval, or taken down by the owner. Browse the catalogue for cars that are accepting bookings."
          action={<Button href="/cars">Browse cars</Button>}
        />
      </div>
    );
  }

  const title = `${car.make} ${car.model} ${car.year}`;
  const isOwner = user?.id === car.ownerId;

  const related = data.cars
    .filter(
      (item) =>
        item.id !== car.id && item.status === "approved" && item.active,
    )
    .sort((a, b) => {
      const sameA = a.neighbourhood === car.neighbourhood ? 0 : 1;
      const sameB = b.neighbourhood === car.neighbourhood ? 0 : 1;
      return sameA - sameB || a.pricePerDay - b.pricePerDay;
    })
    .slice(0, 3);

  function handleRequest(event) {
    event.preventDefault();
    setError(null);

    if (!user) {
      router.push(`/signin?next=${encodeURIComponent(`/cars/${car.id}`)}`);
      return;
    }

    const result = requestBooking({ carId: car.id, startDate: from, endDate: to });
    if (result.ok) {
      writeSession(CHECKOUT_DRAFT_KEY, {
        bookingId: result.booking.id,
        createdAt: new Date().toISOString(),
      });
      router.push("/checkout");
      return;
    }

    if (result.code === "NOT_SIGNED_IN") {
      router.push(`/signin?next=${encodeURIComponent(`/cars/${car.id}`)}`);
      return;
    }

    setError(result.message);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-forest hover:underline hover:underline-offset-4">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/cars" className="hover:text-forest hover:underline hover:underline-offset-4">
              Cars
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-ink">{title}</li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-sand">
            {car.photos?.[0] ? (
              <Image
                src={car.photos[0]}
                alt={`${title} in ${car.neighbourhood}`}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">{CAR_GLYPH}</div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-12 text-right text-xs uppercase tracking-[0.08em] text-white">
              {car.neighbourhood} · {car.city}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                  <span>{car.neighbourhood}</span>
                  <span aria-hidden>·</span>
                  <span>{car.seats} seats</span>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{car.transmission}</span>
                  <span aria-hidden>·</span>
                  <span>{car.fuel}</span>
                  {rating && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5 text-ink">
                        <Stars value={rating.average} />
                        <span data-numeric className="font-medium">
                          {rating.average}
                        </span>
                        <span className="text-muted">
                          ({rating.count} {rating.count === 1 ? "review" : "reviews"})
                        </span>
                      </span>
                    </>
                  )}
                </p>
              </div>
              <p className="text-ink">
                <span data-numeric className="text-2xl font-semibold">
                  {formatETB(car.pricePerDay)}
                </span>
                <span className="text-sm text-muted"> / day</span>
              </p>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
              {car.description}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Year", String(car.year)],
              ["Transmission", car.transmission === "automatic" ? "Automatic" : "Manual"],
              ["Seats", String(car.seats)],
              ["Fuel", car.fuel],
              ["Neighbourhood", car.neighbourhood],
              ["Listed", formatDate(car.createdAt.slice(0, 10))],
            ].map(([label, value]) => (
              <div key={label} className="rounded-btn border border-line bg-white px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.06em] text-muted">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <Card className="mt-8">
            <CardHeader
              title="Availability"
              description="Booked and blocked days are marked. Pick your dates in the booking panel."
            />
            <CardBody>
              <AvailabilityCalendar car={car} bookings={data.bookings} />
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader
              title="Where you'll collect it"
              description={`${car.neighbourhood}, ${car.city}. The exact meeting point is agreed with the owner.`}
            />
            <CardBody>
              <CarMap car={car} />
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader
              title="Reviews"
              description={
                rating
                  ? `${rating.count} ${rating.count === 1 ? "review" : "reviews"} from completed trips.`
                  : "No reviews yet — this car is new to the platform."
              }
            />
            <CardBody>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted">
                  Reviews appear after a renter completes a trip and leaves one.
                </p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((review) => {
                    const author = data.users.find((item) => item.id === review.renterId);
                    return (
                      <li key={review.id} className="border-b border-line pb-5 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              aria-hidden
                              className="flex size-8 items-center justify-center rounded-full bg-forest-tint text-xs font-semibold text-forest"
                            >
                              {(author?.name ?? "?").slice(0, 1)}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-ink">
                                {author?.name ?? "Demo renter"}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDate(review.createdAt.slice(0, 10))}
                              </p>
                            </div>
                          </div>
                          <Stars value={review.rating} />
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-ink/90">
                          {review.comment}
                        </p>

                        {review.ownerReply && (
                          <div className="mt-3 rounded-btn border border-line bg-canvas px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                              Owner reply
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-ink/90">
                              {review.ownerReply}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl text-ink">More cars nearby</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((item) => {
                  const itemRating = ratingForCar(data.reviews, item.id);
                  return (
                    <CarCard
                      key={item.id}
                      car={{ ...item, rating: itemRating?.average }}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardBody>
              <form onSubmit={handleRequest}>
                  <p className="text-ink">
                    <span data-numeric className="text-2xl font-semibold">
                      {formatETB(car.pricePerDay)}
                    </span>
                    <span className="text-sm text-muted"> / day</span>
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Input
                      label="Pick-up"
                      type="date"
                      min={today || undefined}
                      value={from}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFrom(value);
                        if (to && value && to < value) setTo(value);
                      }}
                    />
                    <Input
                      label="Return"
                      type="date"
                      min={from || today || undefined}
                      value={to}
                      onChange={(event) => {
                        setTo(event.target.value);
                      }}
                    />
                  </div>

                  {breakdown ? (
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted">
                          {formatETB(car.pricePerDay)} × {breakdown.days}{" "}
                          {breakdown.days === 1 ? "day" : "days"}
                        </dt>
                        <dd data-numeric className="text-ink">
                          {formatETB(breakdown.subtotal)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted">
                          Service fee ({Math.round(FEE_RATE * 100)}%)
                        </dt>
                        <dd data-numeric className="text-ink">
                          {formatETB(breakdown.fee)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between border-t border-line pt-2">
                        <dt className="font-medium text-ink">Total</dt>
                        <dd data-numeric className="text-lg font-semibold text-ink">
                          {formatETB(breakdown.total)}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-4 text-sm text-danger">
                      Choose a valid date range to see the total.
                    </p>
                  )}

                  {(conflict || error) && (
                    <p role="alert" className="mt-3 rounded-btn bg-danger-tint px-3 py-2 text-sm text-danger">
                      {error ?? conflict}
                    </p>
                  )}

                  {isOwner ? (
                    <div className="mt-4 rounded-btn border border-line bg-canvas px-3 py-2.5 text-sm text-muted">
                      This is your listing. Owners cannot book their own car.
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      className="mt-4 w-full"
                      disabled={Boolean(conflict) || !breakdown}
                    >
                      {user ? "Request to book" : "Sign in to request"}
                    </Button>
                  )}

                  <p className="mt-3 text-center text-xs leading-relaxed text-muted">
                    Demo booking — no payment is taken and no card is collected.
                  </p>
                </form>
            </CardBody>
          </Card>

          {owner && (
            <Card className="mt-4">
              <CardBody>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-11 items-center justify-center rounded-full bg-forest-tint text-sm font-semibold text-forest"
                  >
                    {owner.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {owner.name}
                    </p>
                    <p className="text-xs text-muted">
                      Owner since {new Date(owner.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>

                <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
                  Seeded demo account. Contact details are withheld because no
                  real handover takes place.
                </p>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
