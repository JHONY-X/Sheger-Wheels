"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Badge,
  Button,
  EmptyState,
  Input,
  Select,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatDate, formatETB } from "@/lib/format";
import { useDemoData } from "@/lib/store";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "upcoming", label: "Upcoming" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "reviewed", label: "Reviewed" },
  { value: "cancelled", label: "Cancelled / declined" },
  { value: "disputed", label: "Disputed" },
];

export function BookingsClient() {
  const data = useDemoData();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  /* Rows are scoped to the signed-in renter from the very first line. */
  const mine = data.bookings
    .filter((booking) => booking.renterId === user?.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const needle = query.trim().toLowerCase();

  const rows = mine.filter((booking) => {
    const car = data.cars.find((item) => item.id === booking.carId);
    const matchesQuery =
      !needle ||
      booking.reference.toLowerCase().includes(needle) ||
      `${car?.make ?? ""} ${car?.model ?? ""}`.toLowerCase().includes(needle);

    if (!matchesQuery) return false;

    if (status === "all") return true;
    if (status === "upcoming") {
      return ["requested", "confirmed", "in_progress"].includes(booking.status);
    }
    if (status === "cancelled") {
      return ["cancelled", "declined"].includes(booking.status);
    }
    return booking.status === status;
  });

  function exportCsv() {
    const columns = [
      { key: "reference", label: "Reference" },
      { key: "car", label: "Car" },
      { key: "startDate", label: "Pick-up" },
      { key: "endDate", label: "Return" },
      { key: "days", label: "Days" },
      { key: "status", label: "Status" },
      { key: "paymentStatus", label: "Payment" },
      { key: "total", label: "Total ETB" },
    ];

    const csvRows = rows.map((booking) => {
      const car = data.cars.find((item) => item.id === booking.carId);
      return {
        reference: booking.reference,
        car: car ? `${car.make} ${car.model} ${car.year}` : "Removed listing",
        startDate: booking.startDate,
        endDate: booking.endDate,
        days: booking.days,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        total: booking.total,
      };
    });

    downloadCsv(
      `sheggar-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(csvRows, columns),
    );
  }

  const spent = mine
    .filter((booking) =>
      ["confirmed", "in_progress", "completed", "reviewed", "resolved"].includes(
        booking.status,
      ),
    )
    .reduce((sum, booking) => sum + booking.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink">My bookings</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Every request you have made, newest first. Totals count confirmed
            and finished trips.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={exportCsv}
          disabled={rows.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="neutral">{mine.length} total</Badge>
        <Badge tone="forest">
          {mine.filter((b) => ["requested", "confirmed", "in_progress"].includes(b.status)).length}{" "}
          upcoming
        </Badge>
        <Badge tone="success">{formatETB(spent)} committed</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input
          label="Search"
          type="search"
          placeholder="Reference or car"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {mine.length === 0 ? (
          <EmptyState
            title="No trips yet"
            description="Request a car and it will appear here with its live status. The demo seeded bookings belong to Dawit, so sign in as Dawit to see them."
            action={<Button href="/cars">Browse cars</Button>}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No bookings match"
            description="Try another status or clear the search."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <Table caption="Your bookings">
            <THead>
              <TR>
                <TH>Reference</TH>
                <TH>Car</TH>
                <TH>Dates</TH>
                <TH>Status</TH>
                <TH align="right">Total</TH>
                <TH>
                  <span className="sr-only">Open</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((booking) => {
                const car = data.cars.find((item) => item.id === booking.carId);

                return (
                  <TR key={booking.id}>
                    <TD>
                      <Link
                        href={`/bookings/${booking.id}`}
                        data-numeric
                        className="font-medium text-forest hover:underline hover:underline-offset-4"
                      >
                        {booking.reference}
                      </Link>
                      {booking.paymentStatus !== "paid" && (
                        <span className="mt-1 block text-xs text-ochre-ink">
                          Unpaid
                        </span>
                      )}
                    </TD>
                    <TD>
                      <span className="block font-medium text-ink">
                        {car ? `${car.make} ${car.model}` : "Removed listing"}
                      </span>
                      <span className="text-xs text-muted">
                        {car ? `${car.neighbourhood} · ${car.year}` : "—"}
                      </span>
                    </TD>
                    <TD>
                      <span className="block text-ink">
                        {formatDate(booking.startDate)}
                      </span>
                      <span className="text-xs text-muted">
                        to {formatDate(booking.endDate)} · {booking.days}{" "}
                        {booking.days === 1 ? "day" : "days"}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={booking.status} />
                    </TD>
                    <TD align="right" numeric>
                      {formatETB(booking.total)}
                    </TD>
                    <TD align="right">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="text-sm font-medium text-forest hover:underline hover:underline-offset-4"
                      >
                        Open
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        CSV export contains only the rows above. Commas, quotes and newlines are
        escaped, and values starting with = + - @ are prefixed so a spreadsheet
        cannot execute them.
      </p>
    </div>
  );
}
