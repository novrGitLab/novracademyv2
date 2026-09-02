"use client";

import { useNavigationLoader } from "@/components/loader/useNavigationLoader";
import { ContentLoader } from "@/components/loader/LoaderOverlay";
import type { ReactNode } from "react";

/**
 * LMS content area: shows the compact Blueprint loader inside this
 * region while an in-app navigation is in flight, instead of the
 * full-screen boot loader. Sidebar and TopNav stay visible.
 *
 * Height handling: <main> is the scroll container (overflow-y-auto), so an
 * absolutely-positioned loader child of <main> would only cover the visible
 * scrollport, not the full page. We therefore wrap the content in a
 * `relative min-h-full` box that grows with the content; the loader is
 * `absolute inset-0` inside it, so it spans the entire scrollable height —
 * including on pages taller than the viewport.
 *
 * The loader is keyed by a navigation counter (not the pathname) so it
 * remounts on every navigation, including same-path query changes.
 */
export function ContentArea({ children }: { children: ReactNode }) {
  const [isNavigating, navCount] = useNavigationLoader(600);

  return (
    <main className="relative flex-1 overflow-y-auto bg-gradient-to-b from-[#F4ECF8]/60 via-surface/40 to-white">
      <div className="relative min-h-full p-8">
        {children}
        {isNavigating && (
          <div key={navCount} className="novr-content-loader-host">
            <ContentLoader />
          </div>
        )}
      </div>
    </main>
  );
}
