import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutSuccess } from "@/components/payments/checkout-success";
import { ResultShell } from "@/components/payments/result-shell";
import { CheckoutResultSkeleton } from "@/components/payments/skeletons";

export const metadata: Metadata = {
  title: "Payment complete",
  description: "Your FixMate repair payment was received.",
};

/**
 * Stripe `success_url` landing. The reading component uses `useSearchParams`,
 * which Cache Components needs behind a boundary — hence the `<Suspense>`.
 */
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <ResultShell>
          <CheckoutResultSkeleton />
        </ResultShell>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}
