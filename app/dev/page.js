"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoChip,
} from "@/components/ui";
import { refresh, useDemoData } from "@/lib/store";
import { resetDemoData } from "@/lib/storage";
import {
  getCurrentUser,
  getSession,
  safeReturnPath,
  signInAsDemo,
  signOut,
} from "@/lib/session";
import { getBookings, requestBooking } from "@/lib/domain/bookings";
import { getCarById, saveCar } from "@/lib/domain/cars";
import { transitionBooking } from "@/lib/booking-state";
import { can } from "@/lib/permissions";
import { addDaysISO, todayISO } from "@/lib/dates";
import { SEED_CAR_IDS } from "@/lib/seed/cars";
import { SEED_BOOKING_IDS } from "@/lib/seed/bookings";

const ACCOUNTS = [
  { id: "usr_dawit", label: "Dawit", role: "renter" },
  { id: "usr_selam", label: "Selam", role: "owner" },
  { id: "usr_hanna", label: "Hanna", role: "owner" },
  { id: "usr_admin", label: "Admin", role: "admin" },
  { id: "usr_yonas", label: "Yonas", role: "suspended" },
];

const day = (offset) => addDaysISO(todayISO(), offset);

/**
 * Calls the real domain functions. If a guard is removed from the
 * implementation, the matching check starts failing — that is the point.
 */
function runChecks() {
  const original = getSession();
  const results = [];

  const check = (name, expectation, fn) => {
    try {
      const { pass, detail } = fn();
      results.push({ name, expectation, pass, detail });
    } catch (error) {
      results.push({
        name,
        expectation,
        pass: false,
        detail: `threw: ${error.message}`,
      });
    }
  };

  check("1. Signed-out write is refused", "NOT_SIGNED_IN, no record written", () => {
    signOut();
    const before = getBookings().length;
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(70),
      endDate: day(72),
    });
    const after = getBookings().length;
    return {
      pass: result.ok === false && result.code === "NOT_SIGNED_IN" && before === after,
      detail: `code=${result.code}, bookings ${before} → ${after}`,
    };
  });

  check("2. Cross-user cancel is refused", "NOT_YOURS, status unchanged", () => {
    signInAsDemo("usr_marta");
    const result = transitionBooking(SEED_BOOKING_IDS.requested, "cancel");
    return { pass: result.ok === false && result.code === "NOT_YOURS", detail: `code=${result.code}` };
  });

  check("3. Unsafe return URL is rejected", "absolute URL → /dashboard", () => {
    const absolute = safeReturnPath("https://example.com");
    const protocolRelative = safeReturnPath("//example.com");
    return {
      pass: absolute === "/dashboard" && protocolRelative === "/dashboard",
      detail: `https=${absolute}, //=${protocolRelative}`,
    };
  });

  check("4. Owner cannot edit another owner's car", "NOT_YOURS", () => {
    signInAsDemo("usr_hanna");
    const car = getCarById(SEED_CAR_IDS.vitz);
    const result = saveCar({ ...car, pricePerDay: 2600 }, { id: car.id });
    return { pass: result.ok === false && result.code === "NOT_YOURS", detail: `code=${result.code}` };
  });

  check("5. Renter cannot open another renter's booking", "can() is false", () => {
    signInAsDemo("usr_marta");
    const booking = getBookings().find((item) => item.id === SEED_BOOKING_IDS.requested);
    const allowed = can(getCurrentUser(), "viewBooking", booking);
    return { pass: allowed === false, detail: `can(viewBooking)=${allowed}` };
  });

  check("6. Suspended account is blocked", "ACCOUNT_SUSPENDED", () => {
    signInAsDemo("usr_yonas");
    const result = requestBooking({
      carId: SEED_CAR_IDS.vitz,
      startDate: day(80),
      endDate: day(82),
    });
    return { pass: result.ok === false && result.code === "ACCOUNT_SUSPENDED", detail: `code=${result.code}` };
  });

  // Put the session back the way the reviewer left it.
  signOut();
  if (original?.userId) signInAsDemo(original.userId);

  return results;
}

export default function DevPage() {
  const data = useDemoData();
  const [results, setResults] = useState([]);

  /* Derived from the snapshot, never read storage during render. */
  const user = data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  const passed = results.filter((result) => result.pass).length;

  return (
    <main id="main" className="mx-auto w-full max-w-[1000px] px-6 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link href="/" className="text-sm font-medium text-forest hover:underline hover:underline-offset-4">
            ← Sheggar Wheels
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Developer tools</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Inspect the demo data layer and run the misuse tests from the brief.
            Every check calls the same function the app calls.
          </p>
        </div>
        <DemoChip />
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Storage"
            description="Records persist in this browser only."
            action={
              <Badge tone={data.storage.available ? "success" : "danger"}>
                {data.storage.available ? "localStorage" : "blocked"}
              </Badge>
            }
          />
          <CardBody className="space-y-4">
            <dl className="grid grid-cols-3 gap-3">
              {[
                ["users", data.users.length],
                ["cars", data.cars.length],
                ["bookings", data.bookings.length],
                ["reviews", data.reviews.length],
                ["disputes", data.disputes.length],
                ["announcements", data.announcements.length],
              ].map(([label, count]) => (
                <div key={label} className="rounded-btn border border-line px-3 py-2">
                  <dt className="break-words text-[10px] uppercase tracking-[0.04em] text-muted">
                    {label}
                  </dt>
                  <dd data-numeric className="mt-0.5 text-lg font-semibold text-ink">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>

            {data.storage.recoveredKeys.length > 0 && (
              <div className="rounded-btn border border-ochre/30 bg-ochre-tint p-3 text-sm text-ochre-ink">
                Repaired unreadable keys: {data.storage.recoveredKeys.join(", ")}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  resetDemoData();
                  refresh();
                  setResults([]);
                }}
              >
                Reset demo data
              </Button>
              <p className="text-xs text-muted">Restores seed records in this browser.</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Demo session"
            description="Switch role without a password. Only the user id is stored."
          />
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {ACCOUNTS.map((account) => (
                <Button
                  key={account.id}
                  size="sm"
                  variant={user?.id === account.id ? "primary" : "secondary"}
                  onClick={() => signInAsDemo(account.id)}
                >
                  {account.label}
                </Button>
              ))}
            </div>

            <div className="rounded-btn border border-line bg-canvas p-3 text-sm">
              {user ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{user.name}</span>
                  <span className="text-muted">{user.email}</span>
                  {user.roles.map((role) => (
                    <Badge key={role} tone="neutral">{role}</Badge>
                  ))}
                  {user.status === "suspended" && <Badge tone="danger">suspended</Badge>}
                </div>
              ) : (
                <span className="text-muted">Signed out</span>
              )}
            </div>

            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              Sign out
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Misuse checks"
          description="Six scenarios from §8 and §8.1. A failure means a guard is missing."
          action={
            <Button size="sm" onClick={() => setResults(runChecks())}>
              Run checks
            </Button>
          }
        />
        <CardBody>
          {results.length === 0 ? (
            <p className="text-sm text-muted">
              No checks run yet. They only read demo data — no records are created.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge tone={passed === results.length ? "success" : "danger"}>
                  {passed}/{results.length} passed
                </Badge>
                <span className="text-sm text-muted">Session restored after the run.</span>
              </div>

              <ul className="divide-y divide-line">
                {results.map((result) => (
                  <li key={result.name} className="flex flex-wrap items-start gap-3 py-3">
                    <Badge tone={result.pass ? "success" : "danger"}>
                      {result.pass ? "PASS" : "FAIL"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{result.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Expected: {result.expectation}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted">{result.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
