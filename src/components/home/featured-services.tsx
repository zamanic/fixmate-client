import { Wrench } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ServiceGridSkeleton } from "@/components/services/service-grid-skeleton";
import { ServicesGrid } from "@/components/services/services-grid";
import { serverFetch } from "@/lib/server-api";
import type { Service } from "@/lib/types";

/**
 * The six newest approved + available listings (`/api/services/featured`).
 *
 * This is the data-dependent half of the Featured section, so the page wraps it
 * in a `<Suspense>` boundary — Cache Components will not accept an uncached
 * fetch during a prerender otherwise.
 */
export async function FeaturedServices() {
  const data = await serverFetch<{ items: Service[] }>("/api/services/featured?limit=6");
  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No services are live yet"
        description="Our technicians are still publishing their listings. Browse everything, or check back in a few minutes."
        actionLabel="Explore all services"
        actionHref="/services"
      />
    );
  }

  return <ServicesGrid items={items} />;
}

/** Layout-matched fallback so the grid does not jump when listings land. */
export function FeaturedServicesSkeleton() {
  return <ServiceGridSkeleton count={6} />;
}
