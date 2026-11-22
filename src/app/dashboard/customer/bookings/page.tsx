import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { BookingsBoard } from "@/components/bookings/bookings-board";
import { normalizeBookings } from "@/components/bookings/normalize";
import { BookingsBoardSkeleton } from "@/components/bookings/skeletons";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-api";
import type { Booking } from "@/lib/types";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export const metadata: Metadata = {
  title: "My bookings",
  description: "Track every repair request — its live status, the technician and the payment.",
};

export default async function CustomerBookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/customer/bookings");
  if (user.role !== "customer") redirect("/unauthorized");

  return (
    <>
      <DashboardHeading
        eyebrow="Customer"
        title="My bookings"
        description="Every repair you've requested, with its live status. Cancel a request while it's still pending, and pay once the technician marks the job complete."
        action={
          <Link href="/services" className={buttonVariants()}>
            <Search /> Browse services
          </Link>
        }
      />

      <Suspense fallback={<BookingsBoardSkeleton />}>
        <CustomerBookings />
      </Suspense>
    </>
  );
}

async function CustomerBookings() {
  const data = await serverFetch<{ items: Booking[] }>("/api/bookings/my", { auth: true });
  return <BookingsBoard bookings={normalizeBookings(data?.items ?? [])} role="customer" />;
}
