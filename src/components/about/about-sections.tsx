"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  BadgeCheck,
  CircleCheck,
  Clock,
  Handshake,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { ClosingCta } from "@/components/home/landing-sections";
import { Reveal, SectionHeading } from "@/components/home/reveal";
import { buttonVariants } from "@/components/ui/button";
import { ambientDrift, gridItem, gridParent, viewportOnce } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Hero — ambient "flowing" backdrop, ink copy on the bench surface    */
/* ------------------------------------------------------------------ */

const HERO_FACTS = [
  { value: "4 countries", label: "Where technicians work" },
  { value: "7 categories", label: "From phones to wiring" },
  { value: "0 upfront", label: "Nothing due before the fix" },
] as const;

export function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <Backdrop />

      <div className="fm-shell relative py-20 sm:py-28">
        <div className="max-w-3xl">
          <Reveal>
            <p className="fm-eyebrow">About FixMate</p>
          </Reveal>

          <Reveal>
            <h1 className="fm-h1 mt-4 font-bold text-ink">
              Repair should be the calm part of your day.
            </h1>
          </Reveal>

          <Reveal>
            <p className="fm-body mt-6 max-w-2xl text-muted-foreground">
              FixMate started with an ordinary annoyance: a cracked phone screen, three quotes that
              didn&rsquo;t match, and no idea when anyone would actually turn up. So we built the
              marketplace we wanted to use — verified technicians, a price agreed before work
              starts, a status you can follow, and a card that is only charged once the repair is
              done.
            </p>
          </Reveal>

          <Reveal className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/services" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              Explore services
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/#how-it-works"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              See how it works
            </Link>
          </Reveal>

          <Reveal className="mt-12">
            <dl className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3">
              {HERO_FACTS.map((fact) => (
                <div key={fact.label} className="border-l-2 border-signal/40 pl-4">
                  <dd className="font-heading text-xl font-bold text-ink">{fact.value}</dd>
                  <dt className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                    {fact.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Three drifting token-coloured orbs — the only ambient animation in the app. */
function Backdrop() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.span
        className="absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-teal/40 blur-[120px]"
        animate={reduce ? undefined : { x: ["-50%", "-44%", "-56%", "-50%"], opacity: [0.7, 1, 0.8, 0.7] }}
        transition={reduce ? undefined : ambientDrift}
      />
      <motion.span
        className="absolute -right-32 top-8 size-[26rem] rounded-full bg-signal/25 blur-[120px]"
        animate={reduce ? undefined : { y: ["0%", "8%", "-6%", "0%"], opacity: [0.6, 0.9, 0.7, 0.6] }}
        transition={reduce ? undefined : ambientDrift}
      />
      <motion.span
        className="absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-brand-indigo/20 blur-[120px]"
        animate={reduce ? undefined : { x: ["0%", "6%", "-4%", "0%"], opacity: [0.5, 0.8, 0.6, 0.5] }}
        transition={reduce ? undefined : ambientDrift}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The five stages an order actually passes through                    */
/* ------------------------------------------------------------------ */

const PIPELINE = [
  {
    stage: "Requested",
    icon: Send,
    bar: "bg-status-requested",
    tone: "bg-status-requested/12 text-status-requested",
    body: "You describe the fault, pick a slot and send it to one technician. The request is time-stamped and appears in their queue instantly.",
  },
  {
    stage: "Accepted",
    icon: Handshake,
    bar: "bg-status-accepted",
    tone: "bg-status-accepted/12 text-status-accepted",
    body: "The technician reads your brief and commits to the job — or declines so you can look elsewhere without losing a day.",
  },
  {
    stage: "In progress",
    icon: Wrench,
    bar: "bg-status-inprogress",
    tone: "bg-status-inprogress/12 text-status-inprogress",
    body: "Work is underway. The price on record is the price you approved, and every change of state is written to the booking's history.",
  },
  {
    stage: "Completed",
    icon: CircleCheck,
    bar: "bg-status-completed",
    tone: "bg-status-completed/12 text-status-completed",
    body: "The technician closes the job with the final amount. Nothing is charged yet — you are looking at a bill, not a payment.",
  },
  {
    stage: "Paid",
    icon: Banknote,
    bar: "bg-status-paid",
    tone: "bg-status-paid/12 text-status-paid",
    body: "Only now does Stripe take the money. Card details never touch FixMate, and the receipt lands in your payment history.",
  },
] as const;

export function PipelineSection() {
  const reduce = useReducedMotion();

  return (
    <section className="fm-section border-b border-border/70">
      <div className="fm-shell">
        <SectionHeading
          eyebrow="How trust is built in"
          title="Every job moves through five honest stages."
          description="There is no hidden handshake and no off-platform cash. A booking can only travel forward through these five states, and the pipeline refuses any jump that skips one."
        />

        <motion.div
          variants={reduce ? undefined : gridParent}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={viewportOnce}
          className="mt-12 hidden gap-2 lg:grid"
          style={{ gridTemplateColumns: `repeat(${PIPELINE.length}, minmax(0, 1fr))` }}
        >
          {PIPELINE.map((stage) => (
            <motion.span
              key={stage.stage}
              variants={reduce ? undefined : gridItem}
              className={cn("h-1.5 origin-left rounded-full", stage.bar)}
            />
          ))}
        </motion.div>

        <motion.ol
          variants={reduce ? undefined : gridParent}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={viewportOnce}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5"
        >
          {PIPELINE.map((stage, index) => (
            <motion.li
              key={stage.stage}
              variants={reduce ? undefined : gridItem}
              className="fm-card-hover flex h-full flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10"
            >
              <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "mt-4 flex size-11 items-center justify-center rounded-lg",
                  stage.tone
                )}
              >
                <stage.icon className="size-5" aria-hidden />
              </span>
              <h3 className="fm-h3 mt-4 font-semibold text-ink">{stage.stage}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What we hold ourselves to                                           */
/* ------------------------------------------------------------------ */

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Listings are reviewed, not auto-published",
    body: "A technician's first service sits in a moderation queue until a human approves it. Editing it sends it back for another look.",
  },
  {
    icon: BadgeCheck,
    title: "The quote is the contract",
    body: "Faults described honestly, prices agreed before the van moves. If the job genuinely grows, the technician records a final amount — you still see it before you pay.",
  },
  {
    icon: Clock,
    title: "State is never a mystery",
    body: "Every booking keeps its full status history, so both sides can reconstruct exactly what happened and when.",
  },
] as const;

export function PrinciplesSection() {
  const reduce = useReducedMotion();

  return (
    <section className="fm-section">
      <div className="fm-shell grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <Reveal>
            <p className="fm-eyebrow">Our promise</p>
            <h2 className="fm-h2 mt-3 font-bold text-ink">A marketplace both sides can audit.</h2>
            <p className="fm-body mt-4 text-muted-foreground">
              FixMate is small on purpose. We would rather do the unglamorous parts properly —
              verification, agreed pricing, an honest status trail, money that moves last — than
              grow a directory nobody trusts.
            </p>
          </Reveal>

          <Reveal className="mt-8 rounded-2xl bg-teal p-7 text-white">
            <Quote className="size-6 text-signal" aria-hidden />
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              &ldquo;Found someone the same morning, watched the status tick over to accepted, and
              the card was only charged after I&rsquo;d held the working laptop in my hands.&rdquo;
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="size-3.5" aria-hidden />
              Ruben T. · verified customer
            </p>
          </Reveal>
        </div>

        <motion.ul
          variants={reduce ? undefined : gridParent}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={viewportOnce}
          className="grid gap-5"
        >
          {PRINCIPLES.map((principle) => (
            <motion.li
              key={principle.title}
              variants={reduce ? undefined : gridItem}
              className="h-full rounded-xl bg-card p-6 ring-1 ring-foreground/10"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-tint-smartphone text-teal">
                <principle.icon className="size-5" aria-hidden />
              </span>
              <h3 className="fm-h3 mt-4 font-semibold text-ink">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Everything below the page heading, in one client boundary. */
export function AboutSections() {
  return (
    <>
      <AboutHero />
      <PipelineSection />
      <PrinciplesSection />
      <ClosingCta />
    </>
  );
}
