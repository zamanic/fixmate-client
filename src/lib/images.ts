/**
 * Single source of truth for every photograph in the product.
 *
 * All imagery is generated from a prompt so the art direction stays in step:
 * clean workbenches, real tools, natural light, no stock-photo cheese. Callers
 * pass a *scene* description, never a raw URL — that keeps prompts consistent
 * and makes swapping the provider a one-file change.
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

/** Category tiles — one canonical prompt per repair category. */
export const CATEGORY_IMAGE: Record<string, string> = {
  Smartphone: img(
    "Flat lay of a disassembled smartphone with its screen, battery and logic board arranged neatly on a pale grey mat, soft studio light, clean and organised, no text",
    "landscape_4_3"
  ),
  "Laptop & PC": img(
    "Open laptop with its keyboard lifted to reveal the cooling fans and motherboard, on a clean repair bench, cool daylight, precise and technical, no text",
    "landscape_4_3"
  ),
  AC: img(
    "A split air conditioner indoor unit with its front panel open and a clean filter being inspected, bright white wall, soft daylight, tidy professional service scene, no text",
    "landscape_4_3"
  ),
  Refrigerator: img(
    "Open refrigerator with its shelves pulled out and a technician's multimeter resting on the door, bright modern kitchen, clean daylight, no text",
    "landscape_4_3"
  ),
  TV: img(
    "Large flat screen television on a low stand with the back panel removed showing cables and boards, minimal living room, soft daylight, no text",
    "landscape_4_3"
  ),
  "Washing Machine": img(
    "Front loading washing machine with its door open and a technician's gloved hand checking the drum seal, bright utility room, clean daylight, no text",
    "landscape_4_3"
  ),
  Electrical: img(
    "Neat open electrical distribution board with labelled circuit breakers and a voltage tester held against a wire, clean utility wall, soft daylight, no text",
    "landscape_4_3"
  ),
};

/** Home-page category tiles use a portrait crop so the grid reads as a gallery. */
export const CATEGORY_TILE_IMAGE: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_IMAGE).map(([key, value]) => [
    key,
    value.replace("image_size=landscape_4_3", "image_size=portrait_4_3"),
  ])
);

/** Supporting photography. */
export const ABOUT_IMAGE = img(
  "Portrait of a confident repair technician standing with folded arms in a tidy workshop, tool wall behind, dark teal workwear, natural side light, documentary portrait, no text",
  "portrait_4_3"
);

export const CTA_IMAGE = img(
  "Wide shot of a sunlit modern workshop bench with neatly hung tools, a laptop mid-repair and a kettle, warm inviting atmosphere, editorial interior photograph, no text",
  "landscape_16_9"
);
