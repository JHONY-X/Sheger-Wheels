"use client";

import { useState } from "react";

import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Platform announcements. Only active ones show, newest first, and the visitor
 * can dismiss the current one for the rest of the session.
 */
export function AnnouncementBanner() {
  const data = useDemoData();
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(null);

  if (!hydrated) return null;

  const active = data.announcements
    .filter((item) => item.active)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const announcement = active.find((item) => item.id !== dismissed);
  if (!announcement) return null;

  return (
    <div className="premium-announcement border-b border-ochre/25 bg-ochre-tint">
      <div className="mx-auto flex w-full max-w-[1200px] items-start gap-3 px-6 py-2.5">
        <span
          aria-hidden
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
        />
        <p className="min-w-0 flex-1 text-sm text-ochre-ink">
          <span className="font-semibold">{announcement.title}.</span>{" "}
          <span className="text-ink/80">{announcement.message}</span>
        </p>
        <button
          type="button"
          onClick={() => setDismissed(announcement.id)}
          aria-label="Dismiss announcement"
          className="-my-2 grid size-11 shrink-0 place-items-center rounded text-ochre-ink hover:bg-white/60"
        >
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="size-4 fill-none stroke-current stroke-[1.75]"
          >
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
