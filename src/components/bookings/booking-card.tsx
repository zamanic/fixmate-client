"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, CalendarPlus, MapPin } from "lucide-react";

import { ServiceImage } from "@/components/services/service-image";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_TILE_IMAGE } from "@/lib/images";
import {
  CATEGORY_TINT,
  formatDate,
  formatMoney,
  initials,
  ticketCode,
  type Booking,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingTracker } from "./booking-tracker";

/** Characters of `problemDescription` shown before the "Show more" expander. */
const DESCRIPTION_LIMIT = 160;

/**
 * The one booking card, reused by both dashboards. It reads left-to-right like
 * a job ticket: the category thumbnail and the record itself — what was booked,
 * who the counterparty is, when and where, what the problem was and the live
 * timeline — then a right-hand meta column with the ticket code, the badges,
 * the money and the actions.
 *
 * Wide by design: the five-step tracker only fits without clipping when the
 * card owns the full content width, so both boards list these one per row.
 * `role` picks the counterparty — the customer sees the technician, the
 * technician sees the customer.
 */
export function BookingCard({
  booking,
  role,
  actions,
  className,
}: {
  booking: Booking;
  role: "customer" | "technician";
  actions?: ReactNode;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const tint = CATEGORY_TINT[booking.category];
  const counterpartyLabel = role === "customer" ? "Technician" : "Customer";
  const counterpartyName = role === "customer" ? booking.technicianName : booking.customerName;

  const description = booking.problemDescription ?? "";
  const truncated = description.length > DESCRIPTION_LIMIT;
  const shown =
    expanded || !truncated
      ? description
      : `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:flex-row",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4 p-4 sm:gap-5 sm:p-5">
        {/* Category thumbnail — a committed local photograph, so it can never
            fall back to the "image is generating" placeholder the seeded
            service URLs serve. */}
        <div
          className={cn(
            "relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-24",
            tint
          )}
        >
          <ServiceImage
            src={CATEGORY_TILE_IMAGE[booking.category]}
            alt={`${booking.category} repair`}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="fm-h3 font-semibold text-ink">{booking.serviceTitle}</h3>
              <Badge className={cn("rounded-full border-0 text-ink", tint)}>
                {booking.category}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white">
                {initials(counterpartyName)}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {counterpartyLabel}
                </p>
                <p className="truncate text-sm font-medium text-ink">{counterpartyName}</p>
              </div>
            </div>
          </div>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarPlus className="size-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Requested date</dt>
              <dd>
                Requested{" "}
                <span className="font-medium text-ink">{formatDate(booking.createdAt)}</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Preferred date</dt>
              <dd>
                Preferred{" "}
                <span className="font-medium text-ink">{formatDate(booking.preferredDate)}</span>
              </dd>
            </div>
          </dl>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p className="min-w-0">{booking.address}</p>
          </div>

          <div>
            <p className="fm-body whitespace-pre-line text-muted-foreground">{shown}</p>
            {truncated ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 text-sm font-medium text-signal transition-colors hover:text-signal/80"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            ) : null}
          </div>

          <BookingTracker booking={booking} />
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border p-4 sm:p-5 lg:w-56 lg:border-t-0 lg:border-l">
        <div className="lg:text-right">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Ticket</p>
          <p className="font-mono text-sm font-semibold break-all text-ink">
            #{ticketCode(booking._id)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>

        <div className="lg:text-right">
          <p className="text-xs text-muted-foreground">Final amount</p>
          <p className="font-heading text-lg font-semibold text-ink">
            {formatMoney(booking.finalAmount)}
          </p>
        </div>

        {actions ? (
          <div className="mt-auto flex flex-wrap gap-2 lg:justify-end">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}
