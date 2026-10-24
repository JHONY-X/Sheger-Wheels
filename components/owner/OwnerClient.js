"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";

import { buildMonthlyEarnings } from "@/components/charts/EarningsChart";

const EarningsChart = dynamic(
  () => import("@/components/charts/EarningsChart").then((m) => m.EarningsChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        Loading chart…
      </div>
    ),
  },
);

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  StatCard,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { ACTIONS, allowedActions, transitionBooking } from "@/lib/booking-state";
import { saveCar, setCarActive } from "@/lib/domain/cars";
import { formatDate, formatETB } from "@/lib/format";
import { NEIGHBOURHOODS } from "@/lib/seed/cars";
import { useDemoData } from "@/lib/store";

const OPEN_STATUS = ["requested", "confirmed", "in_progress"];
const PAID_STATUS = ["confirmed", "in_progress", "completed", "reviewed", "resolved"];

function CarStatusBadge({ car }) {
  if (car.status === "approved" && car.active) {
    return <Badge tone="success" dot>Live</Badge>;
  }
  if (car.status === "pending") return <Badge tone="warning" dot>Pending review</Badge>;
  if (car.status === "rejected") return <Badge tone="danger" dot>Rejected</Badge>;
  return <Badge tone="muted" dot>Inactive</Badge>;
}

export function OwnerClient() {
  const data = useDemoData();
  const [message, setMessage] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const cars = data.cars.filter((car) => car.ownerId === user?.id);
  const carIds = new Set(cars.map((car) => car.id));
  const bookings = data.bookings.filter((booking) => carIds.has(booking.carId));

  const requested = bookings.filter((booking) => booking.status === "requested");
  const live = cars.filter((car) => car.status === "approved" && car.active);

  const earnings = bookings
    .filter(
      (booking) =>
        booking.paymentStatus === "paid" &&
        PAID_STATUS.includes(booking.status),
    )
    .reduce((sum, booking) => sum + booking.total, 0);

  const monthlyEarningsData = buildMonthlyEarnings(bookings);

  /* Booked days in the current month over the days the cars were available. */
  const month = new Date().toISOString().slice(0, 7);
  let bookedDays = 0;
  for (const booking of bookings) {
    if (!["confirmed", "in_progress", "completed", "reviewed"].includes(booking.status)) {
      continue;
    }
    let cursor = booking.startDate;
    while (cursor <= booking.endDate) {
      if (cursor.startsWith(month)) bookedDays += 1;
      cursor = new Date(Date.parse(`${cursor}T00:00:00Z`) + 86400000)
        .toISOString()
        .slice(0, 10);
    }
  }
  const utilisation =
    live.length === 0 ? 0 : Math.round((bookedDays / (live.length * 30)) * 100);

  function notify(result, successText) {
    setMessage(
      result.ok
        ? { tone: "success", text: successText }
        : { tone: "error", text: result.message },
    );
    return result.ok;
  }

  function runAction(action, booking) {
    if (ACTIONS[action]?.needsConfirm && !window.confirm(ACTIONS[action].needsConfirm)) {
      return;
    }
    notify(
      transitionBooking(booking.id, action),
      `${ACTIONS[action].label} — ${booking.reference}.`,
    );
  }

  function toggleActive(car) {
    const next = !(car.status === "approved" && car.active);
    const question = next
      ? `Put ${car.make} ${car.model} back in the catalogue?`
      : `Hide ${car.make} ${car.model} from the catalogue?`;
    if (!window.confirm(question)) return;

    notify(
      setCarActive(car.id, next),
      next ? "Listing is live again." : "Listing hidden from the catalogue.",
    );
  }

  function addCar(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);

    const result = saveCar({
      make: values.get("make"),
      model: values.get("model"),
      year: values.get("year"),
      pricePerDay: values.get("pricePerDay"),
      seats: values.get("seats"),
      transmission: values.get("transmission"),
      fuel: values.get("fuel"),
      neighbourhood: values.get("neighbourhood"),
      description: values.get("description"),
    });

    if (notify(result, "Listing submitted. An admin has to approve it.")) {
      setFormKey((key) => key + 1);
      setShowForm(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink">Owner dashboard</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Requests, listings and payouts for the cars you own. Every action is
            simulated and stays in this browser.
          </p>
        </div>
        <Button onClick={() => setShowForm((open) => !open)} size="sm">
          {showForm ? "Close form" : "Add a car"}
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-5 rounded-btn px-3 py-2 text-sm ${message.tone === "error"
            ? "bg-danger-tint text-danger"
            : "bg-success-tint text-success"
            }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live listings" value={live.length} hint={`${cars.length} total`} />
        <StatCard
          label="Requests waiting"
          value={requested.length}
          hint="Approve or decline"
        />
        <StatCard
          label="Demo earnings"
          value={formatETB(earnings)}
          hint="Paid bookings, excluded cancellations"
        />
        <StatCard
          label="Utilisation"
          value={`${utilisation}%`}
          hint="This month, live cars"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Monthly earnings"
          description="Paid booking revenue across your listings for the last 6 months (ETB)."
        />
        <CardBody>
          <EarningsChart data={monthlyEarningsData} />
        </CardBody>
      </Card>

      {showForm && (
        <Card className="mt-6">
          <CardHeader
            title="Add a car"
            description="New listings start as pending, so the admin queue has something real to moderate."
          />
          <CardBody>
            <form key={formKey} onSubmit={addCar}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Input name="make" label="Make" required placeholder="Toyota" />
                <Input name="model" label="Model" required placeholder="Corolla" />
                <Input
                  name="year"
                  label="Year"
                  type="number"
                  required
                  min="1990"
                  max="2027"
                  defaultValue="2021"
                />
                <Input
                  name="pricePerDay"
                  label="Price per day (ETB)"
                  type="number"
                  required
                  min="500"
                  step="50"
                  defaultValue="2500"
                />
                <Input
                  name="seats"
                  label="Seats"
                  type="number"
                  required
                  min="2"
                  max="12"
                  defaultValue="5"
                />
                <div>
                  <label
                    htmlFor="transmission"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Transmission
                  </label>
                  <select
                    id="transmission"
                    name="transmission"
                    defaultValue="automatic"
                    className="h-11 w-full rounded-btn border border-line bg-white px-3 text-sm text-ink"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fuel"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Fuel
                  </label>
                  <select
                    id="fuel"
                    name="fuel"
                    defaultValue="Petrol"
                    className="h-11 w-full rounded-btn border border-line bg-white px-3 text-sm text-ink"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="neighbourhood"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Neighbourhood
                  </label>
                  <select
                    id="neighbourhood"
                    name="neighbourhood"
                    defaultValue="Bole"
                    className="h-11 w-full rounded-btn border border-line bg-white px-3 text-sm text-ink"
                  >
                    {Object.keys(NEIGHBOURHOODS).map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                  placeholder="What should a renter know? Condition, boot space, service history…"
                  className="w-full rounded-btn border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/80"
                />
                <p className="mt-1.5 text-sm text-muted">At least 20 characters.</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit">Submit for approval</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Requests"
          description="Approve, decline, start and finish trips. The renter sees the change immediately."
        />
        <CardBody>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">
              No requests yet. Once a renter books one of your cars it appears
              here.
            </p>
          ) : (
            <Table caption="Requests for your cars">
              <THead>
                <TR>
                  <TH>Renter</TH>
                  <TH>Car</TH>
                  <TH>Dates</TH>
                  <TH>Status</TH>
                  <TH align="right">Payout</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {[...bookings]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((booking) => {
                    const car = data.cars.find((item) => item.id === booking.carId);
                    const renter = data.users.find(
                      (item) => item.id === booking.renterId,
                    );
                    const actions = allowedActions(booking, user).filter(
                      (action) => action !== "resolve",
                    );

                    return (
                      <TR key={booking.id}>
                        <TD>
                          <span className="block font-medium text-ink">
                            {renter?.name ?? "Demo renter"}
                          </span>
                          <Link
                            href={`/bookings/${booking.id}`}
                            data-numeric
                            className="text-xs text-forest hover:underline"
                          >
                            {booking.reference}
                          </Link>
                        </TD>
                        <TD>
                          {car ? `${car.make} ${car.model}` : "Removed"}
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
                        <TD>
                          <div className="flex flex-wrap gap-1.5">
                            {actions.length === 0 && (
                              <span className="text-xs text-muted">—</span>
                            )}
                            {actions.map((action) => (
                              <Button
                                key={action}
                                size="sm"
                                variant={
                                  ACTIONS[action].variant === "destructive"
                                    ? "ghost"
                                    : ACTIONS[action].variant
                                }
                                className="h-8 px-2.5 text-xs"
                                onClick={() => runAction(action, booking)}
                              >
                                {ACTIONS[action].label}
                              </Button>
                            ))}
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Your cars"
          description="Hide a car without deleting it. Rejected listings stay rejected until edited."
        />
        <CardBody>
          {cars.length === 0 ? (
            <EmptyState
              title="No cars listed"
              description="Use “Add a car” to create your first listing. It will wait for admin approval before appearing in the catalogue."
              action={<Button onClick={() => setShowForm(true)}>Add a car</Button>}
            />
          ) : (
            <Table caption="Your cars">
              <THead>
                <TR>
                  <TH>Car</TH>
                  <TH>Status</TH>
                  <TH align="right">Per day</TH>
                  <TH align="right">Trips</TH>
                  <TH>
                    <span className="sr-only">Actions</span>
                  </TH>
                </TR>
              </THead>
              <TBody>
                {cars.map((car) => {
                  const trips = bookings.filter(
                    (booking) =>
                      booking.carId === car.id &&
                      ["completed", "reviewed"].includes(booking.status),
                  ).length;

                  return (
                    <TR key={car.id}>
                      <TD>
                        <Link
                          href={`/cars/${car.id}`}
                          className="font-medium text-ink hover:text-forest hover:underline"
                        >
                          {car.make} {car.model} {car.year}
                        </Link>
                        <span className="block text-xs text-muted">
                          {car.neighbourhood} · {car.seats} seats
                        </span>
                      </TD>
                      <TD>
                        <CarStatusBadge car={car} />
                      </TD>
                      <TD align="right" numeric>
                        {formatETB(car.pricePerDay)}
                      </TD>
                      <TD align="right" numeric>
                        {trips}
                      </TD>
                      <TD align="right">
                        {car.status === "approved" || car.status === "inactive" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => toggleActive(car)}
                          >
                            {car.status === "approved" && car.active
                              ? "Hide"
                              : "Activate"}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Utilisation counts booked days in the current month against 30 days per
        live car. It is a demo metric, not an accounting figure.
      </p>
    </div>
  );
}
