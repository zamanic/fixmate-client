"use client";

import { motion, useReducedMotion } from "framer-motion";

import { gridParent, viewportOnce } from "@/lib/motion/variants";
import type { Service } from "@/lib/types";

import { ServiceCard } from "./service-card";
import type { ServiceQuery } from "./service-query";

/**
 * Staggered results grid — the only place cards are laid out.
 *
 * `query` is the Explore page's active filter set: passing it through lets each
 * card link into its details page while remembering the category/search/page
 * the visitor came from. The landing page's featured grid passes nothing.
 */
export function ServicesGrid({ items, query }: { items: Service[]; query?: ServiceQuery }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={reduce ? undefined : gridParent}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={viewportOnce}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((service) => (
        <ServiceCard key={service._id} service={service} query={query} />
      ))}
    </motion.div>
  );
}
