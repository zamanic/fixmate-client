import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutCancel } from "@/components/payments/checkout-cancel";
import { ResultShell } from "@/components/payments/result-shell";
import { CheckoutResultSkeleton } from "@/components/payments/skeletons";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your FixMate payment was cancelled — nothing was charged.",
};

/**
 * Stripe `cancel_url` landing. The reading component uses `useSearchParams`,
 * so it lives behind a `<Suspense>` boundary for Cache Components.
 */
export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <ResultShell>
          <CheckoutResultSkeleton />
        </ResultShell>
      }
    >
      <CheckoutCancel />
    </Suspense>
  );
}
