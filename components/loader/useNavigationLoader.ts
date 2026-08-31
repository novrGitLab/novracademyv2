"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Tracks App Router navigation and reports whether it is in flight.
 * Plays well with loading.tsx: while a route segment is suspended,
 * `isNavigating` is true — render <ContentLoader /> in its place.
 *
 * The full-screen NovrLoader (initial boot) and this hook are
 * independent: navigation never re-triggers the boot overlay.
 */
export function useNavigationLoader(minMs = 600): boolean {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    // pathname changed (or first mount) — navigation finished.
    const elapsed = Date.now() - shownAtRef.current;
    const remaining = shownAtRef.current > 0 ? Math.max(0, minMs - elapsed) : 0;
    const id = window.setTimeout(() => {
      setIsNavigating(false);
      shownAtRef.current = 0;
    }, remaining);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      shownAtRef.current = Date.now();
      setIsNavigating(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [minMs]);

  return isNavigating;
}
