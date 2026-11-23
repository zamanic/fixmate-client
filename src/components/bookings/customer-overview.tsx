"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, CircleCheck, ClipboardList, Wrench, Wallet } from "lucide-react";

import { BookingStatusDonut, CategoryBars, categorySlices, statusSlices } from "@/components/charts/overview-charts";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { staggerParent } from "@/lib/motion/variants";
import { formatMoney, type Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingActions } from "./booking-actions";
import { BookingCard } from "./booking-card";
import { bookingAmount, bookingCategory, byNewestFirst } from "./normalize";
import { StatCard } from "./stat-card";

const ACTIVE_STATUSES: Booking["status"][] = ["requested", "accepted", "in-progress"];

/** Customer overview: four totals, then the jobs that need attention. */
export function CustomerOverview({ bookings }: { bookings: Booking[] }) {
  const [items, setItems] = useState(bookings);
  const [seed, setSeed] = useState(bookings);

  if (seed !== bookings) {
    setSeed(bookings);
    setItems(bookings);
  }

  const handleChanged = useCallback((updated: Booking) => {
    setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  }, []);

  const total = items.length;
  const active = items.filter((item) => ACTIVE_STATUSES.includes(item.status)).length;
  const completed = items.filter((item) => item.status === "completed").length;
  const paid = items
    .filter((item) => item.paymentStatus === "paid")
    .reduce((sum, item) => sum + bookingAmount(item), 0);

  const sorted = [...items].sort(byNewestFirst);
  const recent = sorted.slice(0, 3);
  const newestActive = sorted.find((item) => ACTIVE_STATUSES.includes(item.status));
  const shown =
    newestActive && !recent.some((item) => item._id === newestActive._id)
      ? [newestActive, ...recent]
      : recent;

  return (
    <div className="space-y-8">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={ClipboardList}
          label="Total requests"
          value={String(total)}
          hint="Every repair you've asked for"
        />
        <StatCard
          icon={Wrench}
          label="Active jobs"
          value={String(active)}
          hint="Requested, accepted or underway"
          tone="bg-status-inprogress/12 text-status-inprogress"
        />
        <StatCard
          icon={CircleCheck}
          label="Completed"
          value={String(completed)}
          hint="Jobs the technician finished"
          tone="bg-status-completed/12 text-status-completed"
        />
        <StatCard
          icon={Wallet}
          label="Total paid"
          value={formatMoney(paid)}
          hint="Across completed jobs"
          tone="bg-status-paid/12 text-status-paid"
        />
      </motion.div>

      {items.length > 0 ? (
        <motion.div
          variants={staggerParent()}
          initial="hidden"
          animate="show"
          className="grid gap-5 lg:grid-cols-2"
        >
          <BookingStatusDonut
            slices={statusSlices(items)}
            title="Where your requests stand"
            description="The live status mix across every repair you've asked for."
          />
          <CategoryBars
            slices={categorySlices(
              items.map((item) => ({ category: bookingCategory(item), amount: bookingAmount(item) }))
            )}
            title="Spend by category"
            description="Final amounts where a job is closed, agreed estimates where it isn't."
            currency
          />
        </motion.div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bookings yet"
          description="Browse approved services, compare hourly rates and send your first repair request — it will appear here with a live status."
          actionLabel="Explore services"
          actionHref="/services"
        />
      ) : (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="fm-h3 font-semibold text-ink">Recent bookings</h2>
            <Link
              href="/dashboard/customer/bookings"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all bookings
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5">
            {shown.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                role="customer"
                actions={
                  <BookingActions booking={booking} role="customer" onChanged={handleChanged} />
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
