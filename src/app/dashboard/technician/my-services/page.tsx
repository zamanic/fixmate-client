import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { MyServicesTable } from "@/components/technician/my-services-table";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "My services",
  description:
    "Manage every service you list on FixMate — pause availability, edit the details, or delete a listing you no longer offer.",
};

export default async function MyServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician/my-services");
  if (user.role !== "technician") redirect("/unauthorized");

  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Workshop"
        title="My services"
        description="Every listing you own, with its approval status and availability. Pause a service to hide it from customers without deleting it."
        action={
          <Link href="/dashboard/technician/add-service" className={buttonVariants()}>
            <Plus /> Add service
          </Link>
        }
      />

      <MyServicesTable />
    </div>
  );
}
