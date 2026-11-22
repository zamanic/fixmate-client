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
