import { cn } from "@/lib/cn";

/**
 * Semantic data table. Wrap numbers in <TD align="right" numeric>.
 * Always pass a `caption` — it becomes the screen-reader table title.
 */
export function Table({ caption, className, children }) {
  return (
    <div
      className={cn(
        // `relative` contains absolutely positioned `.sr-only` descendants
        // (e.g. the Actions column header) so they cannot widen the page.
        "relative overflow-x-auto rounded-card border border-line bg-white",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-line bg-canvas/80">{children}</thead>
  );
}

export function TH({ align = "left", className, children, scope = "col" }) {
  return (
    <th
      scope={scope}
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({ className, children }) {
  return (
    <tr className={cn("transition-colors hover:bg-canvas/70", className)}>
      {children}
    </tr>
  );
}

export function TD({ align = "left", numeric = false, className, children }) {
  return (
    <td
      data-numeric={numeric || undefined}
      className={cn(
        "px-4 py-3.5 align-middle text-ink",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}
