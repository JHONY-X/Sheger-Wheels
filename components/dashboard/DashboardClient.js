"use client";

import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  StatCard,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatDate, formatETB } from "@/lib/format";
import { useDemoData } from "@/lib/store";

const OPEN = ["requested", "confirmed", "in_progress"];
const DONE = ["completed", "reviewed", "resolved"];

export function DashboardClient() {
  const data = useDemoData();

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const mine = data.bookings.filter((booking) => booking.renterId === user?.id);

  const upcoming = mine.filter((booking) => OPEN.includes(booking.status));
  const completed = mine.filter((booking) => DONE.includes(booking.status));
  const cancelled = mine.filter((booking) =>
    ["cancelled", "declined"].includes(booking.status),
  );

  const paid = mine.filter(
    (booking) =>
      booking.paymentStatus === "paid" &&
      !["cancelled", "declined"].includes(booking.status),
  );
  const spend = paid.reduce((sum, booking) => sum + booking.total, 0);

  const nextTrip = [...upcoming].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  )[0];

  const recent = [...mine]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const isOwner = user?.roles.includes("owner");
  const isAdmin = user?.roles.includes("admin");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink">Hello, {user?.name.split(" ")[0]}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {user?.roles.join(" · ")} · signed in to the local demo. Numbers come
            from this browser&apos;s seeded bookings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/cars" size="sm">
            Find a car
          </Button>
          {isOwner && (
            <Button href="/owner" variant="secondary" size="sm">
              Owner tools
            </Button>
          )}
          {isAdmin && (
            <Button href="/admin" variant="secondary" size="sm">
              Admin
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming trips"
          value={upcoming.length}
          hint={upcoming.length === 0 ? "Nothing booked yet" : "Requested or confirmed"}
        />
        <StatCard
          label="Completed"
          value={completed.length}
          hint="Includes reviewed trips"
        />
        <StatCard
          label="Cancelled"
          value={cancelled.length}
          hint="Cancelled or declined"
        />
        <StatCard
          label="Committed spend"
          value={formatETB(spend)}
          hint="Paid bookings only, demo money"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        <Card>
          <CardHeader
            title="Recent bookings"
            action={
              <Link
                href="/bookings"
                className="text-sm font-medium text-forest hover:underline hover:underline-offset-4"
              >
                View all
              </Link>
            }
          />
          <CardBody>
            {recent.length === 0 ? (
              <EmptyState
                title="No trips yet"
                description="Pick a car and request your dates. Everything you book appears here."
                action={<Button href="/cars">Browse cars</Button>}
              />
            ) : (
              <Table caption="Recent bookings">
                <THead>
                  <TR>
                    <TH>Reference</TH>
                    <TH>Dates</TH>
                    <TH>Status</TH>
                    <TH align="right">Total</TH>
                  </TR>
                </THead>
                <TBody>
                  {recent.map((booking) => (
                    <TR key={booking.id}>
                      <TD>
                        <Link
                          href={`/bookings/${booking.id}`}
                          data-numeric
                          className="font-medium text-forest hover:underline hover:underline-offset-4"
                        >
                          {booking.reference}
                        </Link>
                      </TD>
                      <TD>
                        {formatDate(booking.startDate)}
                        <span className="block text-xs text-muted">
                          to {formatDate(booking.endDate)}
                        </span>
                      </TD>
                      <TD>
                        <StatusBadge status={booking.status} />
                      </TD>
                      <TD align="right" numeric>
                        {formatETB(booking.total)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Next trip" />
            <CardBody>
              {nextTrip ? (
                (() => {
                  const car = data.cars.find((item) => item.id === nextTrip.carId);
                  return (
                    <div>
                      <StatusBadge status={nextTrip.status} />
                      <p className="mt-3 font-medium text-ink">
                        {car ? `${car.make} ${car.model} ${car.year}` : "Removed listing"}
                      </p>
                      <p className="text-sm text-muted">
                        {car ? car.neighbourhood : "—"}
                      </p>
                      <p className="mt-3 text-sm text-ink">
                        {formatDate(nextTrip.startDate)} →{" "}
                        {formatDate(nextTrip.endDate)}
                      </p>
                      <p className="text-sm text-muted">
                        {nextTrip.days} {nextTrip.days === 1 ? "day" : "days"} ·{" "}
                        {formatETB(nextTrip.total)}
                      </p>
                      <Button
                        href={`/bookings/${nextTrip.id}`}
                        variant="secondary"
                        size="sm"
                        className="mt-4 w-full"
                      >
                        Open booking
                      </Button>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-muted">
                  No upcoming trip. Requests waiting for an owner still appear
                  under bookings.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Your roles" />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {user?.roles.map((role) => (
                  <Badge key={role} tone={role === "admin" ? "warning" : "forest"}>
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {isAdmin
                  ? "The admin account can moderate listings, suspend users and resolve disputes."
                  : isOwner
                    ? "Owner tools are unlocked for this account. Add a car and wait for admin approval."
                    : "Renter account. Sign up as an owner to list a car as well."}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
