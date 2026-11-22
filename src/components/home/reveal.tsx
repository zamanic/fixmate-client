"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { fadeUpLarge, viewportOnce } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

/**
 * The one scroll-reveal wrapper used by the landing page.
 *
 * `prefers-reduced-motion` renders the visible state outright instead of
 * animating into it — rule 4 of `.project/motion-plan.md`: nothing may ever be
 * left stuck at `opacity: 0`.
 */
export function Reveal({
  children,
  className,
  variants = fadeUpLarge,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

/** Consistent section header: eyebrow, headline, sub-copy and an optional action. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <p className="fm-eyebrow">{eyebrow}</p>
        <h2 className="fm-h2 mt-3 font-bold text-ink">{title}</h2>
        {description ? (
          <p className="fm-body mt-4 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}
