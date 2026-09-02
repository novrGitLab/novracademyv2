"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks App Router navigation and reports whether one is in flight.
 *
 * Returns `[isNavigating, navCount]` where `navCount` increments on every
 * detected in-app link click. When it changes, the loader shows for at least
 * `minMs` (or until the pathname actually changes — see below). Callers can
 * use `navCount` as a React key to remount per navigation without depending
 * on `usePathname`.
 *
 * The full-screen NovrLoader (initial boot) and this hook are independent:
 * navigation never re-triggers the boot overlay.
 */
export function useNavigationLoader(minMs = 600): [boolean, number] {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const startRef = useRef(0);

  // A click on an in-app link starts the "navigating" window.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      // Skip modifier-key / non-left clicks — the browser handles those.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      startRef.current = Date.now();
      setNavCount((c) => c + 1);
      setIsNavigating(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Once started, hide the loader after `minMs`. A longer navigation (slow
  // route) will keep it visible only until this minimum elapses — the loader
  // is decorative, not a completion signal.
  useEffect(() => {
    if (!isNavigating) return;
    const id = window.setTimeout(() => setIsNavigating(false), minMs);
    return () => window.clearTimeout(id);
  }, [isNavigating, navCount, minMs]);

  return [isNavigating, navCount];
}
