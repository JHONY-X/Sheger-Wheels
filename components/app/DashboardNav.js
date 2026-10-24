"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

const ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/bookings", label: "My bookings" },
  { href: "/owner", label: "Owner", role: "owner" },
  { href: "/admin", label: "Admin", role: "admin" },
];

/** Sub-navigation for the signed-in area. Items follow the account's roles. */
export function DashboardNav() {
  const data = useDemoData();
  const hydrated = useHydrated();
  const pathname = usePathname();

  const user =
    hydrated && data.session?.userId
      ? data.users.find((item) => item.id === data.session.userId) ?? null
      : null;

  const items = ITEMS.filter(
    (item) => !item.role || user?.roles.includes(item.role),
  );

  return (
    <nav aria-label="Account" className="border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] gap-1 overflow-x-auto px-6">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap px-3 py-3.5 text-sm font-medium transition-colors",
                active ? "text-forest" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-forest"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
