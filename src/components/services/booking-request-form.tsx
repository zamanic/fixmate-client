"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * The repair-request form shown inside the booking dialog. The fields, the
 * character counter and the validation are final — only the submit handler is
 * still a stub so the next build step can wire it to `POST /api/bookings`
 * without touching this UI.
 */
const MIN_DESCRIPTION = 20;
const MAX_DESCRIPTION = 600;

export function BookingRequestForm({ serviceId }: { serviceId: string }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problem, setProblem] = useState("");

  const descriptionLength = problem.trim().length;
  const remaining = Math.max(0, MIN_DESCRIPTION - descriptionLength);
  const canSubmit =
    phone.trim().length >= 6 &&
    address.trim().length >= 6 &&
    preferredDate !== "" &&
    descriptionLength >= MIN_DESCRIPTION;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    // TODO(f4): POST this request to `/api/bookings` and refresh the technician's queue.
    toast.info("Booking submission lands in the next build step.");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />

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
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="booking-date">Preferred date</Label>
          <Input
            id="booking-date"
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="booking-address">Service address</Label>
        <Input
          id="booking-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Flat, street, area — where should the technician come?"
          autoComplete="street-address"
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
        />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {remaining > 0
            ? `${remaining} more character${remaining === 1 ? "" : "s"} needed`
            : `${problem.length}/${MAX_DESCRIPTION}`}
        </p>
      </div>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={!canSubmit}>
        Send repair request
      </Button>
    </form>
  );
}
