import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician");
  if (user.role !== "technician") redirect("/unauthorized");

  return <>{children}</>;
}
