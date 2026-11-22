import { Badge } from "@/components/ui/badge";
import {
  APPROVAL_STATUS_CLASS,
  APPROVAL_STATUS_LABEL,
  BOOKING_STATUS_CLASS,
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  type ApprovalStatus,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The three badge families of the job lifecycle. Colours always come from the
 * token maps in `lib/types.ts`, so a status can never be a different colour on
 * two screens. See `.project/CONTRACT.md` §10.
 */

const BASE = "rounded-full border-0 ring-1 ring-inset";

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(BASE, BOOKING_STATUS_CLASS[status], className)}>
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(BASE, PAYMENT_STATUS_CLASS[status], className)}>
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ApprovalStatusBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(BASE, APPROVAL_STATUS_CLASS[status], className)}>
      {APPROVAL_STATUS_LABEL[status]}
    </Badge>
  );
}
