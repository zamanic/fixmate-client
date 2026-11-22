import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { normalizeBookings } from "@/components/bookings/normalize";
import { BookingsGridSkeleton } from "@/components/bookings/skeletons";
import { TechnicianOverview } from "@/components/bookings/technician-overview";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-api";
import type { Booking } from "@/lib/types";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export const metadata: Metadata = {
  title: "Technician dashboard",
  description: "Incoming job requests, your active jobs and earnings from completed repairs.",
};

export default async function TechnicianOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician");
  if (user.role !== "technician") redirect("/unauthorized");

  return (
    <>
      <DashboardHeading
        eyebrow="Technician"
        title="Your workshop"
        description="List what you repair, keep your rates current, and move every request from accepted to done — all from here."
        action={
          <Link href="/dashboard/technician/add-service" className={buttonVariants()}>
            <Plus /> Add service
          </Link>
        }
      />

      <Suspense fallback={<TechnicianOverviewSkeleton />}>
        <TechnicianOverviewData />
      </Suspense>
    </>
  );
}

async function TechnicianOverviewData() {
  const data = await serverFetch<{ items: Booking[] }>("/api/bookings/technician", {
    auth: true,
  });
  return <TechnicianOverview bookings={normalizeBookings(data?.items ?? [])} />;
}

function TechnicianOverviewSkeleton() {
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}
