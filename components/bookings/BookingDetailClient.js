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
  EmptyState,
  StatusBadge,
  Textarea,
} from "@/components/ui";
import { ACTIONS, allowedActions, transitionBooking } from "@/lib/booking-state";
import { createReview, replyToReview } from "@/lib/domain/reviews";
import { openDispute } from "@/lib/domain/disputes";
import { formatDate, formatDateTime, formatETB } from "@/lib/format";
import { CHECKOUT_DRAFT_KEY, writeSession } from "@/lib/storage";
import { useDemoData } from "@/lib/store";

const STEPS = [
  { key: "requested", label: "Request sent", hint: "Waiting for the owner" },
  { key: "confirmed", label: "Confirmed", hint: "Dates approved" },
  { key: "in_progress", label: "In progress", hint: "Car collected" },
  { key: "completed", label: "Completed", hint: "Car returned" },
];

const TERMINAL_COPY = {
  declined: "The owner declined this request.",
  cancelled: "This booking was cancelled.",
  disputed: "An issue was opened on this booking.",
  resolved: "The dispute was resolved by the admin.",
};

const DISPUTE_REASONS = [
  "Car condition",
  "Late return",
  "Payment",
  "Pick-up problem",
  "Other",
];

function Stars({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} out of 5`}
          onClick={() => onChange(star)}
          className="rounded p-1"
        >
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className={star <= value ? "size-6 fill-ochre" : "size-6 fill-line"}
          >
            <path d="m10 1.8 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8 2.4-5Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function BookingDetailClient({ id }) {
  const data = useDemoData();
  const router = useRouter();

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState("");

  const booking = data.bookings.find((item) => item.id === id) ?? null;

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="This booking does not exist in this browser. Demo data can be reset from the developer tools."
        action={<Button href="/bookings">My bookings</Button>}
      />
    );
  }

  const isAdmin = Boolean(user?.roles.includes("admin"));
  const isParty = booking.renterId === user?.id || booking.ownerId === user?.id;

  if (!isParty && !isAdmin) {
    return (
      <EmptyState
        tone="error"
        title="This booking is not yours"
        description="Only the renter, the owner and the platform admin can open it. The domain layer refuses actions on other people's bookings too."
        action={<Button href="/bookings" variant="secondary">My bookings</Button>}
      />
    );
  }

  const car = data.cars.find((item) => item.id === booking.carId) ?? null;
  const renter = data.users.find((item) => item.id === booking.renterId) ?? null;
  const owner = data.users.find((item) => item.id === booking.ownerId) ?? null;
  const review = data.reviews.find((item) => item.bookingId === booking.id) ?? null;
  const dispute = data.disputes.find((item) => item.bookingId === booking.id) ?? null;

  const actions = allowedActions(booking, user);
  const stepIndex = STEPS.findIndex((step) => step.key === booking.status);
  const terminal = TERMINAL_COPY[booking.status];

  function notify(result, successText) {
    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      return false;
    }
    setMessage({ tone: "success", text: successText });
    return true;
  }

  function runAction(action) {
    if (ACTIONS[action]?.needsConfirm && !window.confirm(ACTIONS[action].needsConfirm)) {
      return;
    }

    const result = transitionBooking(booking.id, action);
    notify(result, `${ACTIONS[action].label} — done.`);
  }

  function submitReview(event) {
    event.preventDefault();
    const result = createReview({
      bookingId: booking.id,
      rating,
      comment,
    });

    if (notify(result, "Review published. The trip is now marked reviewed.")) {
      setForm(null);
      setComment("");
    }
  }

  function submitDispute(event) {
    event.preventDefault();
    const result = openDispute({
      bookingId: booking.id,
      reason,
      description,
    });

    if (notify(result, "Issue opened. The admin will see it in the dispute queue.")) {
      setForm(null);
      setDescription("");
    }
  }

  function submitReply(event) {
    event.preventDefault();
    const result = replyToReview(review.id, reply);

    if (notify(result, "Reply published. Renters see it with the review.")) {
      setReply("");
    }
  }

  function startPayment() {
    writeSession(CHECKOUT_DRAFT_KEY, {
      bookingId: booking.id,
      createdAt: new Date().toISOString(),
    });
    router.push("/checkout");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/bookings"
            className="text-sm text-muted hover:text-forest hover:underline hover:underline-offset-4"
          >
            ← My bookings
          </Link>
          <h1 data-numeric className="mt-2 text-3xl text-ink">
            {booking.reference}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <Badge tone={booking.paymentStatus === "paid" ? "success" : "warning"}>
              {booking.paymentStatus === "paid" ? "Paid (demo)" : "Unpaid"}
            </Badge>
            <span className="text-sm text-muted">
              Created {formatDateTime(booking.createdAt)}
            </span>
          </div>
        </div>

        {car && (
          <Button href={`/cars/${car.id}`} variant="secondary" size="sm">
            View car
          </Button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className={`mt-5 rounded-btn px-3 py-2 text-sm ${
            message.tone === "error"
              ? "bg-danger-tint text-danger"
              : "bg-success-tint text-success"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <Card>
            <CardHeader title="Trip" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                    Car
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {car ? `${car.make} ${car.model} ${car.year}` : "Removed listing"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                    Neighbourhood
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    {car ? `${car.neighbourhood}, ${car.city}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                    Pick-up
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    {formatDate(booking.startDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                    Return
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    {formatDate(booking.endDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.06em] text-muted">
                    Driver
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {booking.chauffeurName ? (
                      <span className="text-forest">With Chauffeur: {booking.chauffeurName}</span>
                    ) : (
                      "Self-drive (No chauffeur)"
                    )}
                  </dd>
                </div>
              </dl>

              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">
                    Car rental ({formatETB(booking.pricePerDay)} × {booking.days}{" "}
                    {booking.days === 1 ? "day" : "days"})
                  </dt>
                  <dd data-numeric className="text-ink">
                    {formatETB(booking.pricePerDay * booking.days)}
                  </dd>
                </div>
                {booking.chauffeurName && (
                  <div className="flex items-center justify-between text-forest">
                    <dt className="text-forest">
                      Chauffeur ({booking.chauffeurName})
                    </dt>
                    <dd data-numeric className="font-medium">
                      +{formatETB(booking.chauffeurTotal ?? (booking.chauffeurPricePerDay * booking.days))}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Service fee</dt>
                  <dd data-numeric className="text-ink">{formatETB(booking.fee)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd data-numeric className="text-lg font-semibold text-ink">
                    {formatETB(booking.total)}
                  </dd>
                </div>
                {booking.transactionRef && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Demo transaction</dt>
                    <dd data-numeric className="text-ink">
                      {booking.transactionRef}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader
              title="Status history"
              description="Every change goes through the same guarded transition."
            />
            <CardBody>
              {terminal ? (
                <p className="text-sm text-danger">{terminal}</p>
              ) : (
                <ol className="space-y-4">
                  {STEPS.map((step, index) => {
                    const done =
                      booking.status === "reviewed" || index <= stepIndex;
                    const current =
                      booking.status !== "reviewed" && index === stepIndex;

                    return (
                      <li key={step.key} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            done
                              ? "bg-forest text-white"
                              : "border border-line bg-white text-muted"
                          }`}
                        >
                          {done ? "✓" : index + 1}
                        </span>
                        <div>
                          <p
                            className={
                              done
                                ? "text-sm font-medium text-ink"
                                : "text-sm text-muted"
                            }
                          >
                            {step.label}
                            {current && (
                              <span className="ml-2 text-xs font-normal text-forest">
                                current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">{step.hint}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>

          {review && (
            <Card className="mt-6">
              <CardHeader title="Review" />
              <CardBody>
                <p className="text-sm font-medium text-ink">
                  {review.rating} / 5
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/90">
                  {review.comment}
                </p>
                {review.ownerReply && (
                  <p className="mt-3 rounded-btn bg-canvas px-3 py-2 text-sm text-muted">
                    <span className="font-medium text-ink">Owner reply: </span>
                    {review.ownerReply}
                  </p>
                )}
                {review.ownerId === user?.id && !review.ownerReply && (
                  <form
                    onSubmit={submitReply}
                    className="mt-4 border-t border-line pt-4"
                  >
                    <Textarea
                      label="Your reply"
                      rows={3}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      hint="At least 5 characters. One reply per review, visible with the review."
                    />
                    <Button type="submit" size="sm" className="mt-3">
                      Publish reply
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          )}

          {dispute && (
            <Card className="mt-6">
              <CardHeader
                title="Dispute"
                description={`${dispute.reason} · ${dispute.status}`}
              />
              <CardBody>
                <p className="text-sm leading-relaxed text-ink/90">
                  {dispute.description}
                </p>
                {dispute.resolutionNotes && (
                  <p className="mt-3 rounded-btn bg-success-tint px-3 py-2 text-sm text-success">
                    <span className="font-medium">Resolution: </span>
                    {dispute.resolutionNotes}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader title="Actions" />
            <CardBody>
              <div className="flex flex-col gap-2">
                {actions
                  .filter((action) => action !== "resolve")
                  .map((action) => {
                    const meta = ACTIONS[action];

                    if (action === "review") {
                      return (
                        <Button
                          key={action}
                          onClick={() =>
                            setForm(form === "review" ? null : "review")
                          }
                        >
                          {meta.label}
                        </Button>
                      );
                    }

                    if (action === "dispute") {
                      return (
                        <Button
                          key={action}
                          variant="secondary"
                          onClick={() =>
                            setForm(form === "dispute" ? null : "dispute")
                          }
                        >
                          {meta.label}
                        </Button>
                      );
                    }

                    return (
                      <Button
                        key={action}
                        variant={meta.variant}
                        onClick={() => runAction(action)}
                      >
                        {meta.label}
                      </Button>
                    );
                  })}

                {booking.paymentStatus !== "paid" &&
                  ["requested", "confirmed"].includes(booking.status) &&
                  booking.renterId === user?.id && (
                    <Button variant="secondary" onClick={startPayment}>
                      Complete demo payment
                    </Button>
                  )}

                {isAdmin && booking.status === "disputed" && dispute && (
                  <Button href="/admin" variant="secondary">
                    Resolve in admin
                  </Button>
                )}
              </div>

              {actions.length === 0 && (
                <p className="mt-1 text-sm text-muted">
                  No further changes are possible in this state.
                </p>
              )}

              {form === "review" && (
                <form
                  onSubmit={submitReview}
                  className="mt-4 border-t border-line pt-4"
                >
                  <p className="text-sm font-medium text-ink">
                    How was the trip?
                  </p>
                  <div className="mt-2">
                    <Stars value={rating} onChange={setRating} />
                  </div>
                  <div className="mt-3">
                    <Textarea
                      label="Comment"
                      rows={3}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      hint="At least 10 characters."
                    />
                  </div>
                  <Button type="submit" size="sm" className="mt-3 w-full">
                    Publish review
                  </Button>
                </form>
              )}

              {form === "dispute" && (
                <form
                  onSubmit={submitDispute}
                  className="mt-4 border-t border-line pt-4"
                >
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="dispute-reason"
                        className="mb-1.5 block text-sm font-medium text-ink"
                      >
                        Reason
                      </label>
                      <select
                        id="dispute-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        className="h-11 w-full rounded-btn border border-line bg-white px-3 text-sm text-ink"
                      >
                        {DISPUTE_REASONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Textarea
                      label="What happened?"
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      hint="At least 15 characters."
                    />
                  </div>
                  <Button type="submit" size="sm" className="mt-3 w-full">
                    Open dispute
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="People" />
            <CardBody>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.06em] text-muted">
                    Renter
                  </p>
                  <p className="mt-0.5 font-medium text-ink">
                    {renter?.name ?? "Deleted account"}
                  </p>
                  <p className="text-xs text-muted">{renter?.email}</p>
                </div>
                <div className="border-t border-line pt-3">
                  <p className="text-xs uppercase tracking-[0.06em] text-muted">
                    Owner
                  </p>
                  <p className="mt-0.5 font-medium text-ink">
                    {owner?.name ?? "Deleted account"}
                  </p>
                  <p className="text-xs text-muted">{owner?.email}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
