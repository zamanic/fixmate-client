"use client";

import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import type { Service } from "@/lib/types";

import { useResultsPending } from "./results-pending";
import { ServiceGridSkeleton } from "./service-grid-skeleton";
import { ServicePagination } from "./service-pagination";
import type { ServiceQuery } from "./service-query";
import { ServicesGrid } from "./services-grid";

/**
 * The Explore results area. While the filter bar's transition is in flight the
 * grid resolves to layout-matched card skeletons rather than the stale list, so
 * the region under the filter card always reflects "we're fetching" instead of
 * looking settled.
 */
export function ServicesResults({
  items,
  query,
  page,
  pages,
}: {
  items: Service[];
  query: ServiceQuery;
  page: number;
  pages: number;
}) {
  const { pending } = useResultsPending();

  if (pending) {
    return <ServiceGridSkeleton count={items.length || 6} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No services match your filters"
        description="Try a different category, widen the price range or clear your filters to see every available technician."
        actionLabel="Clear filters"
        actionHref="/services"
      />
    );
  }

  return (
    <>
      <ServicesGrid items={items} query={query} />
      <ServicePagination page={page} pages={pages} query={query} className="mt-10" />
    </>
  );
}
