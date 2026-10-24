"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Badge, Button, Input } from "@/components/ui";
import { getUserByEmail, isEmail } from "@/lib/domain/users";
import { safeReturnPath, signInAsDemo } from "@/lib/session";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

const ROLE_TONE = {
  Renter: "blue",
  Owner: "forest",
  Admin: "warning",
  Suspended: "danger",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = useDemoData();
  const hydrated = useHydrated();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const nextParam = searchParams.get("next");
  const destination = safeReturnPath(nextParam, "/");

  const accounts = [
    { id: "usr_dawit", name: "Dawit Bekele", role: "Renter", note: "Trips in every state" },
    { id: "usr_selam", name: "Selam Tesfaye", role: "Owner", note: "5 cars, 1 pending" },
    { id: "usr_hanna", name: "Hanna Girma", role: "Owner", note: "3 cars, 1 dispute" },
    { id: "usr_admin", name: "Platform Admin", role: "Admin", note: "Moderation" },
    { id: "usr_yonas", name: "Yonas Tadesse", role: "Suspended", note: "Blocked state" },
  ].map((account) => ({
    ...account,
    user: data.users.find((user) => user.id === account.id),
  }));

  function enter(userId) {
    const result = signInAsDemo(userId);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    let target = destination;
    if (!nextParam) {
      const u = data.users.find((user) => user.id === userId);
      if (u?.roles?.includes("admin")) target = "/admin";
      else if (u?.roles?.includes("owner")) target = "/owner";
      else target = "/dashboard";
    }
    router.replace(target);
  }

  function handleEmail(event) {
    event.preventDefault();
    setError(null);

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const user = getUserByEmail(email);
    if (!user) {
      setError(
        "No demo account uses that email. Pick one of the demo accounts below — no password is needed.",
      );
      return;
    }

    enter(user.id);
  }

  return (
    <div>
      {nextParam && destination !== "/" && (
        <p className="mb-4 rounded-btn border border-line bg-sand/70 px-3 py-2 text-sm text-muted">
          After signing in you will return to{" "}
          <span className="font-medium text-ink">{destination}</span>.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-btn bg-danger-tint px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleEmail}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          hint="Demo accounts only. Nothing is sent anywhere."
        />
        <Button type="submit" size="lg" className="mt-4 w-full">
          Continue
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-[0.08em] text-muted">
          or use a demo account
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <ul className="space-y-2">
        {accounts.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              disabled={!hydrated || !account.user}
              onClick={() => enter(account.id)}
              className="flex w-full items-center justify-between gap-3 rounded-btn border border-line bg-white px-3 py-2.5 text-left transition-colors hover:border-forest disabled:opacity-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {account.name}
                </span>
                <span className="block truncate text-xs text-muted">{account.note}</span>
              </span>
              <Badge tone={ROLE_TONE[account.role] ?? "neutral"}>{account.role}</Badge>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Sign-in is simulated: the app stores only the chosen user id in
        sessionStorage. There are no passwords, tokens or cookies.
      </p>
    </div>
  );
}
