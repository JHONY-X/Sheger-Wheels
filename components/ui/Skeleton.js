import { cn } from "@/lib/cn";

/** Block placeholder. Marked aria-hidden so screen readers skip loading chrome. */
export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-sand", className)}
    />
  );
}

/** Matches the real car card's geometry so there is no layout shift. */
export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
