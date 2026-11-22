"use client";

import { motion } from "framer-motion";

import { gridParent, viewportOnce } from "@/lib/motion/variants";
import type { Service } from "@/lib/types";

import { ServiceCard } from "./service-card";

/** Staggered results grid — the only place cards are laid out. */
export function ServicesGrid({ items }: { items: Service[] }) {
  return (
    <motion.div
      variants={gridParent}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </motion.div>
  );
}
