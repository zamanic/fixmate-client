import { BookingsBoardSkeleton } from "@/components/bookings/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI — heading + filter rail + card grid placeholders. */
export default function CustomerBookingsLoading() {
  return (
    <>
      <div className="space-y-3 pb-6">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-2/3 max-w-xl" />
      </div>
      <BookingsBoardSkeleton count={6} />
    </>
  );
}
