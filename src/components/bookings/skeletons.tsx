import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the real booking card so the grid does not jump when data lands. */
export function BookingCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BookingsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
