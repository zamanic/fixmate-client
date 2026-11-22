import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";

/** Cross-role access goes to `/unauthorized`, never `/sign-in`. */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard/customer");
  if (user.role !== "customer") redirect("/unauthorized");

  return <>{children}</>;
}
