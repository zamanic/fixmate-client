import { Skeleton } from "@/components/ui/skeleton";

/** Matches the payments summary strip + table so the page never jumps. */
export function PaymentsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[76px] w-full rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-full" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Fallback while `/payment/*` resolves the Stripe session id. */
export function CheckoutResultSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-14 rounded-2xl" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="mt-2 h-40 w-full rounded-xl" />
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Skeleton className="h-10 w-full sm:w-36" />
          <Skeleton className="h-10 w-full sm:w-36" />
        </div>
      </div>
    </div>
  );
}
