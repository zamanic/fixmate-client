import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-server";
import { dashboardPathFor } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to FixMate to request repairs, follow job status and pay securely.",
};

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track your repairs, payments and saved services."
      switchText="New to FixMate?"
      switchLabel="Create an account"
      switchHref="/sign-up"
    >
      <Suspense fallback={<FormSkeleton />}>
        <SignInGate />
      </Suspense>
    </AuthShell>
  );
}

/** Session read lives behind the boundary so the shell can prerender. */
async function SignInGate() {
  // Already signed in? Go straight to the right dashboard.
  const user = await getCurrentUser();
  if (user) redirect(dashboardPathFor(user.role));

  return <SignInForm />;
}
