import type { Booking, Service } from "@/lib/types";

/**
 * The Express API serialises every document with a public `id` field, while the
 * shared client types key on `_id`. The admin moderation tables need the real id
 * to PATCH a row, so the same adapter the bookings/payments tables use is applied
 * here too — `_id` wins when present, otherwise the API's `id` is promoted.
 *
 * `AppUser` already keys on `id`, so users need no adapter.
 */

export function normalizeService(raw: Service & { id?: string }): Service {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function normalizeServices(items: Service[]): Service[] {
  return items.map((item) => normalizeService(item as Service & { id?: string }));
}

export function normalizeBooking(raw: Booking & { id?: string }): Booking {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function normalizeBookings(items: Booking[]): Booking[] {
  return items.map((item) => normalizeBooking(item as Booking & { id?: string }));
}

export { normalizePayments } from "@/components/payments/normalize";
