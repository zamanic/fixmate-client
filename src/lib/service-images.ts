/**
 * Local, offline-safe images for the seeded FixMate catalogue.
 *
 * The seed script originally pointed at a text-to-image URL that returns a
 * "The image is generating…" placeholder until the remote render exists. These
 * overrides keep every listing visual stable in the client regardless of that
 * upstream service. They are applied only to the known dynamic URLs/prompt
 * URLs, so technician-uploaded images are never overwritten.
 */

const BASE = "/images/services";

export const SEEDED_SERVICE_IMAGE_OVERRIDES: Record<string, string> = {
  "Cracked Screen Replacement — Same Day": `${BASE}/cracked-screen-replacement/cracked-screen-replacement.jpg`,
  "Battery Health Service & Deep Clean": `${BASE}/battery-health-deep-clean/battery-health-deep-clean.jpg`,
  "Laptop Keyboard & Hinge Rebuild": `${BASE}/laptop-keyboard-hinge-rebuild/laptop-keyboard-hinge-rebuild.jpg`,
  "PC Not Booting? Diagnostic & Fix": `${BASE}/pc-not-booting-diagnostic/pc-not-booting-diagnostic.jpg`,
  "Split AC Service & Gas Top-Up": `${BASE}/split-ac-service-gas-top-up/split-ac-service-gas-top-up.jpg`,
  "AC Filter Deep Clean & Coil Wash": `${BASE}/ac-filter-deep-clean/ac-filter-deep-clean.jpg`,
  "Fridge Cooling Loss Repair": `${BASE}/fridge-cooling-loss-repair/fridge-cooling-loss-repair.jpg`,
  "TV Backlight & Power Board Fix": `${BASE}/tv-backlight-power-board/tv-backlight-power-board.jpg`,
  "TV Wall Mount + Cable Tidy": `${BASE}/tv-wall-mount-cable-tidy/tv-wall-mount-cable-tidy.jpg`,
  "Washing Machine Drum Bearing Replacement": `${BASE}/washing-machine-drum-bearing/washing-machine-drum-bearing.jpg`,
  "Washer Drain Pump & Hose Swap": `${BASE}/washer-drain-pump-hose-swap/washer-drain-pump-hose-swap.jpg`,
  "Full Home Wiring Safety Audit": `${BASE}/full-home-wiring-safety-audit/full-home-wiring-safety-audit.jpg`,
  "Switchboard & Socket Repair": `${BASE}/switchboard-socket-repair/switchboard-socket-repair.jpg`,
  "Tablet Screen & Digitizer Replacement": `${BASE}/tablet-screen-digitizer/tablet-screen-digitizer.jpg`,
  "Microwave Magnetron Replacement": `${BASE}/microwave-magnetron-replacement/microwave-magnetron-replacement.jpg`,
};

/** True for the old generated-image URL shape written by seed.js. */
function isSeededDynamicImage(src: string): boolean {
  return (
    !src ||
    src.includes("coresg-normal.trae.ai") ||
    src.includes("text_to_image") ||
    src.includes("image_size=")
  );
}

/** Resolve a listing to a stable local image when it still uses a seed URL. */
export function serviceImageFor(title: string, src: string): string {
  const local = SEEDED_SERVICE_IMAGE_OVERRIDES[title];
  if (!local || !isSeededDynamicImage(src)) return src;
  return local;
}
