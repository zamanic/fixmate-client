import { Skeleton } from "@/components/ui/skeleton";

/** Layout-matched placeholder so the add-service form area does not jump. */
export default function AddServiceLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 pb-6">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 max-w-2xl">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
              <div className="grid gap-2 sm:col-span-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="aspect-[16/10] w-full max-w-56 rounded-xl" />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-28 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <Skeleton className="h-5 w-40" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, row) => (
                  <div key={row} className="flex gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
