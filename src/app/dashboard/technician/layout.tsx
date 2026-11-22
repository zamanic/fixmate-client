import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";

/** Session-gated: blocks until the user is verified — see `src/app/dashboard/layout.tsx`. */
export const instant = false;

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/technician");
  if (user.role !== "technician") redirect("/unauthorized");

  return <>{children}</>;
}
