/**
 * Loader for the lets-scroll scrub engine.
 *
 * The engine is a framework-agnostic vanilla script that registers
 * `window.mountLetsScroll`. It is served untouched from `/public/vendor` rather
 * than bundled, so it stays a byte-for-byte copy of the upstream file and never
 * pulls its DOM/CSS code into the React build.
 *
 * The returned promise resolves once the script has executed — calling it more
 * than once reuses the same in-flight load.
 */

type EngineWindow = Window & {
  mountLetsScroll?: (container: HTMLElement, config: unknown) => void;
};

let pending: Promise<void> | null = null;

export function loadScrubEngine(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (typeof (window as EngineWindow).mountLetsScroll === "function") return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/lets-scroll/scrub-engine.js";
    script.async = true;
    script.dataset.fmScrubEngine = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => {
      pending = null;
      reject(new Error("Could not load the film engine."));
    });
    document.head.appendChild(script);
  });

  return pending;
}
