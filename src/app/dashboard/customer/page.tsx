import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { CustomerOverview } from "@/components/bookings/customer-overview";
import { normalizeBookings } from "@/components/bookings/normalize";
import { BookingsGridSkeleton } from "@/components/bookings/skeletons";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-api";
import type { Booking } from "@/lib/types";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export const metadata: Metadata = {
  title: "Customer dashboard",
  description: "Your repair requests, live job status and payment history at a glance.",
};

export default async function CustomerOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/customer");
  if (user.role !== "customer") redirect("/unauthorized");

  return (
    <>
      <DashboardHeading
        eyebrow="Customer"
        title={`Welcome back, ${user.name.split(" ")[0] || "there"}`}
        description="Every job you request lands here, with a live status and a payment record once the technician marks it complete."
        action={
          <Link href="/services" className={buttonVariants()}>
            <Search /> Find a technician
          </Link>
        }
      />

      <Suspense fallback={<CustomerOverviewSkeleton />}>
        <CustomerOverviewData />
      </Suspense>
    </>
  );
}

async function CustomerOverviewData() {
  const data = await serverFetch<{ items: Booking[] }>("/api/bookings/my", { auth: true });
  return <CustomerOverview bookings={normalizeBookings(data?.items ?? [])} />;
}

function CustomerOverviewSkeleton() {
  return (
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
    </div>
  );
}
