import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI — heading plus the profile card, shaped like the real form. */
export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-52 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={index === 4 ? "grid gap-2 sm:col-span-2" : "grid gap-2"}>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
