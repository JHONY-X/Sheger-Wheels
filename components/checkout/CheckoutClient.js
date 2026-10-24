"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoChip,
  EmptyState,
  Input,
  StatusBadge,
} from "@/components/ui";
import { transitionBooking } from "@/lib/booking-state";
import { completeMockPayment } from "@/lib/domain/bookings";
import { formatDate, formatETB } from "@/lib/format";
import { CHECKOUT_DRAFT_KEY, readSession, removeSession } from "@/lib/storage";
import { useDemoData } from "@/lib/store";

/** The one screen that pretends to take money, and says so out loud. */
export function CheckoutClient() {
  const data = useDemoData();
  const router = useRouter();

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  /* Mounted only after hydration, so sessionStorage is safe to read here. */
  const [draft] = useState(() => readSession(CHECKOUT_DRAFT_KEY, null));
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [paid, setPaid] = useState(null);
  const [error, setError] = useState(null);

  const booking = draft?.bookingId
    ? data.bookings.find((item) => item.id === draft.bookingId) ?? null
    : null;
  const car = booking
    ? data.cars.find((item) => item.id === booking.carId) ?? null
    : null;

  if (!draft || !booking) {
    return (
      <EmptyState
        title="No checkout in progress"
        description="Start from a car you like, choose your dates and send a request. The mock payment step opens from there."
        action={<Button href="/cars">Browse cars</Button>}
      />
    );
  }

  if (booking.renterId !== user?.id) {
    return (
      <EmptyState
        tone="error"
        title="This checkout belongs to another renter"
        description="The draft in this tab points at a booking you did not make. Nothing has been charged."
        action={
          <Button href="/bookings" variant="secondary">
            Go to my bookings
          </Button>
        }
      />
    );
  }

  if (paid || booking.paymentStatus === "paid") {
    const settled = paid ?? booking;

    return (
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone="success" dot>
              Payment simulated
            </Badge>
            <DemoChip />
          </div>

          <h1 className="mt-4 text-2xl text-ink">You&apos;re all set</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            Booking <span className="font-medium text-ink">{settled.reference}</span>{" "}
            is marked paid in this browser. The owner still has to approve the
            request, so watch the status on the booking page.
          </p>

          <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                TeleBirr reference
              </dt>
              <dd data-numeric className="mt-1 font-medium text-ink">
                {settled.transactionRef}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                Amount
              </dt>
              <dd data-numeric className="mt-1 font-medium text-ink">
                {formatETB(settled.total)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                Dates
              </dt>
              <dd className="mt-1 text-ink">
                {formatDate(settled.startDate)} → {formatDate(settled.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                Status
              </dt>
              <dd className="mt-1">
                <StatusBadge status={settled.status} />
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/bookings/${settled.id}`}>View booking</Button>
            <Button href="/cars" variant="secondary">
              Keep browsing
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-muted">
            Nothing left this browser: no wallet was contacted, no card was
            stored and no money moved. The reference is generated locally.
          </p>
        </CardBody>
      </Card>
    );
  }

  const payable = ["requested", "confirmed"].includes(booking.status);

  if (!payable) {
    return (
      <EmptyState
        title="This booking can no longer be paid"
        description={`Its status is “${booking.status}”, so the demo checkout is closed. Open the booking to see what happened.`}
        action={
          <Button href={`/bookings/${booking.id}`}>View booking</Button>
        }
      />
    );
  }

  function handlePay(event) {
    event.preventDefault();
    setError(null);

    if (String(phone).replace(/\D/g, "").length < 7) {
      setError("Enter the phone number the demo wallet should show.");
      return;
    }

    const result = completeMockPayment(booking.id);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    removeSession(CHECKOUT_DRAFT_KEY);
    setPaid(result.booking);
  }

  function handleCancel() {
    const result = transitionBooking(booking.id, "cancel");
    if (!result.ok) {
      setError(result.message);
      return;
    }
    removeSession(CHECKOUT_DRAFT_KEY);
    router.push("/bookings");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ochre-ink">
          Step 2 of 2
        </p>
        <h1 className="mt-2 text-3xl text-ink">Checkout</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Confirm the details and run the simulated TeleBirr payment. The owner
          is asked to approve the dates afterwards.
        </p>

        <Card className="mt-6">
          <CardHeader
            title={car ? `${car.make} ${car.model} ${car.year}` : "Your car"}
            description={car ? `${car.neighbourhood} · ${car.city}` : undefined}
            action={<StatusBadge status={booking.status} />}
          />
          <CardBody>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Reference</dt>
                <dd data-numeric className="font-medium text-ink">
                  {booking.reference}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Dates</dt>
                <dd className="text-ink">
                  {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">
                  {formatETB(booking.pricePerDay)} × {booking.days}{" "}
                  {booking.days === 1 ? "day" : "days"}
                </dt>
                <dd data-numeric className="text-ink">
                  {formatETB(booking.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Service fee</dt>
                <dd data-numeric className="text-ink">
                  {formatETB(booking.fee)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                <dt className="font-medium text-ink">Total</dt>
                <dd data-numeric className="text-lg font-semibold text-ink">
                  {formatETB(booking.total)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-muted">
              Paying now only marks the request as paid. If the owner declines,
              a real marketplace would refund you — here the demo simply ends
              the booking.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3 rounded-t-card bg-forest px-5 py-4">
          <p className="text-sm font-semibold text-white">TeleBirr</p>
          <Badge tone="onDark">Simulation</Badge>
        </div>

        <CardBody>
          <form onSubmit={handlePay}>
            <Input
              label="Wallet phone number"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              hint="Prefilled from the demo account. Nothing is sent to Ethio Telecom."
            />

            <div className="mt-4 flex items-center justify-between rounded-btn bg-sand px-4 py-3">
              <span className="text-sm text-muted">Amount due</span>
              <span data-numeric className="text-lg font-semibold text-ink">
                {formatETB(booking.total)}
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-btn bg-danger-tint px-3 py-2 text-sm text-danger"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-4 w-full">
              Pay {formatETB(booking.total)}
            </Button>

            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 w-full rounded-btn px-3 py-2 text-sm font-medium text-danger hover:bg-danger-tint"
            >
              Cancel this request
            </button>
          </form>

          <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            This button does not contact a payment provider. It writes a
            transaction reference and <code>paymentStatus: &quot;paid&quot;</code> to
            this browser&apos;s localStorage so the rest of the flow can be
            demonstrated.
          </p>

          <Link
            href={`/cars/${booking.carId}`}
            className="mt-3 inline-block text-sm font-medium text-forest hover:underline hover:underline-offset-4"
          >
            Back to the car
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
