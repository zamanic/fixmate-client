import { BookingsGridSkeleton } from "@/components/bookings/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI — heading + Overview KPIs, charts, jobs and quick links. */
export default function TechnicianDashboardLoading() {
  return (
    <>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-52 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-9 w-36 shrink-0 rounded-md" />
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-[292px] w-full rounded-xl" />
          <Skeleton className="h-[292px] w-full rounded-xl" />
        </div>

        <BookingsGridSkeleton count={3} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}
