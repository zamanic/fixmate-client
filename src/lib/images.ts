/**
 * Single source of truth for every photograph in the product.
 *
 * Most imagery is generated from a prompt so the art direction stays in step:
 * clean workbenches, real tools, natural light, no stock-photo cheese. Callers
 * pass a *scene* description, never a raw URL — that keeps prompts consistent
 * and makes swapping the provider a one-file change. The landing-page category
 * tiles and the closing CTA backdrop are the exception: they are committed
 * files under `public/images/`, because the prompt endpoint serves a generic
 * placeholder instead of a render.
 */

export type ImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

const ENDPOINT = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image";

/** Build a deterministic image URL from a scene prompt. */
export function img(prompt: string, size: ImageSize = "landscape_4_3"): string {
  return `${ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

/* ------------------------------------------------------------------ */
/* Scene prompts                                                       */
/* ------------------------------------------------------------------ */

/** Four acts of the repair story, used by the scroll-film hero. */
export const FILM_SCENES = [
  {
    src: img(
      "Macro photograph of a cracked smartphone screen lying on a clean pale workbench, precision screwdrivers and a spudger arranged beside it, soft daylight from the left, shallow depth of field, muted teal and bone colour palette, calm documentary product photography, no text",
      "landscape_16_9"
    ),
    alt: "A cracked phone on a technician's workbench beside precision tools",
  },
  {
    src: img(
      "Close up of a technician's hands in nitrile gloves repairing a laptop motherboard with a fine soldering iron, warm amber work light inside a tidy workshop, cooling fan and components visible, shallow depth of field, professional repair documentary photograph, no text",
      "landscape_16_9"
    ),
    alt: "A technician soldering a laptop motherboard under a warm work light",
  },
  {
    src: img(
      "A friendly repair technician in a dark teal uniform holding a compact tool case at a bright apartment doorway, customer's hand on the door, daytime natural light, real lived-in home interior, documentary lifestyle photograph, no text",
      "landscape_16_9"
    ),
    alt: "A FixMate technician arriving at a customer's front door with a tool case",
  },
  {
    src: img(
      "A hand holding a fully repaired smartphone with a flawless bright screen in a sunlit living room, small toolkit resting on the table behind it, satisfied and calm mood, warm orange accent highlight, editorial lifestyle photograph, no text",
      "landscape_16_9"
    ),
    alt: "A repaired phone with a flawless screen held up in a sunlit room",
  },
] as const;

/**
 * Home-page category tiles.
 *
 * These are committed local assets rather than prompt URLs: the remote
 * text-to-image endpoint the rest of this file points at only ever served a
 * generic "image is generating" placeholder, which left all seven tiles broken
 * on the landing page. Keep the filenames in step with `public/images/categories/`.
 */
export const CATEGORY_TILE_IMAGE: Record<string, string> = {
  Smartphone: "/images/categories/smartphone.jpg",
  "Laptop & PC": "/images/categories/laptop-pc.jpg",
  AC: "/images/categories/ac.jpg",
  Refrigerator: "/images/categories/refrigerator.jpg",
  TV: "/images/categories/tv.jpg",
  "Washing Machine": "/images/categories/washing-machine.jpg",
  Electrical: "/images/categories/electrical.jpg",
};

/** Supporting photography. */
export const ABOUT_IMAGE = img(
  "Portrait of a confident repair technician standing with folded arms in a tidy workshop, tool wall behind, dark teal workwear, natural side light, documentary portrait, no text",
  "portrait_4_3"
);

export const CTA_IMAGE = img(
  "Wide shot of a sunlit modern workshop bench with neatly hung tools, a laptop mid-repair and a kettle, warm inviting atmosphere, editorial interior photograph, no text",
  "landscape_16_9"
);
