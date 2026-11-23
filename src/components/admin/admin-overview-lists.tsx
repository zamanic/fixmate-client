"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CircleAlert, RotateCw } from "lucide-react";

import { normalizeBookings, normalizeServices } from "@/components/admin/normalize";
import { BookingStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { formatMoney, type Booking, type Service } from "@/lib/types";

const LIST_LIMIT = 4;

type LoadState = {
  services: Service[] | null;
  bookings: Booking[] | null;
  loading: boolean;
  failed: boolean;
};

const INITIAL_STATE: LoadState = {
  services: null,
  bookings: null,
  loading: true,
  failed: false,
};

function byNewest<T extends { createdAt?: string | null }>(a: T, b: T): number {
  return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
}

/** Two compact, live lists that sit under the Admin Overview charts. */
export function AdminOverviewLists() {
  const [state, setState] = useState<LoadState>(INITIAL_STATE);

  const load = useCallback(async () => {
    const [servicesResult, bookingsResult] = await Promise.allSettled([
      apiGet<{ items: Service[] }>("/api/admin/services", true),
      apiGet<{ items: Booking[] }>("/api/admin/bookings", true),
    ]);

    const services =
      servicesResult.status === "fulfilled"
        ? normalizeServices(servicesResult.value.items)
            .filter((service) => service.approvalStatus === "pending")
            .sort(byNewest)
            .slice(0, LIST_LIMIT)
        : null;

    const bookings =
      bookingsResult.status === "fulfilled"
        ? normalizeBookings(bookingsResult.value.items).sort(byNewest).slice(0, LIST_LIMIT)
        : null;

    setState({
      services,
      bookings,
      loading: false,
      failed: services === null && bookings === null,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void apiGet<{ items: Service[] }>("/api/admin/services", true)
      .then((servicesPayload) =>
        apiGet<{ items: Booking[] }>("/api/admin/bookings", true).then((bookingsPayload) => ({
          services: servicesPayload.items,
          bookings: bookingsPayload.items,
        }))
      )
      .then(({ services, bookings }) => {
        if (cancelled) return;
        setState({
          services: normalizeServices(services)
            .filter((service) => service.approvalStatus === "pending")
            .sort(byNewest)
            .slice(0, LIST_LIMIT),
          bookings: normalizeBookings(bookings).sort(byNewest).slice(0, LIST_LIMIT),
          loading: false,
          failed: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        void load();
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  function retry() {
    setState((current) => ({ ...current, loading: true, failed: false }));
    void load();
  }

  const { services, bookings, loading, failed } = state;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Services waiting for review</CardTitle>
            <CardDescription>Listings pending approval from technicians.</CardDescription>
          </div>
          <Link
            href="/dashboard/admin/services"
            className="shrink-0 text-xs font-semibold text-signal hover:underline"
          >
            Review services
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton />
          ) : failed || services === null ? (
            <ListError message="Couldn't load the review queue." onRetry={retry} />
          ) : services.length === 0 ? (
            <ListEmpty message="No services are waiting for review." />
          ) : (
            <ul className="divide-y divide-border">
              {services.map((service) => (
                <li key={service._id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{service.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {service.technicianName || "Unknown technician"} · {service.category}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
                    {formatMoney(service.basePrice)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Latest bookings</CardTitle>
            <CardDescription>The newest repair requests across FixMate.</CardDescription>
          </div>
          <Link
            href="/dashboard/admin/bookings"
            className="shrink-0 text-xs font-semibold text-signal hover:underline"
          >
            All bookings
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton />
          ) : failed || bookings === null ? (
            <ListError message="Couldn't load recent bookings." onRetry={retry} />
          ) : bookings.length === 0 ? (
            <ListEmpty message="No bookings have been raised yet." />
          ) : (
            <ul className="divide-y divide-border">
              {bookings.map((booking) => (
                <li key={booking._id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{booking.serviceTitle}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {booking.customerName || "Unknown customer"} with{" "}
                      {booking.technicianName || "unassigned technician"}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} className="shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      {Array.from({ length: LIST_LIMIT }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function ListEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 text-center">
      <CircleAlert className="size-5 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RotateCw aria-hidden /> Retry
      </Button>
    </div>
  );
}
