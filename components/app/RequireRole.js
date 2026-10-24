"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button, EmptyState, Skeleton } from "@/components/ui";
import { signInHref, signOut } from "@/lib/session";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

function GuardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-card" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 w-full rounded-card" />
    </div>
  );
}

const ROLE_LABEL = {
  renter: "renter",
  owner: "owner",
  admin: "admin",
};

/**
 * Client-side guard for signed-in pages.
 *
 * Storage is browser-only, so the server cannot redirect. Signed-out visitors
 * are sent to /signin?next=<path>; suspended and under-privileged accounts get
 * an explanation instead of a broken screen. Every action is re-checked in
 * `lib/` regardless of what this component renders.
 */
export function RequireRole({ role, children }) {
  const data = useDemoData();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();

  const user =
    hydrated && data.session?.userId
      ? data.users.find((item) => item.id === data.session.userId) ?? null
      : null;

  useEffect(() => {
    if (hydrated && !user) router.replace(signInHref(pathname));
  }, [hydrated, user, pathname, router]);

  if (!hydrated) return <GuardSkeleton />;

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-6 py-20">
        <EmptyState
          title="Redirecting to sign in"
          description="This area needs a demo account. If nothing happens, use the link below."
          action={<Button href={signInHref(pathname)}>Sign in</Button>}
        />
      </div>
    );
  }

  if (user.status === "suspended") {
    return (
      <div className="mx-auto w-full max-w-[720px] px-6 py-20">
        <EmptyState
          tone="error"
          title="This account is suspended"
          description={`${user.name} is seeded as a suspended account. Reads still work, but booking, listing and moderating are refused by the same guard that renders this panel.`}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/cars" variant="secondary">
                Browse cars
              </Button>
              <Button onClick={() => signOut()}>Sign out</Button>
            </div>
          }
        />
      </div>
    );
  }

  if (role && !user.roles.includes(role)) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-6 py-20">
        <EmptyState
          title={`This area needs the ${ROLE_LABEL[role]} role`}
          description={`${user.name} signed in with ${user.roles.join(" and ")}. The interface hides screens you cannot use, and the domain functions refuse them too.`}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/dashboard">Go to my dashboard</Button>
              <Button href="/signin" variant="secondary">
                Switch demo account
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return children;
}

/** Small helper for pages that only need "signed in", not a role. */
export function RequireUser({ children }) {
  return <RequireRole>{children}</RequireRole>;
}
