"use client";

import { usePathname } from "next/navigation";
import { useNavigationLoader } from "@/components/loader/useNavigationLoader";
import { ContentLoader } from "@/components/loader/LoaderOverlay";
import type { ReactNode } from "react";

/**
 * LMS content area: shows the compact Blueprint loader inside this
 * region while an in-app navigation is in flight, instead of the
 * full-screen boot loader. Sidebar and TopNav stay visible.
 */
export function ContentArea({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isNavigating = useNavigationLoader(600);

  return (
    <main className="relative flex-1 overflow-y-auto bg-gradient-to-b from-[#F4ECF8]/60 via-surface/40 to-white p-8">
      {children}
      {isNavigating && (
        <div key={pathname} className="novr-content-loader-host">
          <ContentLoader />
        </div>
      )}
    </main>
  );
}
