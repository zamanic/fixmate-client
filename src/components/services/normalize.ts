import { serviceImageFor } from "@/lib/service-images";
import type { Service } from "@/lib/types";

/**
 * The Express API serialises every document with a public `id` field, while the
 * shared client types key on `_id` (CONTRACT §2). The services flow therefore
 * adapts at the boundary — `_id` wins when present, otherwise the API's `id` is
 * promoted — exactly like the bookings and payments adapters.
 *
 * Without this the grid's React keys and every `/services/${id}` link would be
 * built from `service._id`, which the API never sends.
 */

export function normalizeService(raw: Service & { id?: string }): Service {
  return {
    ...raw,
    _id: raw._id || raw.id || "",
    image: serviceImageFor(raw.title, raw.image),
  };
}

export function normalizeServices(items: Service[]): Service[] {
  return items.map((item) => normalizeService(item as Service & { id?: string }));
}
