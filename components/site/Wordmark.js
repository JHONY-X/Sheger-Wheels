import Link from "next/link";
import { cn } from "@/lib/cn";

/** Monogram + name. The same mark is used in the header and footer. */
export function Wordmark({ href = "/", className, compact = false, premium = false }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-btn",
        premium && "premium-wordmark",
        className,
      )}
    >
      {premium ? (
        <>
          <span aria-hidden className="premium-wordmark-mark">S</span>
          <span className="premium-wordmark-name">SHEGER</span>
          {!compact && <span className="premium-wordmark-category">WHEELS</span>}
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full border-2 border-forest"
          >
            <span className="size-2 rounded-full bg-forest" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            sheggar
          </span>
          {!compact && (
            <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
              wheels
            </span>
          )}
        </>
      )}
    </Link>
  );
}
