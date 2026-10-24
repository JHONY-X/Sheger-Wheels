"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-btn border text-sm font-medium transition-colors";
const IDLE = "border-line bg-white text-ink hover:bg-sand";
const CURRENT = "border-forest bg-forest text-white";
const DISABLED = "border-line bg-white text-muted/50 pointer-events-none";

/** 1 … 4 [5] 6 … 12 */
function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => out.add(n));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => out.add(n));

  const sorted = [...out].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) withGaps.push("gap-" + n);
    withGaps.push(n);
  });
  return withGaps;
}

function PageItem({
  target,
  children,
  isCurrent,
  isDisabled,
  label,
  getHref,
  onPageChange,
}) {
  const classes = cn(BASE, isCurrent ? CURRENT : IDLE, isDisabled && DISABLED);
  const content = children ?? target;

  if (getHref && !isDisabled) {
    return (
      <Link
        href={getHref(target)}
        aria-current={isCurrent ? "page" : undefined}
        aria-label={label}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-current={isCurrent ? "page" : undefined}
      aria-label={label}
      disabled={isDisabled}
      onClick={() => onPageChange?.(target)}
      className={classes}
    >
      {content}
    </button>
  );
}

/**
 * Pagination that keeps filters in the URL.
 * Pass `getHref(page)` for link-based navigation, or `onPageChange`.
 */
export function Pagination({ page, totalPages, getHref, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const shared = { getHref, onPageChange };

  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center gap-2", className)}>
      <PageItem
        {...shared}
        target={page - 1}
        isDisabled={page <= 1}
        label="Previous page"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2">
          <path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageItem>

      {pageList(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span key={item} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <PageItem
            {...shared}
            key={item}
            target={item}
            isCurrent={item === page}
          />
        ),
      )}

      <PageItem
        {...shared}
        target={page + 1}
        isDisabled={page >= totalPages}
        label="Next page"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2">
          <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageItem>
    </nav>
  );
}
