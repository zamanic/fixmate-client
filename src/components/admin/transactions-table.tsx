"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

import { normalizePayments } from "@/components/admin/normalize";
import { StatCard } from "@/components/bookings/stat-card";
import { EmptyState } from "@/components/empty-state";
import { PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, apiGet } from "@/lib/api";
import { crossFade, staggerParent } from "@/lib/motion/variants";
import { formatDate, formatDateTime, formatMoney, type Payment } from "@/lib/types";

const LIST_PATH = "/api/admin/payments";

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * The platform's money trail, read from `GET /api/admin/payments`
 * (CONTRACT §6). Amounts always come from the stored record — the admin view
 * never recomputes what a customer was charged.
 */
export function AdminTransactionsTable() {
  const [items, setItems] = useState<Payment[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ items: Payment[] }>(LIST_PATH, true);
      setItems(normalizePayments(data?.items ?? []));
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setItems((prev) => prev ?? []);
      toast.error(errorText(error, "We couldn't load the transaction log."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ items: Payment[] }>(LIST_PATH, true)
      .then((data) => {
        if (cancelled) return;
        setItems(normalizePayments(data?.items ?? []));
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        setItems((prev) => prev ?? []);
        toast.error(errorText(error, "We couldn't load the transaction log."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const rows = items ?? [];
    const paid = rows
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return { paid, count: rows.length, latest: rows[0]?.paidAt };
  }, [items]);

  function retry() {
    setItems(null);
    setFailed(false);
    void load();
  }

  if (items === null) {
    return <TransactionsTableSkeleton />;
  }

  if (failed && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load the transaction log</h3>
        <p className="fm-body mx-auto mt-2 max-w-md text-muted-foreground">
          The FixMate service may be starting up. Please try again in a moment.
        </p>
        <Button className="mt-6" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payments recorded"
        description="Once a technician marks a repair complete and the customer pays through Stripe, the receipt lands here with its transaction id."
      />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          icon={Banknote}
          label="Gross collected"
          value={formatMoney(totals.paid)}
          hint="Across every paid transaction"
          tone="bg-status-paid/12 text-status-paid"
        />
        <StatCard
          icon={Receipt}
          label="Transactions"
          value={String(totals.count)}
          hint="Rows in the payments collection"
        />
        <StatCard
          icon={Wallet}
          label="Latest payment"
          value={formatDate(totals.latest)}
          hint="Most recent Stripe receipt"
          tone="bg-status-completed/12 text-status-completed"
        />
      </motion.div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="hidden md:table-cell">Technician</TableHead>
              <TableHead className="hidden lg:table-cell">Paid on</TableHead>
              <TableHead className="hidden xl:table-cell">Transaction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {items.map((payment) => (
                <motion.tr
                  key={payment._id}
                  layout
                  variants={crossFade}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="border-b transition-colors last:border-0 hover:bg-muted/50"
                >
                  <TableCell className="max-w-[18rem] py-3">
                    <p className="truncate font-medium text-ink">{payment.serviceTitle}</p>
                    <p className="truncate text-xs text-muted-foreground md:hidden">
                      {payment.customerName}
                    </p>
                  </TableCell>

                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {payment.customerName}
                  </TableCell>

                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {payment.technicianName}
                  </TableCell>

                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {formatDateTime(payment.paidAt)}
                  </TableCell>

                  <TableCell className="hidden xl:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">
                      {payment.transactionId ? `${payment.transactionId.slice(0, 22)}…` : "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <PaymentStatusBadge
                      status={payment.paymentStatus === "paid" ? "paid" : "unpaid"}
                    />
                  </TableCell>

                  <TableCell className="text-right font-heading font-semibold text-ink tabular-nums">
                    {formatMoney(payment.amount)}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** Layout-matched placeholders while the first fetch is in flight. */
export function TransactionsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="hidden md:table-cell">Technician</TableHead>
              <TableHead className="hidden lg:table-cell">Paid on</TableHead>
              <TableHead className="hidden xl:table-cell">Transaction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="py-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Skeleton className="h-3 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
