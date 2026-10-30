"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button, DemoChip } from "@/components/ui";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/session";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Fleet" },
  { href: "/#chauffeur", label: "Chauffeur" },
  { href: "/#for-owners", label: "For Owners" },
  { href: "/#about", label: "About" },
];

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function SiteHeader({ premium = false }) {
  const data = useDemoData();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = hydrated && data.session?.userId
    ? data.users.find((item) => item.id === data.session.userId) ?? null
    : null;

  return (
    <header className={cn("sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur", premium && "premium-header")}>
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-10">
          <Wordmark premium={premium} />

          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-[13px] tracking-wide font-medium transition-colors hover:text-white",
                    active ? "text-white font-semibold underline underline-offset-8 decoration-blue-500 decoration-2" : "text-muted hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {user?.roles?.includes("admin") && (
              <Link
                href="/admin"
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-forest",
                  pathname.startsWith("/admin") ? "text-forest" : "text-ochre-ink",
                )}
              >
                Admin
              </Link>
            )}

            {user?.roles?.includes("owner") && (
              <Link
                href="/owner"
                aria-current={pathname.startsWith("/owner") ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest",
                  pathname.startsWith("/owner") ? "text-forest" : "text-ink/80",
                )}
              >
                Owner
              </Link>
            )}

            {user && (
              <Link
                href="/dashboard"
                aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest",
                  pathname.startsWith("/dashboard") ? "text-forest" : "text-ink/80",
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector like the design */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-sand/60 text-xs font-medium text-ink">
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-muted stroke-2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>EN</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-3 stroke-muted stroke-2">
              <path d="m6 8 4 4 4-4" />
            </svg>
          </div>

          <DemoChip className="hidden xl:inline-flex" />

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {user.roles.includes("admin") ? (
                <Button size="sm" href="/admin">
                  Admin panel
                </Button>
              ) : user.roles.includes("owner") ? (
                <Button size="sm" variant="secondary" href="/owner">
                  Owner portal
                </Button>
              ) : (
                <Button size="sm" variant="secondary" href="/dashboard">
                  Dashboard
                </Button>
              )}

              <Link
                href={user.roles.includes("admin") ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              >
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400 border border-blue-500/20"
                >
                  {initials(user.name)}
                </span>
                <span className="max-w-[10rem] truncate font-medium text-ink">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/signin"
                className="flex items-center gap-1.5 text-xs font-medium text-ink/90 hover:text-white px-2 py-1.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Sign In</span>
              </Link>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all flex items-center gap-1.5"
                size="sm"
                href="/cars"
              >
                <span>Reserve a Car</span>
                <svg viewBox="0 0 20 20" fill="none" className="size-3.5 stroke-white stroke-2">
                  <path d="M4 10h12M12 6l4 4-4 4" />
                </svg>
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-11 shrink-0 items-center justify-center rounded-btn border border-line bg-white text-ink md:hidden"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="size-5 fill-none stroke-current stroke-[1.75]"
            >
              {menuOpen ? (
                <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-btn px-2 py-2.5 text-sm font-medium text-ink hover:bg-sand"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              {user ? (
                <>
                  <p className="px-2 text-sm text-muted">
                    Signed in as <span className="font-medium text-ink">{user.name}</span>
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="sm" href="/signin">
                    Sign in
                  </Button>
                  <Button size="sm" href="/signup">
                    List your car
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
