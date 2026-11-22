import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX, Wrench } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { normalizeServices } from "@/components/services/normalize";
import { ServiceFilters } from "@/components/services/service-filters";
import { ServiceGridSkeleton } from "@/components/services/service-grid-skeleton";
import { ServicePagination } from "@/components/services/service-pagination";
import {
  parseServiceQuery,
  serviceApiPath,
  type RawSearchParams,
} from "@/components/services/service-query";
import { ServicesGrid } from "@/components/services/services-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/server-api";
import type { Paginated, Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explore Services",
  description:
    "Browse approved home-repair services from verified FixMate technicians. Filter by category, service mode, area and price, then request a repair.",
};

interface ServicesPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * Explore Services. The URL is the single source of truth: every filter, sort
 * and page lives in `?search=…&category=…&page=…`, the server reads it and
 * fetches once — the grid is never filtered on the client.
 */
export default function ServicesPage({ searchParams }: ServicesPageProps) {
  return (
    <div className="fm-shell fm-section">
      <header className="max-w-3xl">
        <p className="fm-eyebrow">Explore services</p>
        <h1 className="fm-h1 mt-3 font-bold text-ink">Find the right technician, fast.</h1>
        <p className="fm-body mt-4 text-muted-foreground">
          Every listing below comes from a verified FixMate technician. Filter by the
          device, how you want it fixed and what you can spend — then send a repair
          request in a couple of taps.
        </p>
      </header>

      <Suspense fallback={<ExplorerSkeleton />}>
        <ServicesExplorer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** The data-dependent half: reads the URL, fetches once, renders filters + grid. */
async function ServicesExplorer({ searchParams }: ServicesPageProps) {
  const raw = await searchParams;
  const query = parseServiceQuery(raw);
  const data = await serverFetch<Paginated<Service>>(serviceApiPath(query));

  if (!data) {
    return (
      <div className="mt-10">
        <EmptyState
          icon={Wrench}
          title="We couldn't load services right now"
          description="The FixMate service may be starting up. Please refresh in a moment, or head back home and try again."
          actionLabel="Return to home"
          actionHref="/"
        />
      </div>
    );
  }

  const items = normalizeServices(data.items);

  return (
    <>
      <div className="mt-10">
        <ServiceFilters total={data.total} />
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No services match your filters"
            description="Try a different category, widen the price range or clear your filters to see every available technician."
            actionLabel="Clear filters"
            actionHref="/services"
          />
        ) : (
          <>
            <ServicesGrid items={items} />
            <ServicePagination
              page={data.page}
              pages={data.pages}
              query={query}
              className="mt-10"
            />
          </>
        )}
      </div>
    </>
  );
}

/** Layout-matched fallback so the page does not jump when results stream in. */
function ExplorerSkeleton() {
  return (
    <>
      <div className="mt-10 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="mt-8">
        <ServiceGridSkeleton count={6} />
      </div>
    </>
  );
}
