"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Tracks App Router navigation and reports whether one is in flight.
 *
 * Returns `[isNavigating, navCount]`. A navigation starts when the user
 * clicks an in-app `<a>`; it ends when BOTH:
 *   - the pathname actually changes (the new route has rendered), AND
 *   - at least `minMs` has elapsed since the click.
 *
 * The minimum keeps the loader from flickering on sub-`minMs` route swaps
 * (the Blueprint ring needs a moment to read as an animation), while the
 * pathname check keeps it visible during genuinely slow navigations.
 *
 * The full-screen NovrLoader (initial boot) and this hook are independent:
 * navigation never re-triggers the boot overlay.
 */
export function useNavigationLoader(minMs = 700): [boolean, number] {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const startRef = useRef(0);
  const pendingRef = useRef(false);

  // A click on an in-app link starts the "navigating" window. Same-route
  // links (identical pathname) are skipped — there is nothing to wait for.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      // Skip pure-hash / same-page links.
      const hrefPath = href.split(/[?#]/)[0] || "/";
      if (hrefPath === pathname) return;
      startRef.current = Date.now();
      pendingRef.current = true;
      setNavCount((c) => c + 1);
      setIsNavigating(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // End condition: pathname changed AND minimum time elapsed.
  useEffect(() => {
    if (!pendingRef.current) return;
    const elapsed = Date.now() - startRef.current;
    if (elapsed < minMs) {
      // Pathname changed before the minimum elapsed — keep the loader up
      // for the remainder so it doesn't blink out instantly.
      const id = setTimeout(() => {
        pendingRef.current = false;
        setIsNavigating(false);
      }, minMs - elapsed);
      return () => clearTimeout(id);
    }
    // Both conditions met.
    pendingRef.current = false;
    setIsNavigating(false);
  }, [pathname, minMs]);

  // Hard safety net: never let the loader hang past minMs + 4s even if the
  // pathname never changes (e.g. a click on a same-route anchor that wasn't
  // filtered, or an interrupted navigation).
  useEffect(() => {
    if (!isNavigating) return;
    const id = setTimeout(() => {
      pendingRef.current = false;
      setIsNavigating(false);
    }, minMs + 4000);
    return () => clearTimeout(id);
  }, [isNavigating, minMs]);

  return [isNavigating, navCount];
}
