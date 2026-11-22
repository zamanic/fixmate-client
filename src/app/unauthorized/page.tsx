import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";
import { dashboardPathFor } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Access denied",
  description: "Your account doesn't have permission to open this page.",
};

/**
 * Where the per-role dashboard layouts send a signed-in user who opens a
 * dashboard that isn't theirs. Never `/login`.
 *
 * The session read sits inside `<Suspense>` so the page still prerenders.
 */
export default function UnauthorizedPage() {
  return (
    <div className="fm-shell flex flex-1 items-center justify-center py-20">
      <Suspense fallback={<DeniedSkeleton />}>
        <DeniedCard />
      </Suspense>
    </div>
  );
}

async function DeniedCard() {
  const user = await getCurrentUser();

  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader className="items-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-status-rejected/12 text-status-rejected">
          <ShieldAlert className="size-6" />
        </span>
        <CardTitle className="mt-2 font-heading text-2xl font-bold">
          403 — this area isn&apos;t yours
        </CardTitle>
        <CardDescription>
          {user
            ? `You're signed in as ${user.name} (${user.role}). This page belongs to a different role.`
            : "Sign in with the account that owns this page."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Return to Home
        </Link>
        {user ? (
          <Link href={dashboardPathFor(user.role)} className={buttonVariants()}>
            Go to my dashboard
          </Link>
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function DeniedSkeleton() {
  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader className="items-center">
        <Skeleton className="mx-auto size-12 rounded-2xl" />
        <Skeleton className="mt-3 h-7 w-64" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </CardContent>
    </Card>
  );
}
