import { cn } from "@/lib/cn";

/** Dashboard metric. Numeric values use tabular figures. */
export function StatCard({ label, value, hint, delta, className }) {
  const up = delta?.direction === "up";

  return (
    <div
      className={cn(
        "rounded-card border border-line bg-white p-5 shadow-card",
        className,
      )}
    >
      <p className="text-sm text-muted">{label}</p>
      <p
        data-numeric
        className="mt-2 text-3xl font-semibold tracking-tight text-ink"
      >
        {value}
      </p>
      {(hint || delta) && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                up ? "text-success" : "text-danger",
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className={cn("size-3.5 fill-current", !up && "rotate-180")}
              >
                <path d="M10 4l6 8H4l6-8Z" />
              </svg>
              {delta.value}
            </span>
          )}
          {hint && <span className="text-muted">{hint}</span>}
        </div>
      )}
    </div>
  );
}
