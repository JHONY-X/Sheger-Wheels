import Link from "next/link";

import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardBody, CardHeader, DemoChip } from "@/components/ui";

export const metadata = {
  title: "Create a demo account",
  description:
    "Create a local demo account for Sheggar Wheels. Records stay in this browser.",
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1000px] gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ochre-ink">
          Join the demo
        </p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">Create an account</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Rent a car from a neighbour, or add the owner role and start listing.
          Everything stays in this browser.
        </p>

        <Card className="mt-6">
          <CardHeader title="Your details" action={<DemoChip />} />
          <CardBody>
            <SignUpForm />
          </CardBody>
        </Card>

        <p className="mt-5 text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-forest hover:underline hover:underline-offset-4"
          >
            Sign in
          </Link>
          .
        </p>
      </div>

      <aside className="rounded-card border border-line bg-sand/50 p-6">
        <h2 className="font-sans text-sm font-semibold text-ink">
          What happens next
        </h2>
        <ol className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-ink">1. Account created.</span> A
            record is written to this browser&apos;s localStorage.
          </li>
          <li>
            <span className="font-medium text-ink">2. Signed in.</span> Your
            session id goes to sessionStorage and clears when the tab closes.
          </li>
          <li>
            <span className="font-medium text-ink">3. Browse.</span> You are
            taken to the catalogue with your account active in the header.
          </li>
        </ol>

        <div className="mt-6 rounded-btn border border-ochre/25 bg-ochre-tint px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ochre-ink">
            Demo boundary
          </p>
          <p className="mt-1.5 text-sm text-ink/80">
            No password, email or phone number leaves this device. Do not enter
            real personal details.
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Owner tools (listing a car, accepting requests) are the next screen in
          the build. The account already carries the role so nothing needs to be
          migrated later.
        </p>
      </aside>
    </div>
  );
}
