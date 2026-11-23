import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-matched skeleton for the service details route: the hero gallery, the
 * title block, the technician card, the spec table and the sticky booking
 * summary all hold their real geometry, so nothing jumps when data lands.
 *
 * Shared by the page's `<Suspense>` boundary and `services/[id]/loading.tsx`.
 */
export function ServiceDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-32" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-8">
          {/* Hero image + category badge */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Skeleton className="h-full w-full rounded-2xl" />
            <Skeleton className="absolute top-4 left-4 h-6 w-24 rounded-full" />
          </div>

          {/* Category / mode badges + title */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>

          {/* Technician card */}
          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* About this service */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Service details spec table */}
          <div>
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2 bg-card p-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky booking summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <Skeleton className="h-3 w-28" />
            <div className="mt-3 flex items-baseline gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <Skeleton className="my-4 h-px w-full" />

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>

            <Skeleton className="mt-4 h-6 w-36 rounded-full" />
            <Skeleton className="mt-5 h-10 w-full rounded-lg" />
          </div>
        </aside>
      </div>
    </>
  );
}
