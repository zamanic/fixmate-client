"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { crossFade, gridItem } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

/**
 * Dashboard summary tile. The number crossfades whenever the value changes
 * (paired with `staggerParent` on the grid, this is the only animation the
 * overview needs — no scale, no travel).
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "bg-teal/10 text-teal",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <motion.div variants={gridItem} className="h-full">
      <div className="flex h-full items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={value}
              variants={crossFade}
              initial="hidden"
              animate="show"
              exit="exit"
              className="font-heading text-2xl font-bold text-ink"
            >
              {value}
            </motion.p>
          </AnimatePresence>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}
