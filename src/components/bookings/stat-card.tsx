"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { crossFade, gridItem } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

/**
 * Dashboard summary tile. The number crossfades whenever the value changes
 * (paired with `staggerParent` on the grid, this is the only animation the
 * overview needs — no scale, no travel).
 *
 * Pass `href` to make the whole tile a link into the view that owns the number
 * (e.g. Total services → My services), so a count and its destination stay
 * connected.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "bg-teal/10 text-teal",
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
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
    </>
  );

  const shell = "flex h-full items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10";

  return (
    <motion.div variants={gridItem} className="h-full">
      {href ? (
        <Link href={href} className={cn(shell, "transition-colors hover:ring-teal/30")}>
          {body}
        </Link>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </motion.div>
  );
}
