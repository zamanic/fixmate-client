"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { BookingStatusBadge } from "@/components/status-badge";
import { crossFade } from "@/lib/motion/variants";
import {
  BOOKING_STATUS_LABEL,
  TRACKER_STEPS,
  formatDateTime,
  type Booking,
  type BookingStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The job timeline every booking carries. Horizontally on desktop, stacked on
 * mobile, it walks `requested → accepted → in-progress → completed` and closes
 * with a `Paid` node. A rejected or cancelled booking renders the same spine in
 * a muted, terminated state with its terminal badge instead of a progress line.
 */
const TERMINAL_STATUSES: BookingStatus[] = ["rejected", "cancelled"];

interface TrackerStep {
  key: string;
  label: string;
  reached: boolean;
  timestamp: string | null;
}

export function BookingTracker({ booking, className }: { booking: Booking; className?: string }) {
  const reduceMotion = useReducedMotion();
  const terminal = TERMINAL_STATUSES.includes(booking.status);
  const reachedIndex = TRACKER_STEPS.indexOf(booking.status);
  const paid = booking.paymentStatus === "paid";
  const history = booking.statusHistory ?? [];

  const steps: TrackerStep[] = [
    ...TRACKER_STEPS.map((status, index) => ({
      key: status,
      label: BOOKING_STATUS_LABEL[status],
      reached: !terminal && index <= reachedIndex,
      timestamp: history.find((entry) => entry.status === status)?.changedAt ?? null,
    })),
    { key: "paid", label: "Paid", reached: paid, timestamp: null },
  ];

  const nextReached = (index: number) => steps[index + 1]?.reached ?? false;

  const nodeClass = (reached: boolean) =>
    cn(
      "grid size-6 shrink-0 place-items-center rounded-full ring-1",
      reached ? "bg-signal text-white ring-signal" : "bg-card text-muted-foreground ring-border"
    );

  return (
    <div className={cn("rounded-xl bg-muted/40 p-3 ring-1 ring-foreground/5", className)}>
      <AnimatePresence mode="wait" initial={!reduceMotion}>
        <motion.div
          key={`${booking.status}-${booking.paymentStatus}`}
          variants={crossFade}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {terminal ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="text-xs text-muted-foreground">
                This request closed at this step.
              </span>
            </div>
          ) : null}

          <ol className="hidden items-start sm:flex">
            {steps.map((step, index) => (
              <li key={step.key} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      index === 0 ? "opacity-0" : step.reached ? "bg-signal" : "bg-border"
                    )}
                  />
                  <span className={nodeClass(step.reached)}>
                    {step.reached ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      index === steps.length - 1
                        ? "opacity-0"
                        : nextReached(index)
                          ? "bg-signal"
                          : "bg-border"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 px-1 text-center text-[11px] leading-tight font-medium",
                    step.reached ? "text-ink" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 min-h-4 text-center text-[10px] leading-tight text-muted-foreground">
                  {step.timestamp ? formatDateTime(step.timestamp) : ""}
                </span>
              </li>
            ))}
          </ol>

          <ol className="space-y-3 sm:hidden">
            {steps.map((step, index) => (
              <li key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={nodeClass(step.reached)}>
                    {step.reached ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      className={cn(
                        "my-1 w-0.5 flex-1 rounded-full",
                        nextReached(index) ? "bg-signal" : "bg-border"
                      )}
                    />
                  ) : null}
                </div>
                <div className="pb-1">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      step.reached ? "text-ink" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.timestamp ? (
                    <time className="text-[11px] text-muted-foreground">
                      {formatDateTime(step.timestamp)}
                    </time>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
