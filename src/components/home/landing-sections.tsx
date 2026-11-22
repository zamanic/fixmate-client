"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  Search,
  Send,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from "lucide-react";

import { ServiceImage } from "@/components/services/service-image";
import { buttonVariants } from "@/components/ui/button";
import { gridParent, gridItem, viewportOnce } from "@/lib/motion/variants";
import { CATEGORY_TILE_IMAGE, CTA_IMAGE } from "@/lib/images";
import { CATEGORY_TINT, SERVICE_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Reveal, SectionHeading } from "./reveal";

/* ------------------------------------------------------------------ */
/* How FixMate works — the 4-step flow                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Search,
    title: "Find a service",
    body: "Browse approved listings by device, area and price. Every technician is reviewed by our team before their first job.",
  },
  {
    icon: Send,
    title: "Send a request",
    body: "Describe the fault and pick a time. The technician accepts or declines — you follow every answer in your dashboard.",
  },
  {
    icon: Wrench,
    title: "Technician fixes it",
    body: "The price is agreed before work starts, then the job moves from accepted to in progress to completed.",
  },
  {
    icon: BadgeCheck,
    title: "Pay after completion",
    body: "Money only changes hands once the repair is done and you approve it — securely, through Stripe.",
  },
] as const;

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how-it-works" className="fm-section border-t border-border/70">
      <div className="fm-shell">
        <SectionHeading
          eyebrow="How FixMate works"
          title="Four steps from broken to fixed."
          description="No mystery pricing and no chasing calls — a single, trackable path from the moment you describe the fault to the moment you pay for the repair."
        />

        <motion.ol
          variants={reduce ? undefined : gridParent}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={viewportOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              variants={reduce ? undefined : gridItem}
              className="fm-card-hover relative h-full rounded-xl bg-card p-6 ring-1 ring-foreground/10"
            >
              <span className="font-mono text-xs font-semibold tracking-widest text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-4 flex size-11 items-center justify-center rounded-lg bg-tint-smartphone text-teal">
                <step.icon className="size-5" aria-hidden />
              </span>
              <h3 className="fm-h3 mt-4 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Popular categories                                                  */
/* ------------------------------------------------------------------ */

export function PopularCategories() {
  const reduce = useReducedMotion();

  return (
    <section className="fm-section bg-secondary/40">
      <div className="fm-shell">
        <SectionHeading
          eyebrow="Popular categories"
          title="What needs fixing today?"
          description="Pick the device in front of you — we'll open Explore Services with that category already filtered."
          action={
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              Browse everything
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />

        <motion.div
          variants={reduce ? undefined : gridParent}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {SERVICE_CATEGORIES.map((category) => (
            <motion.div key={category} variants={reduce ? undefined : gridItem} className="h-full">
              <Link
                href={`/services?category=${encodeURIComponent(category)}`}
                className="fm-card-hover group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
              >
                <div className={cn("relative aspect-[4/3] w-full overflow-hidden", CATEGORY_TINT[category])}>
                  <ServiceImage src={CATEGORY_TILE_IMAGE[category]} alt={`${category} repair`} />
                </div>
                <div className="flex flex-1 items-center justify-between gap-2 p-4">
                  <span className="fm-h3 font-semibold text-ink">{category}</span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-signal"
                    aria-hidden
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why choose us — trust points + platform stats                       */
/* ------------------------------------------------------------------ */

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Admin-verified technicians",
    body: "Every listing is approved before it goes live, and every technician is reviewed before their first job.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent, fixed pricing",
    body: "Quotes are agreed before work starts. What you approve up front is what you pay at the end.",
  },
  {
    icon: Clock,
    title: "Live job tracking",
    body: "Each booking carries its full status history, so you always know exactly where your repair stands.",
  },
  {
    icon: CreditCard,
    title: "Pay only after the fix",
    body: "Card payment runs through Stripe and is only collected once the job is completed and approved.",
  },
] as const;

const STATS = [
  { value: "2,400+", label: "Jobs completed" },
  { value: "150+", label: "Verified technicians" },
  { value: "4.9/5", label: "Average rating" },
  { value: "60s", label: "To send a request" },
] as const;

export function WhyChooseUs() {
  const reduce = useReducedMotion();

  return (
    <section className="fm-section">
      <div className="fm-shell">
        <SectionHeading
          eyebrow="Why choose FixMate"
          title="Trust is the whole product."
          description="A repair marketplace only works if both sides can rely on it. These are the guarantees we build every feature around."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <motion.ul
            variants={reduce ? undefined : gridParent}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={viewportOnce}
            className="grid gap-5 sm:grid-cols-2"
          >
            {TRUST_POINTS.map((point) => (
              <motion.li
                key={point.title}
                variants={reduce ? undefined : gridItem}
                className="h-full rounded-xl bg-card p-6 ring-1 ring-foreground/10"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-tint-smartphone text-teal">
                  <point.icon className="size-5" aria-hidden />
                </span>
                <h3 className="fm-h3 mt-4 font-semibold text-ink">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </motion.li>
            ))}
          </motion.ul>

          <Reveal className="rounded-2xl bg-teal p-7 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
              <Users className="size-4" aria-hidden />
              FixMate today
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-heading text-3xl font-bold text-white">{stat.value}</dd>
                  <p className="mt-1 text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </dl>
            <div className="mt-8 border-t border-white/15 pt-6">
              <div className="flex items-center gap-1.5 text-signal">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" aria-hidden />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                &ldquo;Booked at 9am, phone screen replaced by lunch and I only paid when it
                worked. That&rsquo;s the whole pitch.&rdquo;
              </p>
              <p className="mt-2 text-xs text-white/60">Amara N. · verified customer</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */

export function ClosingCta() {
  return (
    <section className="pb-20">
      <div className="fm-shell">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-7 py-14 text-white sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${CTA_IMAGE})` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40"
          />
          <div className="relative max-w-xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-signal uppercase">
              Ready when you are
            </p>
            <h2 className="fm-h2 mt-3 font-bold text-white">
              Your repair, handled end to end.
            </h2>
            <p className="fm-body mt-4 text-white/75">
              Request a technician in under a minute, follow the job live, and pay only after the
              fix is done.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              >
                Explore services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                )}
              >
                Create a free account
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/60">
              Fixing devices for a living?{" "}
              <Link href="/sign-up?role=technician" className="font-medium text-signal hover:underline">
                Join as a technician
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
