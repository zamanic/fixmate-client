import type { Booking } from "@/lib/types";

/**
 * The Express API serialises documents with a public `id` field, while the
 * shared `Booking` type (the client's single source of truth) keys on `_id`.
 * This adapter accepts either so an action can always resolve the id it POSTs
 * to — `_id` wins when present, otherwise the API's `id` is promoted.
 */
export function normalizeBooking(raw: Booking & { id?: string }): Booking {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function normalizeBookings(items: Booking[]): Booking[] {
  return items.map((item) => normalizeBooking(item as Booking & { id?: string }));
}

/* ------------------------------------------------------------------ */
/* Defensive readers                                                   */
/* ------------------------------------------------------------------ */
/* A row from the API is untrusted at the boundary: a legacy document or a   */
/* partially-migrated one can arrive with a missing field. These helpers keep */
/* the dashboard's derived math and lookups from ever producing NaN or        */
/* throwing on such a row.                                                    */

/** `createdAt` as finite epoch millis — `0` when absent or unparsable. */
function createdAtTime(value: string | Date | null | undefined): number {
  if (!value) return 0;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

/** Newest-first ordering that survives a missing or malformed `createdAt`. */
export function byNewestFirst(a: Booking, b: Booking): number {
  return createdAtTime(b.createdAt) - createdAtTime(a.createdAt);
}

/** The amount a booking contributes to a money total — never `NaN`. */
export function bookingAmount(booking: Pick<Booking, "finalAmount" | "basePrice">): number {
  const { finalAmount, basePrice } = booking;
  if (typeof finalAmount === "number" && Number.isFinite(finalAmount)) return finalAmount;
  if (typeof basePrice === "number" && Number.isFinite(basePrice)) return basePrice;
  return 0;
}

/** The category label a row charts under — never an empty or missing key. */
export function bookingCategory(booking: Pick<Booking, "category">): string {
  return booking.category || "Uncategorised";
}
