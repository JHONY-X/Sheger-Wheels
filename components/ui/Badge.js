import { cn } from "@/lib/cn";

const TONES = {
  neutral: "border-line bg-muted-tint text-ink/75",
  forest: "border-forest/15 bg-forest-tint text-forest",
  success: "border-success/15 bg-success-tint text-success",
  warning: "border-ochre/25 bg-ochre-tint text-ochre-ink",
  blue: "border-blue/15 bg-blue-tint text-blue",
  danger: "border-danger/15 bg-danger-tint text-danger",
  muted: "border-line bg-white text-muted",
  /* For the forest panels: gold on dark green. */
  onDark: "border-white/20 bg-white/10 text-ochre-200",
};

/** Generic pill. Text is always visible — never colour alone. */
export function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export const BOOKING_STATUS = {
  requested: { label: "Requested", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "forest" },
  in_progress: { label: "In progress", tone: "blue" },
  completed: { label: "Completed", tone: "neutral" },
  reviewed: { label: "Reviewed", tone: "muted" },
  declined: { label: "Declined", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "muted" },
  disputed: { label: "Disputed", tone: "danger" },
  resolved: { label: "Resolved", tone: "success" },
};

/** Booking lifecycle pill. Falls back to the raw value if unknown. */
export function StatusBadge({ status, className }) {
  const meta = BOOKING_STATUS[status] ?? {
    label: status,
    tone: "neutral",
  };
  return (
    <Badge tone={meta.tone} dot className={className}>
      <span className="sr-only">Status: </span>
      {meta.label}
    </Badge>
  );
}

/** Required on every page by the brief. */
export function DemoChip({ className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-ochre" />
      Demo data
    </span>
  );
}
