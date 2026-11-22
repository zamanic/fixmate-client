import type { Payment } from "@/lib/types";

/**
 * The Express API serialises payment documents with a public `id` field while
 * the shared `Payment` type keys on `_id` (same split as bookings). This
 * adapter accepts either so a row can always resolve a stable React key.
 */
export function normalizePayment(raw: Payment & { id?: string }): Payment {
  return { ...raw, _id: raw._id || raw.id || "" };
}

export function normalizePayments(items: Payment[]): Payment[] {
  return items.map((item) => normalizePayment(item as Payment & { id?: string }));
}
