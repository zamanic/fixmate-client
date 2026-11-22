"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  CircleAlert,
  ClipboardList,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/bookings/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiGet } from "@/lib/api";
import { staggerParent } from "@/lib/motion/variants";
import { BOOKING_STATUS_LABEL, formatMoney, type BookingStatus } from "@/lib/types";

const STATS_PATH = "/api/admin/stats";

/** Exactly the shape `GET /api/admin/stats` returns (CONTRACT §6). */
interface AdminStats {
  users: { total: number; customers: number; technicians: number; admins: number };
  services: { total: number; pending: number; approved: number; rejected: number; available: number };
  bookings: {
    total: number;
    byStatus: Record<BookingStatus, number>;
    active: number;
    completed: number;
  };
  revenue: { paidTotal: number; paidCount: number; unpaidCount: number };
  charts: {
    monthlyBookings: { month: string; count: number }[];
    topCategories: { category: string; count: number }[];
  };
}

/** The funnel order an admin scans the pipeline in. */
const STATUS_ORDER: BookingStatus[] = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

/** Status bars reuse the badge palette so a colour means one thing app-wide. */
const STATUS_COLOR: Record<BookingStatus, string> = {
  requested: "var(--status-requested)",
  accepted: "var(--status-accepted)",
  "in-progress": "var(--status-in-progress)",
  completed: "var(--status-completed)",
  rejected: "var(--status-rejected)",
  cancelled: "var(--status-cancelled)",
};

const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

/** Shared tooltip chrome — tokens only, so light and dark stay in step. */
const TOOLTIP_PROPS = {
  cursor: { stroke: "var(--border)" },
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
    boxShadow: "0 12px 30px -18px var(--ink)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontWeight: 500 },
  wrapperStyle: { outline: "none" },
};

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/** `"2026-03"` → `"Mar 26"`. Anything unexpected is shown as-is. */
function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

/**
 * The admin control room. One call to `GET /api/admin/stats` returns the whole
 * marketplace — counts, the booking funnel, monthly volume, top categories and
 * revenue — computed server-side by a single `$facet` aggregation. Charts render
 * with token colours and honour `prefers-reduced-motion`.
 */
export function AdminDashboard() {
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<AdminStats>(STATS_PATH, true);
      setStats(data);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      toast.error(errorText(error, "We couldn't load the marketplace stats."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiGet<AdminStats>(STATS_PATH, true)
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        toast.error(errorText(error, "We couldn't load the marketplace stats."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function retry() {
    setStats(null);
    setFailed(false);
    void load();
  }

  if (failed && stats === null) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <h3 className="fm-h3 font-semibold text-ink">We couldn&apos;t load the marketplace stats</h3>
        <p className="fm-body mx-auto mt-2 max-w-md text-muted-foreground">
          The FixMate service may be starting up. Please try again in a moment.
        </p>
        <Button className="mt-6" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (stats === null) {
    return <AdminDashboardSkeleton />;
  }

  const isEmpty =
    stats.users.total === 0 && stats.services.total === 0 && stats.bookings.total === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Nothing to measure yet"
        description="Once people sign up, technicians publish services and customers raise repair requests, this dashboard fills with the booking funnel and revenue it all produces."
        actionLabel="Open the listing queue"
        actionHref="/dashboard/admin/services"
      />
    );
  }

  const monthly = stats.charts.monthlyBookings.map((row) => ({
    label: monthLabel(row.month),
    count: row.count,
  }));

  const funnel = STATUS_ORDER.map((status) => ({
    status,
    label: BOOKING_STATUS_LABEL[status],
    count: stats.bookings.byStatus[status] ?? 0,
  }));

  const categories = stats.charts.topCategories;
  const categoryTotal = categories.reduce((sum, row) => sum + row.count, 0) || 1;

  return (
    <div className="space-y-6">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={UsersRound}
          label="Members"
          value={String(stats.users.total)}
          hint={`${stats.users.technicians} technicians · ${stats.users.admins} admins`}
        />
        <StatCard
          icon={Store}
          label="Listings"
          value={String(stats.services.total)}
          hint={`${stats.services.approved} approved · ${stats.services.pending} pending`}
          tone="bg-tint-laptop text-status-inprogress"
        />
        <StatCard
          icon={ClipboardList}
          label="Active jobs"
          value={String(stats.bookings.active)}
          hint={`${stats.bookings.total} requests all-time`}
          tone="bg-status-inprogress/12 text-status-inprogress"
        />
        <StatCard
          icon={Banknote}
          label="Gross collected"
          value={formatMoney(stats.revenue.paidTotal)}
          hint={`${stats.revenue.paidCount} paid · ${stats.revenue.unpaidCount} unpaid`}
          tone="bg-status-paid/12 text-status-paid"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking volume</CardTitle>
            <CardDescription>Repair requests raised per month, last twelve months.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {monthly.length === 0 ? (
                <ChartEmpty message="No bookings recorded yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fm-volume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      allowDecimals={false}
                      width={36}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip {...TOOLTIP_PROPS} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Bookings"
                      stroke="var(--signal)"
                      strokeWidth={2}
                      fill="url(#fm-volume)"
                      isAnimationActive={!reduce}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>What Stripe has actually captured.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-status-paid/10 p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Gross collected
              </p>
              <p className="font-heading text-3xl font-bold text-ink tabular-nums">
                {formatMoney(stats.revenue.paidTotal)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {stats.revenue.paidCount}{" "}
                {stats.revenue.paidCount === 1 ? "payment" : "payments"}
              </p>
            </div>

            <dl className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-muted-foreground">Completed jobs</dt>
                <dd className="font-medium text-ink tabular-nums">{stats.bookings.completed}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-muted-foreground">Awaiting payment</dt>
                <dd className="font-medium text-ink tabular-nums">{stats.revenue.unpaidCount}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-muted-foreground">Listings available</dt>
                <dd className="font-medium text-ink tabular-nums">{stats.services.available}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-muted-foreground">Awaiting approval</dt>
                <dd className="font-medium text-ink tabular-nums">{stats.services.pending}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking pipeline</CardTitle>
            <CardDescription>Where every repair request currently sits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={96}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Bar dataKey="count" name="Bookings" radius={[0, 6, 6, 0]} isAnimationActive={!reduce}>
                    {funnel.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Most-requested repair types.</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <ChartEmpty message="No bookings to break down yet." />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip {...TOOLTIP_PROPS} />
                      <Pie
                        data={categories}
                        dataKey="count"
                        nameKey="category"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="var(--card)"
                        strokeWidth={2}
                        isAnimationActive={!reduce}
                      >
                        {categories.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="w-full space-y-1.5">
                  {categories.map((entry, index) => (
                    <li key={entry.category} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">
                        {entry.category}
                      </span>
                      <span className="font-medium text-ink tabular-nums">{entry.count}</span>
                      <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                        {Math.round((entry.count / categoryTotal) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Placeholder inside a card whose series has nothing to draw. */
function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
      <CircleAlert className="size-5 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Layout-matched placeholders while the stats call is in flight. */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Skeleton className="h-[22rem] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[22rem] rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Skeleton className="h-[22rem] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[22rem] rounded-xl" />
      </div>
    </div>
  );
}
