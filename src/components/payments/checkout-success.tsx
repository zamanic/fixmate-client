"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CircleAlert, LayoutList, Search } from "lucide-react";

import { CheckoutResultSkeleton } from "@/components/payments/skeletons";
import { ResultDetailRow, ResultShell } from "@/components/payments/result-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, apiGet } from "@/lib/api";
import { fadeUp, successPop } from "@/lib/motion/variants";
import { formatDateTime, formatMoney, type Payment } from "@/lib/types";

/**
 * Stripe Checkout return page. The secret bit — whether the card actually
 * cleared — is decided server-side: this page hands the `session_id` to
 * `GET /api/payments/verify`, which retrieves the session from Stripe, checks
 * the metadata email against the signed-in customer and records the payment
 * exactly once. The browser never asserts that a payment succeeded.
 */

interface VerifyResponse {
  message?: string;
  payment?: Payment;
}

type VerifyState =
  | { status: "ready"; payment: Payment }
  | { status: "error"; message: string }
  | null;

export function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const reduce = useReducedMotion();
  const [state, setState] = useState<VerifyState>(null);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;

    void (async () => {
      try {
        const result = await apiGet<VerifyResponse>(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
          true
        );
        if (!active) return;
        if (!result?.payment) {
          setState({
            status: "error",
            message: "We couldn't find a payment for that Stripe session.",
          });
          return;
        }
        setState({ status: "ready", payment: result.payment });
      } catch (error) {
        if (!active) return;
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't confirm this payment just now.",
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <ResultShell>
        <ResultNotice
          title="Missing payment reference"
          body="This page opened without a Stripe session id. Head back to your bookings and start the payment again."
        />
      </ResultShell>
    );
  }

  if (state?.status === "error") {
    return (
      <ResultShell>
        <ResultNotice title="We couldn't confirm the payment" body={state.message} />
      </ResultShell>
    );
  }

  if (state?.status === "ready") {
    const { payment } = state;
    return (
      <ResultShell>
        <motion.div
          variants={reduce ? undefined : fadeUp}
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <Card>
            <CardContent className="flex flex-col items-center text-center">
              <motion.span
                variants={reduce ? undefined : successPop}
                className="grid size-14 place-items-center rounded-2xl bg-status-completed/12 text-status-completed"
              >
                <BadgeCheck className="size-7" aria-hidden />
              </motion.span>

              <h1 className="fm-h2 mt-5 font-bold text-ink">Payment received</h1>
              <p className="fm-body mt-2 text-muted-foreground">
                Thanks — your repair is paid for. The receipt is now in your payment history.
              </p>

              <dl className="mt-6 w-full divide-y divide-border rounded-xl bg-muted/40 px-4 text-left text-sm">
                <ResultDetailRow label="Service" value={payment.serviceTitle} />
                <ResultDetailRow label="Technician" value={payment.technicianName} />
                <ResultDetailRow
                  label="Transaction"
                  value={
                    payment.transactionId ? `${payment.transactionId.slice(0, 22)}…` : "—"
                  }
                  mono
                />
                <ResultDetailRow label="Paid at" value={formatDateTime(payment.paidAt)} />
                <ResultDetailRow label="Amount" value={formatMoney(payment.amount)} strong />
              </dl>

              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/dashboard/customer/payments"
                  className={buttonVariants()}
                >
                  <LayoutList aria-hidden /> View payments
                </Link>
                <Link href="/services" className={buttonVariants({ variant: "outline" })}>
                  <Search aria-hidden /> Book another repair
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ResultShell>
    );
  }

  return (
    <ResultShell>
      <CheckoutResultSkeleton />
    </ResultShell>
  );
}

function ResultNotice({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-status-rejected/12 text-status-rejected">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <h1 className="fm-h2 mt-5 font-bold text-ink">{title}</h1>
        <p className="fm-body mt-2 text-muted-foreground">{body}</p>
        <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard/customer/bookings" className={buttonVariants()}>
            <LayoutList aria-hidden /> Go to my bookings
          </Link>
          <Link href="/services" className={buttonVariants({ variant: "outline" })}>
            <Search aria-hidden /> Explore services
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
