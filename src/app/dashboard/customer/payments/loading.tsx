import { PaymentsTableSkeleton } from "@/components/payments/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI — heading + action, then the payments summary and table. */
export default function CustomerPaymentsLoading() {
  return (
    <>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-48 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-9 w-36 shrink-0 rounded-md" />
      </div>

      <PaymentsTableSkeleton />
    </>
  );
}
