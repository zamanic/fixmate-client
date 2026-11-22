"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatDate, initials, ROLES, ROLE_LABEL, type AppUser, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const LIST_PATH = "/api/admin/users";

const ROLE_CLASS: Record<Role, string> = {
  customer: "bg-muted text-muted-foreground ring-foreground/10",
  technician: "bg-status-accepted/12 text-status-accepted ring-status-accepted/25",
  admin: "bg-signal/12 text-signal ring-signal/25",
};

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * The admin member directory. Reads `GET /api/admin/users` and lets an admin
 * promote or demote any account through `PATCH /api/admin/users/:id/role`
 * (CONTRACT §6). The server refuses to change the caller's own role, so that
 * row's control is disabled rather than left to bounce off a 403.
 */
export function AdminUsersTable({ currentEmail }: { currentEmail: string }) {
  const [items, setItems] = useState<AppUser[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ items: AppUser[] }>(LIST_PATH, true);
      setItems(data?.items ?? []);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setItems((prev) => prev ?? []);
      toast.error(errorText(error, "We couldn't load the member list."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ items: AppUser[] }>(LIST_PATH, true)
      .then((data) => {
        if (cancelled) return;
        setItems(data?.items ?? []);
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        setItems((prev) => prev ?? []);
        toast.error(errorText(error, "We couldn't load the member list."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const base: Record<"all" | Role, number> = {
      all: items?.length ?? 0,
      customer: 0,
      technician: 0,
      admin: 0,
    };
    for (const user of items ?? []) base[user.role] += 1;
    return base;
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((user) => roleFilter === "all" || user.role === roleFilter),
    [items, roleFilter]
  );

  function retry() {
    setItems(null);
    setFailed(false);
    void load();
  }

  async function changeRole(user: AppUser, next: Role) {
    if (next === user.role) return;
    const previous = user.role;
    setBusyId(user.id);
    setItems((prev) =>
      prev?.map((item) => (item.id === user.id ? { ...item, role: next } : item)) ?? prev
    );
    try {
      const result = await apiPatch<{ message: string; user: AppUser }>(
        `/api/admin/users/${user.id}/role`,
        { role: next },
        true
      );
      if (result?.user) {
        setItems((prev) =>
          prev?.map((item) => (item.id === user.id ? { ...item, ...result.user } : item)) ?? prev
        );
      }
      toast.success(result?.message ?? "Role updated.");
    } catch (error) {
      setItems((prev) =>
        prev?.map((item) => (item.id === user.id ? { ...item, role: previous } : item)) ?? prev
      );
      toast.error(errorText(error, "We couldn't change that role."));
    } finally {
      setBusyId(null);
    }
  }

  if (items === null) {
    return <UsersTableSkeleton />;
  }

  if (failed && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load the member list</h3>
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
        icon={UsersRound}
        title="No members yet"
        description="Every account that signs up through FixMate appears here, ready for a role change."
      />
    );
  }

  const FILTERS: { value: "all" | Role; label: string }[] = [
    { value: "all", label: "All" },
    ...ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter members by role">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            role="tab"
            aria-selected={roleFilter === option.value}
            variant={roleFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter(option.value)}
          >
            {option.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                roleFilter === option.value ? "bg-background/20" : "bg-muted"
              )}
            >
              {counts[option.value]}
            </span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No members in this group"
          description="No accounts match this role filter. Switch back to All to see everyone."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Area</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Set role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {visible.map((user) => {
                  const isSelf = Boolean(currentEmail) && user.email.toLowerCase() === currentEmail.toLowerCase();
                  const rowBusy = busyId === user.id;
                  return (
                    <motion.tr
                      key={user.id}
                      layout
                      variants={crossFade}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image || undefined} alt="" />
                            <AvatarFallback>{initials(user.name || user.email)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-medium text-ink">
                              {user.name || "Unnamed member"}
                              {isSelf ? (
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={cn("rounded-full border-0 ring-1 ring-inset", ROLE_CLASS[user.role])}>
                          {ROLE_LABEL[user.role]}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {user.phone || "—"}
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {user.area || "—"}
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        {rowBusy ? (
                          <Spinner className="ml-auto" />
                        ) : (
                          <Select
                            value={user.role}
                            disabled={isSelf}
                            onValueChange={(value) => void changeRole(user, value as Role)}
                          >
                            <SelectTrigger
                              size="sm"
                              className="ml-auto w-[8.5rem]"
                              aria-label={`Change role for ${user.name || user.email}`}
                            >
                              <SelectValue>
                                {(value) => ROLE_LABEL[(value as Role) ?? user.role] ?? ROLE_LABEL[user.role]}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {ROLE_LABEL[role]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
export function UsersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Area</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="text-right">Set role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-7 w-[8.5rem] rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
