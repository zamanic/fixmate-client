import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description:
    "The FixMate control room: marketplace counts, the booking pipeline, monthly volume and collected revenue.",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Admin"
        title="Marketplace control"
        description="Approve technician listings, watch the booking funnel and audit every payment that moves through FixMate — all from a single aggregation."
        action={
          <Link href="/dashboard/admin/services" className={buttonVariants({ variant: "outline" })}>
            <ShieldCheck /> Review listings
          </Link>
        }
      />

      <AdminDashboard />
    </div>
  );
}
