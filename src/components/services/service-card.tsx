"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { gridItem } from "@/lib/motion/variants";
import { CATEGORY_TINT, formatMoney, type Service } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ServiceImage } from "./service-image";
import { readRating } from "./service-query";

/**
 * The single service tile used across Explore Services (and reusable on the
 * landing page). Equal height by default so grid rows stay level.
 */
export function ServiceCard({ service }: { service: Service }) {
  const href = `/services/${service._id}`;
  const { average, count } = readRating(service);
  const tint = CATEGORY_TINT[service.category];

  return (
    <motion.div variants={gridItem} className="h-full">
      <div className="fm-card-hover flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className={cn("relative aspect-[16/10] w-full overflow-hidden", tint)}>
          <ServiceImage src={service.image} alt={service.title} />
          <Badge className={cn("absolute top-3 left-3 rounded-full border-0 text-ink", tint)}>
            {service.category}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h3 className="fm-h3 font-semibold text-ink">
              <Link href={href} className="transition-colors hover:text-signal">
                {service.title}
              </Link>
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="min-w-0 truncate">{service.technicianName}</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {service.serviceArea}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {service.estimatedDuration}
            </span>
            {count > 0 ? (
              <span className="flex items-center gap-1.5">
                <Star className="size-3.5 fill-signal text-signal" aria-hidden />
                <span className="font-medium text-ink">{average.toFixed(1)}</span>
                <span>({count})</span>
              </span>
            ) : (
              <Badge variant="secondary" className="rounded-full">
                New
              </Badge>
            )}
          </div>

          <Badge variant="outline" className="w-fit rounded-full">
            {service.serviceMode}
          </Badge>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="font-heading text-lg font-semibold text-ink">
                {formatMoney(service.basePrice)}
              </p>
            </div>
            <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              View details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
