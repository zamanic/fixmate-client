"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ClipboardList, SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { DURATION, EASE_OUT, crossFade } from "@/lib/motion/variants";
import { BOOKING_STATUS_LABEL, type Booking, type BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingActions } from "./booking-actions";
import { BookingCard } from "./booking-card";
import { byNewestFirst } from "./normalize";

/**
 * The bookings board shared by "My bookings" (customer) and "Job requests"
 * (technician). A `layoutId` rail filters the already-fetched list on the
 * client — newest first — and cards animate in and out with `AnimatePresence`.
 * Status actions update the list in place; a failed action refreshes to
 * reconcile.
 */

type Role = "customer" | "technician";
type Filter = "all" | BookingStatus;

const FILTERS: Filter[] = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export function BookingsBoard({ bookings, role }: { bookings: Booking[]; role: Role }) {
  const [items, setItems] = useState(bookings);
  const [seed, setSeed] = useState(bookings);
  const [filter, setFilter] = useState<Filter>("all");

  // Re-sync when the server sends fresh props (a `router.refresh()` after a
  // failed action). Documented "adjust state during render": compare the
  // snapshot against the incoming prop and reset only when it drifted.
  if (seed !== bookings) {
    setSeed(bookings);
    setItems(bookings);
  }

  const handleChanged = useCallback((updated: Booking) => {
    setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  }, []);

  const sorted = useMemo(() => [...items].sort(byNewestFirst), [items]);

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      all: items.length,
      requested: 0,
      accepted: 0,
      "in-progress": 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };
    // A row with a status this build doesn't know about counts toward the
    // total only — it must never create a phantom filter key or a NaN count.
    for (const item of items) {
      if (item.status in map) map[item.status] += 1;
    }
    return map;
  }, [items]);

  const visible = filter === "all" ? sorted : sorted.filter((item) => item.status === filter);

  const emptyProps =
    role === "customer"
      ? {
          icon: CalendarClock,
          title: "No bookings yet",
          description:
            "When you request a repair it appears here with a live status. Browse verified services to send your first request.",
          actionLabel: "Explore services",
          actionHref: "/services",
        }
      : {
          icon: ClipboardList,
          title: "No job requests yet",
          description:
            "Requests for your services land here. Keep your listings live and competitively priced so customers find you.",
          actionLabel: "Manage your services",
          actionHref: "/dashboard/technician/my-services",
        };

  return (
    <div>
      <div role="tablist" aria-label="Filter bookings by status" className="flex flex-wrap gap-2">
        {FILTERS.map((value) => {
          const active = filter === value;
          const label = value === "all" ? "All" : BOOKING_STATUS_LABEL[value];
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(value)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
                active
                  ? "text-white ring-teal"
                  : "bg-card text-muted-foreground ring-foreground/10 hover:text-ink"
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`bookings-filter-rail-${role}`}
                  transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  className="absolute inset-0 rounded-full bg-teal"
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-1.5">
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[value]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState {...emptyProps} />
        ) : visible.length === 0 ? (
          <NoMatches
            label={filter === "all" ? "All" : BOOKING_STATUS_LABEL[filter]}
            onReset={() => setFilter("all")}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((booking) => (
                <motion.div
                  key={booking._id}
                  layout
                  variants={crossFade}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <BookingCard
                    booking={booking}
                    role={role}
                    actions={
                      <BookingActions booking={booking} role={role} onChanged={handleChanged} />
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Distinct from the "no bookings at all" state — this one is about the filter. */
function NoMatches({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </span>
      <h3 className="fm-h3 mt-4 font-semibold text-ink">Nothing at this stage</h3>
      <p className="fm-body mt-2 max-w-md text-muted-foreground">
        No bookings are currently “{label}”. Switch back to see everything.
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Show all bookings
      </Button>
    </div>
  );
}
