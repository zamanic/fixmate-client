"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";

import { normalizeBookings } from "@/components/admin/normalize";
import { EmptyState } from "@/components/empty-state";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
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
import { crossFade } from "@/lib/motion/variants";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUSES,
  formatDate,
  formatMoney,
  type Booking,
  type BookingStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const LIST_PATH = "/api/admin/bookings";

type Filter = "all" | BookingStatus;

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Read-only audit of every repair request on the platform, from
 * `GET /api/admin/bookings` (CONTRACT §6). Admins watch the funnel here; the
 * status moves themselves stay with the technician or customer who owns them.
 */
export function AdminBookingsTable() {
  const [items, setItems] = useState<Booking[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ items: Booking[] }>(LIST_PATH, true);
      setItems(normalizeBookings(data?.items ?? []));
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setItems((prev) => prev ?? []);
      toast.error(errorText(error, "We couldn't load the booking log."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ items: Booking[] }>(LIST_PATH, true)
      .then((data) => {
        if (cancelled) return;
        setItems(normalizeBookings(data?.items ?? []));
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        setItems((prev) => prev ?? []);
        toast.error(errorText(error, "We couldn't load the booking log."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const base = { all: items?.length ?? 0 } as Record<Filter, number>;
    for (const status of BOOKING_STATUSES) base[status] = 0;
    for (const booking of items ?? []) base[booking.status] += 1;
    return base;
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((booking) => filter === "all" || booking.status === filter),
    [items, filter]
  );

  function retry() {
    setItems(null);
    setFailed(false);
    void load();
  }

  if (items === null) {
    return <BookingsTableSkeleton />;
  }

  if (failed && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load the booking log</h3>
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
        icon={CalendarCheck}
        title="No repair requests yet"
        description="Every booking a customer raises lands here with its technician, schedule and payment state."
      />
    );
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...BOOKING_STATUSES.map((status) => ({ value: status, label: BOOKING_STATUS_LABEL[status] })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings by status">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            role="tab"
            aria-selected={filter === option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                filter === option.value ? "bg-background/20" : "bg-muted"
              )}
            >
              {counts[option.value]}
            </span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nothing in this stage"
          description="No bookings match this status filter. Switch back to All to see the full log."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Technician</TableHead>
                <TableHead className="hidden lg:table-cell">Preferred date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {visible.map((booking) => {
                  const finalised = Number(booking.finalAmount) > 0;
                  return (
                    <motion.tr
                      key={booking._id}
                      layout
                      variants={crossFade}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <TableCell className="max-w-[18rem] py-3">
                        <p className="truncate font-medium text-ink">{booking.serviceTitle}</p>
                        <p className="truncate text-xs text-muted-foreground md:hidden">
                          {booking.customerName}
                        </p>
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {booking.customerName}
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {booking.technicianName}
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(booking.preferredDate)}
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="block font-heading font-semibold text-ink tabular-nums">
                          {formatMoney(finalised ? booking.finalAmount : booking.basePrice)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {finalised ? "Final" : "Estimate"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <PaymentStatusBadge
                          status={booking.paymentStatus === "paid" ? "paid" : "unpaid"}
                        />
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/** Layout-matched placeholders while the first fetch is in flight. */
export function BookingsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Technician</TableHead>
            <TableHead className="hidden lg:table-cell">Preferred date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Payment</TableHead>
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
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-5 w-14 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
