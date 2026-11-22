"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gridItem } from "@/lib/motion/variants";
import { BOOKING_STATUS_LABEL, formatMoney, type BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The two small charts the customer and technician overviews share.
 *
 * Colours come from the status/chart tokens only, so both themes stay in step,
 * and every animation is switched off under `prefers-reduced-motion`.
 */

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
];

/** Shared tooltip chrome — tokens only, matching the admin control room. */
const TOOLTIP_PROPS = {
  cursor: { fill: "var(--muted)" },
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontWeight: 500 },
  wrapperStyle: { outline: "none" },
};

export interface StatusSlice {
  status: BookingStatus;
  count: number;
}

export interface CategorySlice {
  label: string;
  value: number;
}

/** Status mix of a booking list — only statuses that actually occur. */
export function statusSlices(bookings: { status: BookingStatus }[]): StatusSlice[] {
  const counts = new Map<BookingStatus, number>();
  for (const booking of bookings) {
    counts.set(booking.status, (counts.get(booking.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

/** Totals by service category, biggest first, capped at five slices. */
export function categorySlices(
  rows: { category: string; amount: number }[],
  limit = 5
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount);
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function BookingStatusDonut({
  slices,
  title,
  description,
}: {
  slices: StatusSlice[];
  title: string;
  description: string;
}) {
  const reduce = useReducedMotion();
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <motion.div variants={gridItem} className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {slices.length === 0 ? (
            <ChartEmpty message="Nothing to chart yet." />
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative h-[196px] w-full max-w-[196px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={54}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                      isAnimationActive={!reduce}
                    >
                      {slices.map((slice) => (
                        <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...TOOLTIP_PROPS}
                      formatter={(value, name) => [
                        `${Number(value)} ${Number(value) === 1 ? "job" : "jobs"}`,
                        BOOKING_STATUS_LABEL[String(name) as BookingStatus] ?? String(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-heading text-2xl font-bold text-ink tabular-nums">
                      {total}
                    </p>
                    <p className="text-xs text-muted-foreground">jobs</p>
                  </div>
                </div>
              </div>

              <ul className="w-full space-y-2">
                {slices.map((slice) => (
                  <li key={slice.status} className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: STATUS_COLOR[slice.status] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {BOOKING_STATUS_LABEL[slice.status]}
                    </span>
                    <span className="font-medium text-ink tabular-nums">{slice.count}</span>
                    <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                      {Math.round((slice.count / total) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CategoryBars({
  slices,
  title,
  description,
  currency = false,
}: {
  slices: CategorySlice[];
  title: string;
  description: string;
  currency?: boolean;
}) {
  const reduce = useReducedMotion();
  const data = useMemo(
    () => slices.map((slice) => ({ ...slice, value: Math.round(slice.value * 100) / 100 })),
    [slices]
  );

  return (
    <motion.div variants={gridItem} className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <ChartEmpty message="Nothing to chart yet." />
          ) : (
            <div className="h-[196px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={104}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    {...TOOLTIP_PROPS}
                    formatter={(value) => [
                      currency
                        ? formatMoney(Number(value))
                        : `${Number(value)} ${Number(value) === 1 ? "job" : "jobs"}`,
                      currency ? "Amount" : "Jobs",
                    ]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={!reduce}>
                    {data.map((slice, index) => (
                      <Cell key={slice.label} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** In-card placeholder so a chart card never renders an empty frame. */
function ChartEmpty({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "flex h-[196px] flex-col items-center justify-center gap-3 rounded-xl",
        "border border-dashed border-border text-center"
      )}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal">
        <PieChartIcon className="size-5" aria-hidden />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
