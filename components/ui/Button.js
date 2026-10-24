import Link from "next/link";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-forest text-white hover:bg-forest-600",
  secondary:
    "border border-forest/30 bg-white text-forest hover:border-forest hover:bg-forest-tint",
  ghost: "text-ink hover:bg-sand",
  destructive: "bg-danger text-white hover:bg-danger/90",
  /* For dark surfaces such as the owner panel. */
  inverse: "bg-white text-forest hover:bg-sand",
};

const SIZES = {
  sm: "h-11 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Primary action control. Renders a <Link> when `href` is provided,
 * otherwise a real <button> — never a clickable div.
 */
export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  type = "button",
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-btn font-medium",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
