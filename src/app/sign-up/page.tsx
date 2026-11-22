import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";
import { dashboardPathFor } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Join FixMate as a customer to book repairs, or as a technician to list your services.",
};

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes to set up. Pick the role that matches what you need FixMate to do."
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchHref="/sign-in"
    >
      <Suspense fallback={<FormSkeleton />}>
        <SignUpGate />
      </Suspense>
    </AuthShell>
  );
}

/** Session read lives behind the boundary so the shell can prerender. */
async function SignUpGate() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPathFor(user.role));

  return <SignUpForm />;
}
