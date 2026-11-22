import type { Transition, Variants } from "framer-motion";

/**
 * FixMate motion vocabulary
 * Source of truth: `.taste-skill/direction.fixmate.json` → `motion.recipes`
 *
 *   • fade-up on scroll  — once, 0.6s, ease 0.22 / 1 / 0.36 / 1
 *   • stagger card grids — max 8 items, 0.06s apart
 *   • hover lift         — max 4px
 *   • layout animation   — filter tabs (`layoutId`)
 *   • AnimatePresence    — modals, toasts, status crossfades
 *   • reduced motion     — render the final state, skip transforms
 *
 * Every animated element in the app must import from here. No ad-hoc
 * durations, easings or distances anywhere else.
 */

/** The single easing curve for the whole product. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Named durations (seconds) — keep the set small and reused. */
export const DURATION = {
  instant: 0.12,
  fast: 0.22,
  base: 0.4,
  slow: 0.6,
} as const;

export const STAGGER = {
  grid: 0.06,
  list: 0.05,
  max: 8,
} as const;

/** Hover lift distance is capped at 4px by the art direction. */
export const HOVER_LIFT = -4;

const base: Transition = { duration: DURATION.slow, ease: EASE_OUT };

/* ------------------------------------------------------------------ */
/* Scroll reveals                                                      */
/* ------------------------------------------------------------------ */

/** Default entrance: children fade and rise 18px into place. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: base },
};

/** Longer rise for hero-level copy. */
export const fadeUpLarge: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: base },
};

/** Cards settle at a slightly smaller scale so grids feel physical. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: base },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: base },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: base },
};

/* ------------------------------------------------------------------ */
/* Stagger                                                             */
/* ------------------------------------------------------------------ */

/**
 * Parent for staggered grids/lists. Pass the child count so a 40-card
 * result set does not trail on for seconds: past 8 children the step is
 * compressed to keep the whole reveal inside ~0.5s.
 */
export function staggerParent(count = STAGGER.max, step = STAGGER.grid): Variants {
  const perItem = count > STAGGER.max ? 0.48 / Math.max(count, 1) : step;
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: perItem,
        delayChildren: step,
        when: "beforeChildren",
      },
    },
  };
}

/** Fixed-height grid: 8 cards max before the stagger stops growing. */
export const gridParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.grid, delayChildren: STAGGER.grid } },
};

export const listParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.list } },
};

export const gridItem = fadeUp;

/* ------------------------------------------------------------------ */
/* State changes                                                       */
/* ------------------------------------------------------------------ */

/** Status badge / value crossfade — quick, no travel. */
export const crossFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DURATION.instant, ease: "easeIn" } },
};

/** Shared config for `<AnimatePresence>` overlays (modals, sheets, toasts). */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: DURATION.instant, ease: "easeIn" } },
};

/** Error shake for invalid form fields (see ui-decisions.md). */
export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

/** Success check draw-in for payment / job completion. */
export const successPop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.05 },
  },
};

/* ------------------------------------------------------------------ */
/* Interaction helpers                                                 */
/* ------------------------------------------------------------------ */

/** Standard hover lift for cards and tiles (≤ 4px). */
export const hoverLift = {
  whileHover: { y: HOVER_LIFT },
  whileTap: { scale: 0.995 },
  transition: { duration: DURATION.fast, ease: EASE_OUT },
} as const;

/** Press feedback for primary buttons. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { duration: DURATION.instant, ease: EASE_OUT },
} as const;

/* ------------------------------------------------------------------ */
/* Ambient decoration                                                  */
/* ------------------------------------------------------------------ */

/**
 * Slow mirroring loop for decorative backdrops only — never on content.
 * Transform/opacity only, so it stays on the compositor, and every caller
 * skips it under `prefers-reduced-motion`.
 */
export const ambientDrift = {
  duration: 26,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
} as const;

/* ------------------------------------------------------------------ */
/* Viewport defaults                                                   */
/* ------------------------------------------------------------------ */

/** Every `whileInView` reveal uses this — play once, slightly early. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

/** Slide-modal transition used by Dialog/Sheet content. */
export const sheetTransition: Transition = { duration: DURATION.base, ease: EASE_OUT };
