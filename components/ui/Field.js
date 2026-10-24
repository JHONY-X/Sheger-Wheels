"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

const CONTROL =
  "w-full rounded-btn border bg-white px-3 text-sm text-ink transition-colors " +
  "placeholder:text-muted/80 disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted";

function Label({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-ink"
    >
      {children}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function Help({ id, error, hint }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="mt-0.5 size-4 shrink-0 fill-current"
        >
          <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.75 4.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
        </svg>
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-sm text-muted">
        {hint}
      </p>
    );
  }
  return null;
}

/** Text input with a real label, hint and error wiring. */
export function Input({
  label,
  hint,
  error,
  required,
  className,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          CONTROL,
          "h-11",
          error ? "border-danger" : "border-line focus:border-forest",
        )}
        {...props}
      />
      <Help id={describedBy} error={error} hint={hint} />
    </div>
  );
}

/** Native select, restyled — keeps mobile pickers and keyboard behaviour. */
export function Select({
  label,
  hint,
  error,
  required,
  className,
  id: idProp,
  children,
  ...props
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            CONTROL,
            "h-11 appearance-none pr-9",
            error ? "border-danger" : "border-line focus:border-forest",
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 fill-none stroke-muted stroke-[1.75]"
        >
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <Help id={describedBy} error={error} hint={hint} />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  id: idProp,
  rows = 4,
  ...props
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          CONTROL,
          "py-2.5",
          error ? "border-danger" : "border-line focus:border-forest",
        )}
        {...props}
      />
      <Help id={describedBy} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({ label, hint, className, id: idProp, ...props }) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label
      htmlFor={id}
      className={cn("flex cursor-pointer items-start gap-3", className)}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-6 shrink-0 rounded border-line text-forest accent-forest"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}
