import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminOverviewPage() {
  return (
    <>
      <DashboardHeading
        eyebrow="Admin"
        title="Marketplace control"
        description="Approve technician listings, watch the booking funnel and audit every payment that moves through FixMate."
        action={
          <Link href="/dashboard/admin/services" className={buttonVariants({ variant: "outline" })}>
            <ShieldCheck /> Review listings
          </Link>
        }
      />

      <EmptyState
        icon={ShieldCheck}
        title="Nothing waiting on you"
        description="Pending services, unusual booking activity and payment records will surface here as they arrive."
        actionLabel="Open the listing queue"
        actionHref="/dashboard/admin/services"
      />
    </>
  );
}
