"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  CircleCheck,
  Inbox,
  Plus,
  Store,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { BookingStatusDonut, CategoryBars, categorySlices, statusSlices } from "@/components/charts/overview-charts";
import { buttonVariants } from "@/components/ui/button";
import { staggerParent } from "@/lib/motion/variants";
import { formatMoney, type Booking, type Service } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingActions } from "./booking-actions";
import { BookingCard } from "./booking-card";
import { StatCard } from "./stat-card";

/** Technician overview: listing + request totals, the newest requests, and quick links. */
export function TechnicianOverview({
  bookings,
  services,
}: {
  bookings: Booking[];
  services: Service[];
}) {
  const [items, setItems] = useState(bookings);
  const [seed, setSeed] = useState(bookings);

  if (seed !== bookings) {
    setSeed(bookings);
    setItems(bookings);
  }

  const handleChanged = useCallback((updated: Booking) => {
    setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  }, []);

  const totalServices = services.length;
  const approvedServices = services.filter((item) => item.approvalStatus === "approved").length;
  const pendingReview = services.filter((item) => item.approvalStatus === "pending").length;
  const pendingRequests = items.filter((item) => item.status === "requested").length;
  const earnings = items
    .filter((item) => item.status === "completed" && item.paymentStatus === "paid")
    .reduce((sum, item) => sum + (item.finalAmount ?? 0), 0);

  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recent = sorted.slice(0, 3);
  const newestRequest = sorted.find((item) => item.status === "requested");
  const shown =
    newestRequest && !recent.some((item) => item._id === newestRequest._id)
      ? [newestRequest, ...recent]
      : recent;

  const earningSlices = categorySlices(
    items
      .filter((item) => item.status === "completed" && item.paymentStatus === "paid")
      .map((item) => ({ category: item.category, amount: item.finalAmount ?? item.basePrice }))
  );
  const requestSlices = categorySlices(
    items.map((item) => ({ category: item.category, amount: 1 }))
  );
  const hasEarnings = earningSlices.length > 0;

  return (
    <div className="space-y-8">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          href="/dashboard/technician/my-services"
          icon={Store}
          label="Total services"
          value={String(totalServices)}
          hint="Listings you offer"
          tone="bg-teal/10 text-teal"
        />
        <StatCard
          href="/dashboard/technician/my-services"
          icon={CircleCheck}
          label="Approved services"
          value={String(approvedServices)}
          hint={`${pendingReview} waiting for review`}
          tone="bg-status-completed/12 text-status-completed"
        />
        <StatCard
          href="/dashboard/technician/requests"
          icon={Inbox}
          label="Pending requests"
          value={String(pendingRequests)}
          hint="Waiting for you to accept or decline"
          tone="bg-status-requested/12 text-status-requested"
        />
        <StatCard
          href="/dashboard/technician/requests"
          icon={Banknote}
          label="Total earnings"
          value={formatMoney(earnings)}
          hint="From completed, paid jobs"
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
            title="Request pipeline"
            description="Every job that has reached your queue and where it sits now."
          />
          <CategoryBars
            slices={hasEarnings ? earningSlices : requestSlices}
            title={hasEarnings ? "Earnings by category" : "Jobs by category"}
            description={
              hasEarnings
                ? "What each kind of repair has actually paid you."
                : "Where your requests are coming from, before the first job is paid."
            }
            currency={hasEarnings}
          />
        </motion.div>
      ) : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="fm-h3 font-semibold text-ink">Latest job requests</h2>
          {items.length > 0 ? (
            <Link
              href="/dashboard/technician/requests"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all requests
            </Link>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Store}
              title="No requests yet"
              description="Once you list a service, customer requests land here for you to accept or reject. Start by adding what you repair."
              actionLabel="Add your first service"
              actionHref="/dashboard/technician/add-service"
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5">
            {shown.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                role="technician"
                actions={
                  <BookingActions booking={booking} role="technician" onChanged={handleChanged} />
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/dashboard/technician/add-service"
          icon={Plus}
          title="Add a service"
          body="List a new repair you can take on and set your rate."
        />
        <QuickLink
          href="/dashboard/technician/my-services"
          icon={Store}
          title="My services"
          body="Edit prices, availability and photos of your listings."
        />
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:ring-teal/30"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-medium text-ink">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </Link>
  );
}
