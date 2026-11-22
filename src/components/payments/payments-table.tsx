"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Banknote, LayoutList, Receipt } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PaymentStatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { crossFade, gridParent, gridItem } from "@/lib/motion/variants";
import { formatDate, formatMoney, type Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The customer's payment history — one row per recorded `payments` document
 * (CONTRACT §2). Amounts always come from the stored record, never recomputed
 * on the client.
 */
export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const reduce = useReducedMotion();

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payments yet"
        description="Once a technician completes a repair, you'll pay securely through Stripe and the receipt will appear here with its transaction id."
        actionLabel="Explore services"
        actionHref="/services"
      />
    );
  }

  const total = payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <motion.div
        variants={reduce ? undefined : gridParent}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatTile
          reduce={Boolean(reduce)}
          icon={Banknote}
          label="Total paid"
          value={formatMoney(total)}
          tone="bg-status-paid/12 text-status-paid"
        />
        <StatTile
          reduce={Boolean(reduce)}
          icon={LayoutList}
          label="Payments recorded"
          value={String(payments.length)}
          tone="bg-tint-smartphone text-teal"
        />
        <StatTile
          reduce={Boolean(reduce)}
          icon={Receipt}
          label="Most recent"
          value={formatDate(payments[0]?.paidAt)}
          tone="bg-status-completed/12 text-status-completed"
        />
      </motion.div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="hidden md:table-cell">Technician</TableHead>
              <TableHead className="hidden sm:table-cell">Paid on</TableHead>
              <TableHead className="hidden lg:table-cell">Transaction</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <motion.tr
                key={payment._id}
                variants={reduce ? undefined : crossFade}
                initial={reduce ? undefined : "hidden"}
                animate={reduce ? undefined : "show"}
                className="border-b transition-colors last:border-0 hover:bg-muted/50"
              >
                <TableCell className="max-w-[16rem] font-medium text-ink">
                  <span className="block truncate">{payment.serviceTitle}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground md:hidden">
                    {payment.technicianName}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {payment.technicianName}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(payment.paidAt)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {payment.transactionId ? `${payment.transactionId.slice(0, 18)}…` : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-heading font-semibold text-ink">
                  {formatMoney(payment.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <PaymentStatusBadge status={payment.paymentStatus === "paid" ? "paid" : "unpaid"} />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Need a receipt for a job that isn&apos;t listed?{" "}
        <Link href="/dashboard/customer/bookings" className="font-medium text-signal hover:underline">
          Check your bookings
        </Link>{" "}
        — a payment only appears here once Stripe confirms it.
      </p>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  reduce,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  tone: string;
  reduce: boolean;
}) {
  return (
    <motion.div
      variants={reduce ? undefined : gridItem}
      className="flex items-center gap-3.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
        <span className="block truncate font-heading text-xl font-bold text-ink tabular-nums">
          {value}
        </span>
      </span>
    </motion.div>
  );
}
