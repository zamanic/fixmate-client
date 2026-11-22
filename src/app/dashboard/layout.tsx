import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";

/**
 * Session verification is a hard prerequisite for every route under here:
 * nothing can render, and no role can be decided, before `getCurrentUser()`
 * resolves. Next's dev-only instant-navigation validation treats every
 * unconfigured segment as `instant = true`, and it resolves that per segment —
 * an ancestor's opt-out does not reach below it — so every `/dashboard` layout
 * and page that reads the session declares this for itself. Public routes keep
 * validating. `instant` only controls the check: the shell still prerenders
 * and streams.
 */
export const instant = false;

/**
 * Real session check for every `/dashboard/*` route. `proxy.ts` only looks at
 * the cookie; this layout is where the session is actually verified.
 *
 * Cache Components forbids a request read (`headers()`) at a layout's top
 * level, so the session is resolved inside `<Suspense>`: the shell skeleton
 * prerenders instantly and the authenticated frame streams in behind it.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthenticatedFrame>{children}</AuthenticatedFrame>
    </Suspense>
  );
}

async function AuthenticatedFrame({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard");

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

/** Layout-matched fallback so the dashboard does not jump when the frame lands. */
function DashboardShellSkeleton() {
  return (
    <div className="fm-shell w-full flex-1 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-foreground/10">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <div className="hidden flex-col gap-1 lg:flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="mb-4 flex gap-2 lg:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
