import type { Booking } from "@/lib/types";

/**
 * The Express API serialises every document with a public `id` field, while the
 * shared client types key on `_id`. The admin moderation tables need the real id
 * to PATCH a row, so the same domain adapters the rest of the app uses are
 * re-exported here — `_id` wins when present, otherwise the API's `id` is
 * promoted.
 *
 * `AppUser` already keys on `id`, so users need no adapter.
 */

export { normalizeService, normalizeServices } from "@/components/services/normalize";
export { normalizePayments } from "@/components/payments/normalize";

export function normalizeBooking(raw: Booking & { id?: string }): Booking {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function normalizeBookings(items: Booking[]): Booking[] {
  return items.map((item) => normalizeBooking(item as Booking & { id?: string }));
}
