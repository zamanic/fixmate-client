import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { normalizePayments } from "@/components/payments/normalize";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PaymentsTableSkeleton } from "@/components/payments/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";
import { serverFetch } from "@/lib/server-api";
import type { Payment } from "@/lib/types";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export const metadata: Metadata = {
  title: "Payments",
  description: "Every FixMate repair you've paid for, with its Stripe transaction record.",
};

export default async function CustomerPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/customer/payments");
  if (user.role !== "customer") redirect("/unauthorized");

  return (
    <>
      <DashboardHeading
        eyebrow="Customer"
        title="Payments"
        description="Receipts for completed repairs, read straight from the payments collection. Card payment only ever runs once a technician marks the job complete."
        action={
          <Link href="/services" className={buttonVariants()}>
            <Search /> Browse services
          </Link>
        }
      />

      <Suspense fallback={<PaymentsTableSkeleton />}>
        <CustomerPayments />
      </Suspense>
    </>
  );
}

async function CustomerPayments() {
  const data = await serverFetch<{ items: Payment[] }>("/api/payments/my", { auth: true });
  return <PaymentsTable payments={normalizePayments(data?.items ?? [])} />;
}
