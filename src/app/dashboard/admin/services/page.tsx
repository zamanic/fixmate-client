import type { Metadata } from "next";

import { AdminServicesTable } from "@/components/admin/services-table";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";

export const metadata: Metadata = {
  title: "Service moderation",
  description: "Approve, reject or re-queue every technician listing before it reaches customers.",
};

export default function AdminServicesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Admin"
        title="Service moderation"
        description="Every listing a technician publishes waits here for review. Approve it to open it up in Explore Services, reject it to keep it hidden, or send it back to pending while you gather more detail."
      />

      <AdminServicesTable />
    </div>
  );
}
