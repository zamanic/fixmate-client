import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the real booking ticket so the list does not jump when data lands. */
export function BookingCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:flex-row">
      <div className="flex min-w-0 flex-1 gap-4 p-4 sm:gap-5 sm:p-5">
        <Skeleton className="size-20 shrink-0 rounded-xl sm:size-24" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-8 w-44 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-3 border-t border-border p-4 sm:p-5 lg:w-56 lg:border-t-0 lg:border-l">
        <div className="space-y-2 lg:flex lg:flex-col lg:items-end">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-1.5 lg:justify-end">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-24 lg:self-end" />
        <Skeleton className="mt-auto h-8 w-28 lg:self-end" />
      </div>
    </div>
  );
}

export function BookingsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Filter rail + grid, matching the real bookings board layout. */
export function BookingsBoardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-6">
        <BookingsGridSkeleton count={count} />
      </div>
    </div>
  );
}
