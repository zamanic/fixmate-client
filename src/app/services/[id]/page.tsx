import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { normalizeService } from "@/components/services/normalize";
import { RequestRepairButton } from "@/components/services/request-repair-button";
import { ServiceDetailSkeleton } from "@/components/services/service-detail-skeleton";
import { ServiceImage } from "@/components/services/service-image";
import {
  parseServiceFrom,
  readRating,
  SERVICE_FROM_PARAM,
  type RawSearchParams,
} from "@/components/services/service-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth-server";
import { CATEGORY_TILE_IMAGE } from "@/lib/images";
import { API_URL } from "@/lib/server-api";
import { CATEGORY_TINT, formatMoney, initials, type Service } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}

type ServiceResult =
  | { ok: true; service: Service }
  | { ok: false; notFound: boolean };

/**
 * Read one service from the API. `cache` de-duplicates the request between
 * `generateMetadata` and the page body, and the result separates "no such
 * service" (→ 404) from "API unreachable" (→ a recoverable empty state).
 */
const loadService = cache(async (id: string): Promise<ServiceResult> => {
  try {
    const res = await fetch(`${API_URL}/api/services/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.status === 404 || res.status === 400) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };
    const data = (await res.json()) as { service?: Service };
    if (!data?.service) return { ok: false, notFound: true };
    return { ok: true, service: normalizeService(data.service) };
  } catch {
    return { ok: false, notFound: false };
  }
});

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadService(id);
  if (!result.ok) return { title: "Service not found" };
  return {
    title: result.service.title,
    description: result.service.description.slice(0, 160),
  };
}

export default function ServiceDetailPage({ params, searchParams }: ServiceDetailPageProps) {
  return (
    <div className="fm-shell fm-section">
      <Suspense fallback={<ServiceDetailSkeleton />}>
        <ServiceDetail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ServiceDetail({ params, searchParams }: ServiceDetailPageProps) {
  const { id } = await params;
  const result = await loadService(id);

  if (!result.ok) {
    if (result.notFound) notFound();
    return (
      <EmptyState
        icon={Wrench}
        title="We couldn't load this service"
        description="The FixMate service may be starting up. Please refresh in a moment, or head back to explore what's available."
        actionLabel="Explore services"
        actionHref="/services"
      />
    );
  }

  const service = result.service;
  const user = await getCurrentUser();
  const { average, count } = readRating(service);
  const tint = CATEGORY_TINT[service.category];

  // The Explore grid hands the filter it was browsing over as `?from=…`, so the
  // back link (and the sign-in round-trip) returns to that exact category view.
  const raw = await searchParams;
  const from = parseServiceFrom(raw[SERVICE_FROM_PARAM]);
  const returnHref = from ?? "/services";
  const detailPath = `/services/${encodeURIComponent(service._id)}`;
  const redirectTo = from
    ? `${detailPath}?${SERVICE_FROM_PARAM}=${encodeURIComponent(from)}`
    : detailPath;

  return (
    <>
      <Link
        href={returnHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to explore
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-8">
          <div
            className={cn(
              "relative aspect-[16/9] w-full overflow-hidden rounded-2xl",
              tint
            )}
          >
            <ServiceImage
              src={service.image}
              alt={service.title}
              priority
              fallbackSrc={CATEGORY_TILE_IMAGE[service.category]}
            />
            <Badge className={cn("absolute top-4 left-4 rounded-full border-0 text-ink", tint)}>
              {service.category}
            </Badge>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                {service.category}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {service.serviceMode}
              </Badge>
            </div>
            <h1 className="fm-h1 mt-4 font-bold text-ink">{service.title}</h1>
          </div>

          <TechnicianCard service={service} />

          <section>
            <h2 className="fm-h3 font-semibold text-ink">About this service</h2>
            <p className="fm-body mt-3 whitespace-pre-line text-muted-foreground">
              {service.description}
            </p>
          </section>

          <section>
            <h2 className="fm-h3 font-semibold text-ink">Service details</h2>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
              <Spec label="Base price" value={formatMoney(service.basePrice)} />
              <Spec label="Estimated duration" value={service.estimatedDuration} />
              <Spec label="Service mode" value={service.serviceMode} />
              <Spec label="Service area" value={service.serviceArea} />
              <Spec
                label="Average rating"
                value={
                  count > 0
                    ? `${average.toFixed(1)} (${count} review${count === 1 ? "" : "s"})`
                    : "New listing"
                }
              />
              <Spec
                label="Availability"
                value={service.isAvailable ? "Available now" : "Currently unavailable"}
              />
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <p className="fm-eyebrow">Booking summary</p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-ink">
                {formatMoney(service.basePrice)}
              </span>
              <span className="text-sm text-muted-foreground">base price</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The technician confirms the final price after reviewing your request.
            </p>

            <Separator className="my-4" />

            <dl className="space-y-3">
              <SummaryRow icon={Clock} label="Estimated duration" value={service.estimatedDuration} />
              <SummaryRow icon={Wrench} label="Service mode" value={service.serviceMode} />
              <SummaryRow icon={MapPin} label="Service area" value={service.serviceArea} />
              <SummaryRow
                icon={Star}
                label="Rating"
                value={count > 0 ? `${average.toFixed(1)} (${count})` : "New"}
              />
            </dl>

            <div className="mt-4">
              <Badge
                className={cn(
                  "rounded-full border-0",
                  service.isAvailable
                    ? "bg-status-completed/12 text-status-completed"
                    : "bg-status-cancelled/12 text-status-cancelled"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    service.isAvailable ? "bg-status-completed" : "bg-status-cancelled"
                  )}
                  aria-hidden
                />
                {service.isAvailable ? "Available now" : "Currently unavailable"}
              </Badge>
            </div>

            <div className="mt-5">
              <RequestRepairButton
                serviceId={service._id}
                role={user?.role ?? null}
                customerName={user?.name ?? ""}
                customerEmail={user?.email ?? ""}
                redirectTo={redirectTo}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function TechnicianCard({ service }: { service: Service }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal text-sm font-semibold text-white">
          {initials(service.technicianName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold text-ink">
            {service.technicianName}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            {service.serviceArea}
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-teal/12 text-teal">
          <ShieldCheck className="size-3" /> Verified
        </Badge>
      </div>
      <p className="fm-body mt-3 text-muted-foreground">
        A verified FixMate technician. Contact details are shared as soon as your
        repair request is accepted, so you can agree on the visit.
      </p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
