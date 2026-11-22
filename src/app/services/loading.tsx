import { ServiceGridSkeleton } from "@/components/services/service-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI — a full grid of placeholders while the page streams. */
export default function ServicesLoading() {
  return (
    <div className="fm-shell fm-section">
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ServiceGridSkeleton count={6} />
      </div>
    </div>
  );
}
