import type { Metadata } from "next";

import { AdminTransactionsTable } from "@/components/admin/transactions-table";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Every Stripe payment recorded on FixMate, with its transaction id and amount.",
};

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Admin"
        title="Transactions"
        description="The full money trail. Each row is a receipt captured from Stripe once a repair was marked complete — amounts come straight from the stored record, never recomputed."
      />

      <AdminTransactionsTable />
    </div>
  );
}
