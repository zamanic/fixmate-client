import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";
import { dashboardPathFor } from "@/lib/nav";

/** `/dashboard` is a router — send each role to its own home. */
export default async function DashboardIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard");

  redirect(dashboardPathFor(user.role));
}
