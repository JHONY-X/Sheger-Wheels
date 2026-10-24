import { cn } from "@/lib/cn";

/**
 * Empty and filtered-empty states. `action` is a Button.
 * `tone="error"` styles the same shell for recoverable failures.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "default",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border px-6 py-14 text-center",
        tone === "error"
          ? "border-danger/20 bg-danger-tint"
          : "border-line bg-sand/60",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-full",
            tone === "error"
              ? "bg-white text-danger"
              : "bg-white text-forest",
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
