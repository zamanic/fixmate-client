import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardHeading } from "@/components/dashboard/dashboard-heading";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Update profile",
  description: "Keep your FixMate contact details and bio current.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/profile");

  return (
    <div className="space-y-8">
      <DashboardHeading
        eyebrow="Account"
        title="Update profile"
        description="Your name and service area appear on every service you list and on receipts."
      />
      <div className="max-w-3xl">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
