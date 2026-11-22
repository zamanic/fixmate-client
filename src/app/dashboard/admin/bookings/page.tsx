import type { Metadata } from "next";

import { AdminBookingsTable } from "@/components/admin/bookings-table";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";

export const metadata: Metadata = {
  title: "Bookings",
  description: "A read-only audit of every repair request and where it sits in the job pipeline.",
};

export default function AdminBookingsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Admin"
        title="Bookings"
        description="Every repair request on the platform, from the moment it is requested through to completion and payment. This view is read-only — status moves stay with the technician or customer who owns the job."
      />

      <AdminBookingsTable />
    </div>
  );
}
