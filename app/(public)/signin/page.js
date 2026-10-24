import { Suspense } from "react";
import Link from "next/link";

import { SignInForm } from "@/components/auth/SignInForm";
import { Card, CardBody, CardHeader, DemoChip, Skeleton } from "@/components/ui";

export const metadata = {
  title: "Sign in",
  description: "Sign in to the Sheggar Wheels demo with a seeded account.",
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1000px] gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ochre-ink">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">Sign in</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Use a seeded demo account to see the app as a renter, an owner or the
          platform admin. No password is required.
        </p>

        <Card className="mt-6">
          <CardHeader
            title="Choose an account"
            action={<DemoChip />}
          />
          <CardBody>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <SignInForm />
            </Suspense>
          </CardBody>
        </Card>

        <p className="mt-5 text-sm text-muted">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-forest hover:underline hover:underline-offset-4"
          >
            Create a demo account
          </Link>
          .
        </p>
      </div>

      <aside className="rounded-card border border-line bg-sand/50 p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">
          What changes with the account
        </h2>
        <ul className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-ink">Renter.</span> Request dates,
            follow the booking status, review a completed trip.
          </li>
          <li>
            <span className="font-medium text-ink">Owner.</span> Publish cars,
            answer requests, block dates, reply to reviews.
          </li>
          <li>
            <span className="font-medium text-ink">Admin.</span> Approve or
            reject listings, suspend accounts, resolve disputes.
          </li>
        </ul>

        <div className="mt-6 rounded-btn border border-line bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
            Suspended demo account
          </p>
          <p className="mt-1.5 text-sm text-muted">
            Yonas is seeded as suspended. Sign in with it to see the blocked
            state — reads still work, writes are refused.
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          This is a capstone demo. There is no real authentication, no server
          session and no personal data beyond the seeded records.
        </p>
      </aside>
    </div>
  );
}
