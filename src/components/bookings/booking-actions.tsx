"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Play, X } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiPatch } from "@/lib/api";
import type { Booking } from "@/lib/types";

import { normalizeBooking } from "./normalize";

/**
 * The status/role-legal actions for one booking. It never offers an action the
 * server would reject with 409 — the current status (and the caller's role)
 * decides what is rendered.
 *
 *   customer   → Cancel request            (only from `requested`)
 *   technician → Accept / Reject           (from `requested`)
 *              → Start work                (from `accepted`)
 *              → Mark completed            (from `in-progress`, asks finalAmount)
 *
 * A successful action updates the parent in place via `onChanged` (no reload);
 * an `ApiError` toasts the server message and refreshes to reconcile.
 */

type ActionKind = "accept" | "reject" | "start" | "complete" | "cancel";

interface StatusResponse {
  message?: string;
  booking?: Booking;
}

export function BookingActions({
  booking,
  role,
  onChanged,
}: {
  booking: Booking;
  role: "customer" | "technician";
  onChanged: (booking: Booking) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ActionKind | null>(null);
  const [confirming, setConfirming] = useState<"cancel" | "reject" | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [amount, setAmount] = useState(String(booking.finalAmount ?? ""));

  const busy = pending !== null;
  const parsedAmount = Number(amount);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  async function run(
    kind: ActionKind,
    body: Record<string, unknown>,
    patch: Partial<Booking>,
    successMessage: string
  ) {
    setPending(kind);
    try {
      const result = await apiPatch<StatusResponse>(
        `/api/bookings/${booking._id}/status`,
        body,
        true
      );
      onChanged(
        result?.booking
          ? normalizeBooking(result.booking as Booking & { id?: string })
          : { ...booking, ...patch }
      );
      toast.success(result?.message ?? successMessage);
      return true;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again."
      );
      router.refresh();
      return false;
    } finally {
      setPending(null);
    }
  }

  async function confirmAction() {
    if (confirming === "cancel") {
      setPending("cancel");
      try {
        const result = await apiPatch<StatusResponse>(
          `/api/bookings/${booking._id}/cancel`,
          {},
          true
        );
        onChanged(
          result?.booking
            ? normalizeBooking(result.booking as Booking & { id?: string })
            : { ...booking, status: "cancelled" }
        );
        toast.success(result?.message ?? "Your request was cancelled.");
        setConfirming(null);
      } catch (error) {
        toast.error(
          error instanceof ApiError ? error.message : "We couldn't cancel that request."
        );
        router.refresh();
      } finally {
        setPending(null);
      }
      return;
    }

    if (confirming === "reject") {
      const ok = await run(
        "reject",
        { status: "rejected" },
        { status: "rejected" },
        "Request rejected."
      );
      if (ok) setConfirming(null);
    }
  }

  async function complete() {
    if (!amountValid) return;
    const ok = await run(
      "complete",
      { status: "completed", finalAmount: parsedAmount },
      { status: "completed", finalAmount: parsedAmount },
      "Job completed. The customer can now pay."
    );
    if (ok) setCompleteOpen(false);
  }

  /* ----------------------------- customer ----------------------------- */
  if (role === "customer") {
    // TODO(f7): render the "Pay now" action here for completed + unpaid bookings.
    if (booking.status !== "requested") return null;

    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => setConfirming("cancel")}
        >
          {pending === "cancel" ? <Spinner /> : <X />} Cancel request
        </Button>

        <ConfirmDialog
          open={confirming === "cancel"}
          onOpenChange={(open) => {
            if (!open) setConfirming(null);
          }}
          title="Cancel this request?"
          description={`“${booking.serviceTitle}” will be withdrawn and the technician will not visit. You can send a new request later.`}
          confirmLabel="Cancel request"
          cancelLabel="Keep request"
          pending={pending === "cancel"}
          onConfirm={confirmAction}
        />
      </>
    );
  }

  /* ---------------------------- technician ---------------------------- */
  if (booking.status === "requested") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => setConfirming("reject")}
        >
          {pending === "reject" ? <Spinner /> : <X />} Reject
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            void run(
              "accept",
              { status: "accepted" },
              { status: "accepted" },
              "Request accepted — the customer can now see your contact details."
            )
          }
        >
          {pending === "accept" ? <Spinner /> : <Check />} Accept
        </Button>

        <ConfirmDialog
          open={confirming === "reject"}
          onOpenChange={(open) => {
            if (!open) setConfirming(null);
          }}
          title="Reject this request?"
          description={`“${booking.customerName}” will be told the request for “${booking.serviceTitle}” was declined. This cannot be undone.`}
          confirmLabel="Reject request"
          cancelLabel="Keep it"
          pending={pending === "reject"}
          onConfirm={confirmAction}
        />
      </>
    );
  }

  if (booking.status === "accepted") {
    return (
      <Button
        size="sm"
        disabled={busy}
        onClick={() =>
          void run(
            "start",
            { status: "in-progress" },
            { status: "in-progress" },
            "Job marked as in progress."
          )
        }
      >
        {pending === "start" ? <Spinner /> : <Play />} Start work
      </Button>
    );
  }

  if (booking.status === "in-progress") {
    return (
      <>
        <Button size="sm" disabled={busy} onClick={() => setCompleteOpen(true)}>
          {pending === "complete" ? <Spinner /> : <Check />} Mark completed
        </Button>

        <Dialog
          open={completeOpen}
          onOpenChange={(open) => {
            if (!busy) setCompleteOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Finish this job</DialogTitle>
              <DialogDescription>
                Confirm the final amount for “{booking.serviceTitle}”. The customer pays
                once the job is completed.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor={`final-amount-${booking._id}`}>Final amount (USD)</Label>
              <Input
                id={`final-amount-${booking._id}`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={!amountValid}
                disabled={busy}
              />
              {!amountValid ? (
                <p className="text-xs text-destructive">
                  Enter an amount greater than 0.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This is what the customer will be charged.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" disabled={busy} onClick={() => setCompleteOpen(false)}>
                Cancel
              </Button>
              <Button disabled={busy || !amountValid} onClick={() => void complete()}>
                {pending === "complete" ? <Spinner className="mr-2" /> : null}
                {pending === "complete" ? "Completing…" : "Mark completed"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
