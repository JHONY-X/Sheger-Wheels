"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { buildStatusData } from "@/components/charts/BookingStatusChart";

const BookingStatusChart = dynamic(
  () =>
    import("@/components/charts/BookingStatusChart").then(
      (m) => m.BookingStatusChart,
    ),
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
  Input,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import {
  createAnnouncement,
  setAnnouncementActive,
} from "@/lib/domain/announcements";
import { moderateCar } from "@/lib/domain/cars";
import { resolveDispute } from "@/lib/domain/disputes";
import { setUserStatus } from "@/lib/domain/users";
import { formatDate, formatDateTime } from "@/lib/format";
import { useDemoData } from "@/lib/store";

const CAR_TONE = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
  inactive: "muted",
};

function Message({ message }) {
  if (!message) return null;

  return (
    <p
      role="status"
      className={`mb-4 rounded-btn px-3 py-2 text-sm ${message.tone === "error"
        ? "bg-danger-tint text-danger"
        : "bg-success-tint text-success"
        }`}
    >
      {message.text}
    </p>
  );
}

function DisputeRow({ dispute, booking, openedBy, onResult }) {
  const [notes, setNotes] = useState("");

  const open = dispute.status !== "resolved";

  function submit(event) {
    event.preventDefault();
    const result = resolveDispute(dispute.id, notes);
    onResult(result);
    if (result.ok) setNotes("");
  }

  return (
    <li className="border-b border-line py-4 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">
            {dispute.reason}
            <span className="ml-2 text-xs font-normal text-muted">
              {booking?.reference ?? "booking removed"}
            </span>
          </p>
          <p className="text-xs text-muted">
            Opened by {openedBy?.name ?? "unknown"} ·{" "}
            {formatDateTime(dispute.createdAt)}
          </p>
        </div>
        <Badge tone={open ? "danger" : "success"} dot>
          {open ? "Open" : "Resolved"}
        </Badge>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/90">
        {dispute.description}
      </p>

      {open ? (
        <form onSubmit={submit} className="mt-3">
          <label
            htmlFor={`notes-${dispute.id}`}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Resolution notes
          </label>
          <textarea
            id={`notes-${dispute.id}`}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What was agreed? This is stored with the dispute."
            className="w-full rounded-btn border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/80"
          />
          <Button type="submit" size="sm" className="mt-2">
            Resolve dispute
          </Button>
        </form>
      ) : (
        <p className="mt-2 rounded-btn bg-success-tint px-3 py-2 text-sm text-success">
          <span className="font-medium">Resolution: </span>
          {dispute.resolutionNotes}
          <span className="mt-1 block text-xs opacity-80">
            {dispute.resolvedAt ? formatDateTime(dispute.resolvedAt) : ""}
          </span>
        </p>
      )}
    </li>
  );
}

export function AdminClient() {
  const data = useDemoData();
  const [message, setMessage] = useState(null);
  const [announcementKey, setAnnouncementKey] = useState(0);

  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const pending = data.cars.filter((car) => car.status === "pending");
  const openDisputes = data.disputes.filter((item) => item.status !== "resolved");
  const statusData = buildStatusData(data.bookings);

  function notify(result, successText) {
    setMessage(
      result.ok
        ? { tone: "success", text: successText }
        : { tone: "error", text: result.message },
    );
  }

  function moderate(car, status) {
    const question =
      status === "approved"
        ? `Approve ${car.make} ${car.model}? It becomes visible in the catalogue.`
        : `Reject ${car.make} ${car.model}?`;
    if (!window.confirm(question)) return;

    notify(moderateCar(car.id, status), `Listing ${status}.`);
  }

  function toggleUser(target) {
    const next = target.status === "suspended" ? "active" : "suspended";
    if (!window.confirm(`${next === "suspended" ? "Suspend" : "Reinstate"} ${target.name}?`)) {
      return;
    }
    notify(setUserStatus(target.id, next), `${target.name} is now ${next}.`);
  }

  function postAnnouncement(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const result = createAnnouncement({
      title: values.get("title"),
      message: values.get("message"),
    });

    notify(result, "Announcement published to the public banner.");
    if (result.ok) setAnnouncementKey((key) => key + 1);
  }

  function toggleAnnouncement(announcement) {
    notify(
      setAnnouncementActive(announcement.id, !announcement.active),
      announcement.active ? "Announcement hidden." : "Announcement shown.",
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink">Admin</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Moderation, accounts, disputes and the public banner. Admin screens
            are reachable only by the seeded admin account.
          </p>
        </div>
        <Badge tone="warning" dot>
          admin · {user?.name}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending listings" value={pending.length} hint="Waiting for review" />
        <StatCard label="Open disputes" value={openDisputes.length} hint="Need a decision" />
        <StatCard label="Accounts" value={data.users.length} hint="Demo accounts only" />
        <StatCard label="Bookings" value={data.bookings.length} hint="All time" />
      </div>

      <div className="mt-6">
        <Message message={message} />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Bookings by status"
          description="Distribution of all platform bookings across lifecycle states."
        />
        <CardBody>
          <BookingStatusChart data={statusData} />
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Listings"
          description="Approve a pending car to publish it, or reject it with the reason carried by its status."
        />
        <CardBody>
          <Table caption="All listings">
            <THead>
              <TR>
                <TH>Car</TH>
                <TH>Owner</TH>
                <TH>Status</TH>
                <TH>Added</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {data.cars.map((car) => {
                const owner = data.users.find((item) => item.id === car.ownerId);

                return (
                  <TR key={car.id}>
                    <TD>
                      <span className="font-medium text-ink">
                        {car.make} {car.model} {car.year}
                      </span>
                      <span className="block text-xs text-muted">
                        {car.neighbourhood} · ETB {car.pricePerDay}/day
                      </span>
                    </TD>
                    <TD>{owner?.name ?? "—"}</TD>
                    <TD>
                      <Badge tone={CAR_TONE[car.status] ?? "neutral"} dot>
                        {car.status}
                      </Badge>
                    </TD>
                    <TD>{formatDate(car.createdAt.slice(0, 10))}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-1.5">
                        {car.status !== "approved" && (
                          <Button
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => moderate(car, "approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {car.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => moderate(car, "rejected")}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Disputes"
          description="Resolving records the note, the admin and the timestamp, and closes the booking."
        />
        <CardBody>
          {data.disputes.length === 0 ? (
            <p className="text-sm text-muted">No disputes have been raised.</p>
          ) : (
            <ul>
              {[...data.disputes]
                .sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved"))
                .map((dispute) => (
                  <DisputeRow
                    key={dispute.id}
                    dispute={dispute}
                    booking={data.bookings.find(
                      (item) => item.id === dispute.bookingId,
                    )}
                    openedBy={data.users.find(
                      (item) => item.id === dispute.openedBy,
                    )}
                    onResult={(result) =>
                      notify(result, "Dispute resolved and booking closed.")
                    }
                  />
                ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Accounts"
          description="Suspending keeps the account readable but refuses every write."
        />
        <CardBody>
          <Table caption="Demo accounts">
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Roles</TH>
                <TH>Status</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {data.users.map((account) => (
                <TR key={account.id}>
                  <TD>
                    <span className="font-medium text-ink">{account.name}</span>
                    {account.id === user?.id && (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    )}
                  </TD>
                  <TD>{account.email}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {account.roles.map((role) => (
                        <Badge key={role} tone="neutral">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TD>
                  <TD>
                    <Badge
                      tone={account.status === "active" ? "success" : "danger"}
                      dot
                    >
                      {account.status}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <Button
                      size="sm"
                      variant={account.status === "active" ? "ghost" : "secondary"}
                      className="h-8 px-2.5 text-xs"
                      disabled={account.id === user?.id}
                      onClick={() => toggleUser(account)}
                    >
                      {account.status === "active" ? "Suspend" : "Reinstate"}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader
            title="New announcement"
            description="Active announcements appear above the header on every page."
          />
          <CardBody>
            <form key={announcementKey} onSubmit={postAnnouncement}>
              <Input
                name="title"
                label="Title"
                required
                placeholder="Holiday availability"
              />
              <div className="mt-4">
                <label
                  htmlFor="announcement-message"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Message
                </label>
                <textarea
                  id="announcement-message"
                  name="message"
                  rows={3}
                  required
                  placeholder="At least 10 characters."
                  className="w-full rounded-btn border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/80"
                />
              </div>
              <Button type="submit" size="sm" className="mt-3">
                Publish
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Announcements" />
          <CardBody>
            {data.announcements.length === 0 ? (
              <p className="text-sm text-muted">No announcements yet.</p>
            ) : (
              <ul className="space-y-3">
                {[...data.announcements]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((announcement) => (
                    <li
                      key={announcement.id}
                      className="rounded-btn border border-line px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {announcement.title}
                          </p>
                          <p className="mt-0.5 text-sm text-muted">
                            {announcement.message}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 shrink-0 px-2.5 text-xs"
                          onClick={() => toggleAnnouncement(announcement)}
                        >
                          {announcement.active ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
