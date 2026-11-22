import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";

import { BookingsBoard } from "@/components/bookings/bookings-board";
import { normalizeBookings } from "@/components/bookings/normalize";
import { BookingsBoardSkeleton } from "@/components/bookings/skeletons";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-api";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = {
  title: "Job requests",
  description: "Incoming repair requests for your services — accept, reject and advance each job.",
};

export default async function TechnicianRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician/requests");
  if (user.role !== "technician") redirect("/unauthorized");

  return (
    <>
      <DashboardHeading
        eyebrow="Technician"
        title="Job requests"
        description="Every customer request for your services, newest first. Accept or reject new ones, then move each job through to completion."
        action={
          <Link
            href="/dashboard/technician/my-services"
            className={buttonVariants({ variant: "outline" })}
          >
            <Store /> My services
          </Link>
        }
      />

      <Suspense fallback={<BookingsBoardSkeleton />}>
        <TechnicianRequests />
      </Suspense>
    </>
  );
}

async function TechnicianRequests() {
  const data = await serverFetch<{ items: Booking[] }>("/api/bookings/technician", {
    auth: true,
  });
  return <BookingsBoard bookings={normalizeBookings(data?.items ?? [])} role="technician" />;
}
