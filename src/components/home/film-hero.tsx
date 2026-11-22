"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { loadScrubEngine } from "@/lib/film/scrub-engine-loader";
import { cn } from "@/lib/utils";

/**
 * Scroll-scrubbed film hero.
 *
 * The lets-scroll engine builds its own DOM inside the host element and scrubs
 * four dive clips + three connectors as the page scrolls, so the whole hero
 * takes ~5.5 viewports of scroll. It is deliberately Framer-free — the engine
 * writes inline styles on every frame, and layering a second animation system
 * on top of it would only fight it (see `.project/motion-plan.md` → F2).
 *
 * Reduced motion is handled inside the engine: it skips clip loading entirely
 * and cross-dissolves the stills instead.
 */

interface FilmScene {
  id: string;
  label: string;
  still: string;
  clip: string;
  accent: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  linger?: number;
  cta?: {
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
}

/** One entry per act of a FixMate job, in order — request → diagnose → repair → pay. */
const SCENES: FilmScene[] = [
  {
    id: "request",
    label: "Send a request",
    still: "/film/intake.png",
    clip: "/film/dive-intake.mp4",
    accent: "var(--film-act-request)",
    eyebrow: "Step 01 — Tell us what's broken",
    title: "Broken device? Start here.",
    body: "Describe the fault, pick a slot and send one request to a certified technician nearby. No phone tag, no guesswork.",
    tags: ["Any device", "60-second request", "Free diagnosis"],
    linger: 0.45,
  },
  {
    id: "diagnose",
    label: "Verified diagnosis",
    still: "/film/diagnostics.png",
    clip: "/film/dive-diagnostics.mp4",
    accent: "var(--film-act-diagnose)",
    eyebrow: "Step 02 — A technician you can trust",
    title: "Vetted hands, honest quote.",
    body: "Every FixMate technician is reviewed by our team before their first job. They confirm the fault and quote a fixed price up front.",
    tags: ["Admin-vetted", "Fixed quote", "Repair history"],
    linger: 0.45,
  },
  {
    id: "repair",
    label: "The repair",
    still: "/film/repair.png",
    clip: "/film/dive-repair.mp4",
    accent: "var(--film-act-repair)",
    eyebrow: "Step 03 — Real work, tracked live",
    title: "Follow it to the last screw.",
    body: "From accepted to in progress to done, every status change is logged — so you always know exactly what is happening to your device.",
    tags: ["Live status", "Parts explained", "No surprises"],
    linger: 0.5,
  },
  {
    id: "handover",
    label: "Pay & review",
    still: "/film/handover.png",
    clip: "/film/dive-handover.mp4",
    accent: "var(--film-act-handover)",
    eyebrow: "Step 04 — Pay only after it works",
    title: "You pay once it's fixed.",
    body: "Approve the finished repair, pay securely through Stripe, then leave a review. A FixMate job is never paid for before the work is done.",
    tags: ["Stripe secure", "Pay on completion", "Leave a review"],
    linger: 0.5,
    cta: {
      primary: { label: "Explore services", href: "/services" },
      secondary: { label: "How it works", href: "#how-it-works" },
    },
  },
];

/** Aerial hops between neighbouring dives — length must be `SCENES.length - 1`. */
const CONNECTORS = ["/film/conn-1.mp4", "/film/conn-2.mp4", "/film/conn-3.mp4"];

const FILM_CONFIG = {
  hint: "Scroll to fly through a FixMate job",
  nav: false,
  atmosphere: true,
  diveScroll: 1.05,
  connScroll: 0.6,
  crossfade: 0.1,
  sections: SCENES,
  connectors: CONNECTORS,
};

export function FilmHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;

    loadScrubEngine()
      .then(() => {
        // `disposed` guards React's dev-only double-invoke (mount → cleanup →
        // mount): only the surviving effect wins, so the engine mounts once.
        if (disposed || host.dataset.mounted === "true") return;
        const mount = (window as Window & {
          mountLetsScroll?: (el: HTMLElement, config: unknown) => void;
        }).mountLetsScroll;
        if (typeof mount !== "function") return;
        host.dataset.mounted = "true";
        mount(host, FILM_CONFIG);
        setLive(true);
      })
      .catch(() => {
        // The static hero below stays up if the engine cannot load.
      });

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <section className="relative min-h-dvh bg-film-ground">
      {!live && <StaticFilmHero />}
      {/*
        The engine appends its own fixed chrome here. `.fm-film` (globals.css)
        pins a FixMate theme onto it and makes it a z-0 stacking context so the
        rest of the landing page paints cleanly over the film when it scrolls by.
      */}
      <div ref={hostRef} className="fm-film" />
    </section>
  );
}

/** First-paint / no-JS hero so the fold is never blank before the engine boots. */
function StaticFilmHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/film/intake.png)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-film-ground via-film-ground/85 to-film-ground/35"
      />
      <div className="fm-shell relative flex min-h-dvh flex-col justify-center py-24">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-film-eyebrow uppercase">
          <Sparkles className="size-3.5" aria-hidden />
          Verified technicians · Pay after service
        </p>
        <h1 className="mt-4 max-w-2xl font-heading text-4xl leading-[1.05] font-bold text-white sm:text-5xl lg:text-6xl">
          Your device is broken. FixMate finds the hands.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
          Request a repair, watch a vetted technician take it from diagnosis to done, and pay
          only once the job is finished.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/services" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            Explore services
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            )}
          >
            <BadgeCheck className="size-4" aria-hidden />
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
