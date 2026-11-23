"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** How fast the bar creeps toward 90% while a navigation is in flight. */
const TRICKLE_MS = 220;
/** How long the full bar lingers before it resets. */
const COMPLETE_HOLD_MS = 260;
/** Failsafe so a navigation that never commits can't pin the bar forever. */
const SAFETY_MS = 10_000;

/**
 * A slim brand bar pinned to the top edge of the viewport. It starts the moment
 * an internal link is clicked (or the browser goes back/forward) and completes
 * when the URL actually changes, so a route transition always feels
 * acknowledged even while a data-fetching segment is still suspending.
 *
 * Behaviour matches the rest of FixMate: colours come from the same tokens the
 * header and buttons use (identical in light and dark), the animation is driven
 * by `.fm-progress` in `globals.css`, and the reduced-motion guard there
 * collapses it to an instant set/reset. Rendered on the server as an inert,
 * invisible div, so it never blocks the static shell.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Filters change the query string without changing the pathname, so the
  // completion key has to include both.
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [active, setActive] = useState(false);
  const [value, setValue] = useState(0);

  const runningRef = useRef(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    clearTimers();
    setValue(100);
    holdRef.current = setTimeout(() => {
      setActive(false);
      setValue(0);
    }, COMPLETE_HOLD_MS);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    clearTimers();
    setActive(true);
    setValue(8);
    // Ease toward 90% and hold there — the last 10% is reserved for the real
    // completion, so the bar never claims to be done before it is.
    trickleRef.current = setInterval(() => {
      setValue((current) => (current >= 90 ? current : current + Math.max(0.4, (90 - current) * 0.12)));
    }, TRICKLE_MS);
    safetyRef.current = setTimeout(finish, SAFETY_MS);
  }, [clearTimers, finish]);

  // A committed navigation changes the URL — that is our "done" signal. On the
  // very first render `runningRef` is false, so this is a no-op.
  useEffect(() => {
    finish();
  }, [routeKey, finish]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Clicking the route you are already on changes nothing, so don't start.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      start();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", start);
    };
  }, [start]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div className="fm-progress" data-active={active} aria-hidden>
      <div className="fm-progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
