"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { ServiceImage } from "@/components/services/service-image";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_TINT, formatDate, formatMoney, initials, type Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingTracker } from "./booking-tracker";

/** Characters of `problemDescription` shown before the "Show more" expander. */
const DESCRIPTION_LIMIT = 160;

/**
 * The one booking card, reused by both dashboards. It reads top-to-bottom like
 * a job record: what was booked, who the counterparty is, when and where, what
 * the problem was, the live timeline, then the money and the actions.
 *
 * Equal height by default (`h-full` + flex column) so a row of cards never
 * staggers. `role` picks the counterparty — the customer sees the technician,
 * the technician sees the customer.
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
        "flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      <div className={cn("relative aspect-[16/10] w-full overflow-hidden", tint)}>
        <ServiceImage src={booking.serviceImage} alt={booking.serviceTitle} />
        <Badge className={cn("absolute top-3 left-3 rounded-full border-0 text-ink", tint)}>
          {booking.category}
        </Badge>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="fm-h3 font-semibold text-ink">{booking.serviceTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Requested {formatDate(booking.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-2.5">
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

        <dl className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Preferred date</dt>
            <dd>Preferred {formatDate(booking.preferredDate)}</dd>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Address</dt>
            <dd className="min-w-0">{booking.address}</dd>
          </div>
        </dl>

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

        <BookingTracker booking={booking} className="mt-auto" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Final amount</p>
            <p className="font-heading text-lg font-semibold text-ink">
              {formatMoney(booking.finalAmount)}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
        </div>
      </div>
    </article>
  );
}
