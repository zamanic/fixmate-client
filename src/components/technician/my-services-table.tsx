"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EllipsisVertical, Pencil, Store, Trash } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { normalizeService, normalizeServices } from "@/components/services/normalize";
import { ServiceImage } from "@/components/services/service-image";
import { Spinner } from "@/components/spinner";
import { ApprovalStatusBadge } from "@/components/status-badge";
import { ServiceForm } from "@/components/technician/service-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, apiDelete, apiGet, apiPatch } from "@/lib/api";
import { crossFade } from "@/lib/motion/variants";
import { CATEGORY_TINT, formatMoney, type Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const MINE_PATH = "/api/services/mine";

function fetchMine() {
  return apiGet<{ items: Service[] }>(MINE_PATH, true);
}

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * The technician's listings. Data is fetched on the client so availability
 * toggles and deletes update in place — no full reload, and the deleted row
 * animates out. Every mutation is optimistic and reverts (with a toast) if the
 * server rejects it.
 */
export function MyServicesTable() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMine();
      setItems(normalizeServices(data.items ?? []));
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setItems((prev) => prev ?? []);
      toast.error(errorText(error, "We couldn't load your services."));
    }
  }, []);

  // Initial load. The setState calls live inside the promise callbacks so the
  // mount effect never sets state synchronously (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    fetchMine()
      .then((data) => {
        if (cancelled) return;
        setItems(normalizeServices(data.items ?? []));
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        setItems((prev) => prev ?? []);
        toast.error(errorText(error, "We couldn't load your services."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function retry() {
    setItems(null);
    setFailed(false);
    void load();
  }

  async function toggleAvailability(service: Service, next: boolean) {
    const previous = service.isAvailable;
    setBusyId(service._id);
    setItems((prev) =>
      prev?.map((item) => (item._id === service._id ? { ...item, isAvailable: next } : item)) ?? prev
    );
    try {
      const result = await apiPatch<{ message: string; service: Service }>(
        `/api/services/${service._id}/availability`,
        { isAvailable: next },
        true
      );
      if (result?.service) {
        setItems((prev) =>
          prev?.map((item) =>
            item._id === service._id ? normalizeService(result.service) : item
          ) ?? prev
        );
      }
      toast.success(
        next ? "Listing is available to book." : "Listing paused — customers can't request it."
      );
    } catch (error) {
      setItems((prev) =>
        prev?.map((item) =>
          item._id === service._id ? { ...item, isAvailable: previous } : item
        ) ?? prev
      );
      toast.error(errorText(error, "We couldn't update availability."));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeletePending(true);
    try {
      await apiDelete(`/api/services/${target._id}`, true);
      setItems((prev) => prev?.filter((item) => item._id !== target._id) ?? prev);
      toast.success(`“${target.title}” was deleted.`);
      setDeleting(null);
    } catch (error) {
      toast.error(errorText(error, "We couldn't delete that listing."));
    } finally {
      setDeletePending(false);
    }
  }

  if (items === null) {
    return <ServicesTableSkeleton />;
  }

  if (failed && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load your services</h3>
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
        icon={Store}
        title="You haven't listed a service yet"
        description="Add your first service with a category, base price and service area. A FixMate admin reviews it before it appears in Explore Services."
        actionLabel="Add your first service"
        actionHref="/dashboard/technician/add-service"
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <Table className="min-w-[840px]">
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {items.map((service) => {
                const rowBusy = busyId === service._id;
                return (
                  <motion.tr
                    key={service._id}
                    layout
                    variants={crossFade}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="border-b transition-colors hover:bg-muted/50"
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

                    <TableCell>
                      <Badge
                        className={cn("rounded-full border-0 text-ink", CATEGORY_TINT[service.category])}
                      >
                        {service.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium text-ink">
                      {formatMoney(service.basePrice)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.isAvailable}
                          disabled={rowBusy}
                          onCheckedChange={(checked) => void toggleAvailability(service, checked)}
                          aria-label={`Toggle availability for ${service.title}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {service.isAvailable ? "Available" : "Paused"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <ApprovalStatusBadge status={service.approvalStatus} />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={rowBusy}
                              aria-label={`Actions for ${service.title}`}
                            />
                          }
                        >
                          {rowBusy ? <Spinner /> : <EllipsisVertical />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(service)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(service)}>
                            <Trash /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>
              Saving changes sends “{editing?.title}” back to Pending for admin review.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <ServiceForm
              mode="edit"
              service={editing}
              onDone={() => {
                setEditing(null);
                void load();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this listing?"
        description={`“${deleting?.title ?? "This service"}” will be removed from FixMate for good. Existing customers keep their booking history, but new requests will no longer be possible.`}
        confirmLabel="Delete listing"
        cancelLabel="Keep listing"
        pending={deletePending}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/** Layout-matched placeholders while the first fetch is in flight. */
function ServicesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <Table className="min-w-[840px]">
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Base price</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, index) => (
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
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-10 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto size-7 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
