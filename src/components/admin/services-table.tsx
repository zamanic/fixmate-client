"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { normalizeServices } from "@/components/admin/normalize";
import { EmptyState } from "@/components/empty-state";
import { ServiceImage } from "@/components/services/service-image";
import { Spinner } from "@/components/spinner";
import { ApprovalStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, apiGet, apiPatch } from "@/lib/api";
import { crossFade } from "@/lib/motion/variants";
import {
  CATEGORY_TINT,
  formatDate,
  formatMoney,
  type ApprovalStatus,
  type Service,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const LIST_PATH = "/api/admin/services";

type Filter = "all" | ApprovalStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/** Moderation moves available on a row — the current status is filtered out. */
const MODERATION: {
  value: ApprovalStatus;
  label: string;
  icon: typeof Check;
  tone: string;
}[] = [
  { value: "approved", label: "Approve", icon: Check, tone: "text-status-completed" },
  { value: "rejected", label: "Reject", icon: X, tone: "text-status-rejected" },
  { value: "pending", label: "Move back to pending", icon: RotateCcw, tone: "text-status-inprogress" },
];

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * The admin moderation queue. Every listing on FixMate lands here: the table
 * reads `GET /api/admin/services` and each row can be approved, rejected or
 * pushed back to pending via `PATCH /api/admin/services/:id/approval`
 * (CONTRACT §6). The status filter runs on the already-fetched page — the admin
 * dataset is small and the whole point of this screen is to sweep it quickly.
 */
export function AdminServicesTable() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ items: Service[] }>(LIST_PATH, true);
      setItems(normalizeServices(data?.items ?? []));
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setItems((prev) => prev ?? []);
      toast.error(errorText(error, "We couldn't load the moderation queue."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ items: Service[] }>(LIST_PATH, true)
      .then((data) => {
        if (cancelled) return;
        setItems(normalizeServices(data?.items ?? []));
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        setItems((prev) => prev ?? []);
        toast.error(errorText(error, "We couldn't load the moderation queue."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: items?.length ?? 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const service of items ?? []) base[service.approvalStatus] += 1;
    return base;
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((service) => filter === "all" || service.approvalStatus === filter),
    [items, filter]
  );

  function retry() {
    setItems(null);
    setFailed(false);
    void load();
  }

  async function moderate(service: Service, next: ApprovalStatus) {
    setBusyId(service._id);
    try {
      const result = await apiPatch<{ message: string; service: Service }>(
        `/api/admin/services/${service._id}/approval`,
        { approvalStatus: next },
        true
      );
      const updated = result?.service ? normalizeServices([result.service])[0] : null;
      setItems((prev) =>
        prev?.map((item) => (item._id === service._id ? (updated ?? { ...item, approvalStatus: next }) : item)) ??
        prev
      );
      toast.success(result?.message ?? `Service ${next}.`);
    } catch (error) {
      toast.error(errorText(error, "We couldn't update that listing."));
    } finally {
      setBusyId(null);
    }
  }

  if (items === null) {
    return <ServicesTableSkeleton />;
  }

  if (failed && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load the moderation queue</h3>
        <p className="fm-body mx-auto mt-2 max-w-md text-muted-foreground">
          The FixMate service may be starting up. Please try again in a moment.
        </p>
        <Button className="mt-6" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No listings to moderate"
        description="Once technicians publish services they appear here for review. Approve a listing to make it discoverable in Explore Services."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter listings by approval status">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            role="tab"
            aria-selected={filter === option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                filter === option.value ? "bg-background/20" : "bg-muted"
              )}
            >
              {counts[option.value]}
            </span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={`Nothing ${filter === "all" ? "" : `${filter} `}right now`}
          description="No listings match this filter. Switch back to All to see the full queue."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Technician</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base price</TableHead>
                <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Moderate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {visible.map((service) => {
                  const rowBusy = busyId === service._id;
                  return (
                    <motion.tr
                      key={service._id}
                      layout
                      variants={crossFade}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <TableCell className="max-w-[22rem] py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-11 shrink-0 overflow-hidden rounded-lg",
                              CATEGORY_TINT[service.category]
                            )}
                          >
                            <ServiceImage src={service.image} alt={service.title} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{service.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {service.serviceMode} · {service.serviceArea}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {service.technicianName}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={cn("rounded-full border-0 text-ink", CATEGORY_TINT[service.category])}
                        >
                          {service.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium text-ink tabular-nums">
                        {formatMoney(service.basePrice)}
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(service.createdAt)}
                      </TableCell>

                      <TableCell>
                        <ApprovalStatusBadge status={service.approvalStatus} />
                      </TableCell>

                      <TableCell className="text-right">
                        {rowBusy ? (
                          <Spinner className="ml-auto" />
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {MODERATION.filter((move) => move.value !== service.approvalStatus).map(
                              (move) => (
                                <Button
                                  key={move.value}
                                  variant="ghost"
                                  size="icon-sm"
                                  className={move.tone}
                                  title={move.label}
                                  aria-label={`${move.label}: ${service.title}`}
                                  onClick={() => void moderate(service, move.value)}
                                >
                                  <move.icon />
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/** Layout-matched placeholders while the first fetch is in flight. */
export function ServicesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead className="hidden md:table-cell">Technician</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Base price</TableHead>
            <TableHead className="hidden lg:table-cell">Submitted</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead className="text-right">Moderate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-7 w-16 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
