"use client";

import { cn } from "@/lib/cn";

/**
 * Segmented control for exclusive choices (transmission, sort, chart range).
 * Buttons with aria-pressed — keyboard operable without a mouse.
 */
export function Segmented({ options, value, onChange, label, className }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-btn border border-line bg-white p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "h-11 min-w-11 shrink-0 rounded-[9px] px-3 text-sm font-medium transition-colors",
              active
                ? "bg-forest text-white"
                : "text-muted hover:bg-sand hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
