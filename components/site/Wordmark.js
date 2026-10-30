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
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-lg bg-forest text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4.5 stroke-white stroke-[2.2]">
              <path d="M12 2L3 21h4.5l2.25-5.5h4.5L16.5 21H21L12 2z" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-sm font-bold tracking-[0.15em] text-ink">
              SHEGGAR WHEELS
            </span>
            {!compact && (
              <span className="-mt-0.5 text-[9px] font-medium tracking-[0.18em] text-muted">
                CAR RENTAL
              </span>
            )}
          </div>
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
