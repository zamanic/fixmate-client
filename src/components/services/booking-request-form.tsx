"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPost } from "@/lib/api";

/**
 * The repair-request form shown inside the booking dialog.
 *
 * Submits to `POST /api/bookings` (CONTRACT §6) as the signed-in customer. The
 * server owns the rules that matter — the listing must be approved and
 * available, you cannot request your own service, and one active request per
 * service is enforced with a 409 `ACTIVE_REQUEST_EXISTS`. The client mirrors
 * the date rule inline so a past date never costs a round-trip.
 */
const MIN_DESCRIPTION = 20;
const MAX_DESCRIPTION = 600;
const MIN_PHONE = 6;
const MIN_ADDRESS = 6;

interface CreateBookingResponse {
  message?: string;
  booking?: { id: string };
}

export function BookingRequestForm({
  serviceId,
  onSuccess,
}: {
  serviceId: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problem, setProblem] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const descriptionLength = problem.trim().length;
  const remaining = Math.max(0, MIN_DESCRIPTION - descriptionLength);
  const canSubmit =
    !busy &&
    phone.trim().length >= MIN_PHONE &&
    address.trim().length >= MIN_ADDRESS &&
    preferredDate !== "" &&
    descriptionLength >= MIN_DESCRIPTION;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    // A date-only value parses to UTC midnight, which is exactly how the server
    // reads it — so anything today or earlier is already in the past for them.
    const picked = new Date(preferredDate);
    if (Number.isNaN(picked.getTime()) || picked.getTime() < Date.now()) {
      setDateError("Pick tomorrow or a later date — a technician can't be booked in the past.");
      return;
    }
    setDateError(null);
    setBusy(true);

    try {
      const result = await apiPost<CreateBookingResponse>(
        "/api/bookings",
        {
          serviceId,
          customerPhone: phone.trim(),
          address: address.trim(),
          preferredDate: picked.toISOString(),
          problemDescription: problem.trim(),
        },
        true
      );
      toast.success(result?.message ?? "Request sent to the technician.");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "We couldn't send that request. Please try again.";
      if (error instanceof ApiError && error.code === "ACTIVE_REQUEST_EXISTS") {
        toast.error(message, {
          action: {
            label: "View requests",
            onClick: () => router.push("/dashboard/customer/bookings"),
          },
        });
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="booking-phone">Contact phone</Label>
          <Input
            id="booking-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+880 1XXX-XXXXXX"
            autoComplete="tel"
            disabled={busy}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="booking-date">Preferred date</Label>
          <Input
            id="booking-date"
            type="date"
            value={preferredDate}
            onChange={(event) => {
              setPreferredDate(event.target.value);
              setDateError(null);
            }}
            disabled={busy}
            aria-invalid={dateError !== null}
            aria-describedby={dateError ? "booking-date-error" : undefined}
          />
        </div>
      </div>
      {dateError ? (
        <p id="booking-date-error" className="text-xs text-destructive" aria-live="polite">
          {dateError}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="booking-address">Service address</Label>
        <Input
          id="booking-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Flat, street, area — where should the technician come?"
          autoComplete="street-address"
          disabled={busy}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="booking-problem">What needs fixing?</Label>
        <Textarea
          id="booking-problem"
          value={problem}
          maxLength={MAX_DESCRIPTION}
          rows={4}
          onChange={(event) => setProblem(event.target.value)}
          placeholder="Describe the fault — the device, what happens and how long it has been like that."
          aria-invalid={problem.length > 0 && descriptionLength < MIN_DESCRIPTION}
          disabled={busy}
        />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {remaining > 0
            ? `${remaining} more character${remaining === 1 ? "" : "s"} needed`
            : `${problem.length}/${MAX_DESCRIPTION}`}
        </p>
      </div>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={!canSubmit}>
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending request…
          </>
        ) : (
          "Send repair request"
        )}
      </Button>
    </form>
  );
}
