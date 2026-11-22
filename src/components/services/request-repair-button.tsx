"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wrench } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

import { BookingRequestForm, type TicketReceipt } from "./booking-request-form";

/**
 * The primary call to action on a service page.
 *
 * • signed out  → link to sign in, returning to this listing afterwards
 * • customer    → one dialog with two steps: the repair-request form, then the
 *                 "Request sent" confirmation that carries the ticket id
 * • technician/admin → a disabled button that explains who can request repairs
 */
export function RequestRepairButton({
  serviceId,
  role,
  customerName,
  customerEmail,
  redirectTo,
}: {
  serviceId: string;
  role: Role | null;
  customerName: string;
  customerEmail: string;
  redirectTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<TicketReceipt | null>(null);

  if (role === null) {
    return (
      <Link
        href={`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
      >
        <Wrench /> Sign in to request
      </Link>
    );
  }

  if (role !== "customer") {
    return (
      <div className="space-y-2">
        <Button size="lg" className="h-11 w-full" disabled>
          <Wrench /> Request Repair
        </Button>
        <p className="text-xs text-muted-foreground">
          Only customer accounts can request repairs.
        </p>
      </div>
    );
  }

  // Closing from any step clears the ticket, so reopening always starts at the
  // form instead of flashing the previous confirmation.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setReceipt(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="lg" className="h-11 w-full" />}>
        <Wrench /> Request Repair
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {receipt ? (
          <RequestSent receipt={receipt} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request this repair</DialogTitle>
              <DialogDescription>
                Tell us where and when, and what is wrong. The technician confirms
                availability and the final price before any work starts.
              </DialogDescription>
            </DialogHeader>
            <BookingRequestForm
              serviceId={serviceId}
              customerName={customerName}
              customerEmail={customerEmail}
              onSuccess={setReceipt}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * The confirmation step. Rendered inside the same dialog once the API has
 * stored the request — closing it keeps the visitor on the listing, while the
 * second action jumps straight to their bookings.
 */
function RequestSent({ receipt }: { receipt: TicketReceipt }) {
  const router = useRouter();

  return (
    <>
      <DialogHeader className="items-center text-center">
        <span className="grid size-12 place-items-center rounded-full bg-status-completed/12 text-status-completed">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <DialogTitle className="text-lg">Request sent</DialogTitle>
        <DialogDescription>
          Ticket <span className="font-mono break-all text-ink">#{receipt.ticketId}</span> is with{" "}
          <span className="font-medium text-ink">{receipt.technicianName}</span>. You will see it
          move to accepted once they review it.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        <Button onClick={() => router.push("/dashboard/customer/bookings")}>
          Go to my bookings
        </Button>
      </DialogFooter>
    </>
  );
}
