import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the real service card — image area, title, technician/area line,
 * duration/rating line, mode badge and the price/action footer — so the Explore
 * grid never shifts when data lands.
 */
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
            <div className="mt-auto flex items-end justify-between gap-3 pt-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
