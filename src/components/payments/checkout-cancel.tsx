"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, CreditCard, RotateCcw } from "lucide-react";

import { ResultShell } from "@/components/payments/result-shell";
import { Spinner } from "@/components/spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, apiPost } from "@/lib/api";

/**
 * Stripe Checkout cancel return. Nothing was charged, so the page reassures the
 * customer and offers a one-click retry: it re-mints a checkout session for the
 * same booking id (the server re-reads the amount and re-checks ownership).
 */
export function CheckoutCancel() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [busy, setBusy] = useState(false);

  async function tryAgain() {
    if (!bookingId) return;
    setBusy(true);
    try {
      const result = await apiPost<{ url?: string }>(
        "/api/payments/create-checkout-session",
        { bookingId },
        true
      );
      if (!result?.url) {
        throw new ApiError("Stripe did not return a checkout link.", "SERVER_ERROR");
      }
      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "We couldn't restart the payment. Please try again."
      );
      setBusy(false);
    }
  }

  return (
    <ResultShell>
      <Card>
        <CardContent className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-status-unpaid/12 text-status-unpaid">
            <CalendarClock className="size-7" aria-hidden />
          </span>

          <h1 className="fm-h2 mt-5 font-bold text-ink">Payment not completed</h1>
          <p className="fm-body mt-2 text-muted-foreground">
            Nothing was charged — your card details were never submitted. The job stays payable, so
            you can finish it whenever you&apos;re ready.
          </p>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {bookingId ? (
              <Button disabled={busy} onClick={() => void tryAgain()}>
                {busy ? <Spinner /> : <RotateCcw />} Try payment again
              </Button>
            ) : null}
            <Link
              href="/dashboard/customer/bookings"
              className={buttonVariants({ variant: bookingId ? "outline" : "default" })}
            >
              <CreditCard aria-hidden /> Back to my bookings
            </Link>
          </div>
        </CardContent>
      </Card>
    </ResultShell>
  );
}
