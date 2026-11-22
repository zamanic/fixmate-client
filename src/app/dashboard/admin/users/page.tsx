import type { Metadata } from "next";

import { AdminUsersTable } from "@/components/admin/users-table";
import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Users",
  description: "Every FixMate account, with a one-click role change between customer, technician and admin.",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Admin"
        title="Users"
        description="Every account on FixMate. Promote a customer to technician so they can list services, or grant admin moderation rights. Your own role is locked to prevent locking yourself out."
      />

      <AdminUsersTable currentEmail={user?.email ?? ""} />
    </div>
  );
}
