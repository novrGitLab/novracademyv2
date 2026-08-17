"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { applyBranding, type TenantBranding } from "@/lib/branding";

/**
 * Applies the signed-in user's organization branding as CSS custom
 * properties (--tenant-*) on every authenticated page. Falls back to the
 * defaults declared in globals.css when the org has no branding yet.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const org = session?.user?.organization;

  useEffect(() => {
    if (!org?.primaryColor) return;
    const branding: TenantBranding = {
      logoUrl: "",
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor ?? org.primaryColor,
      accentColor: org.accentColor ?? org.primaryColor,
      backgroundColor: org.backgroundColor ?? `${org.primaryColor}08`,
      textColor: org.textColor ?? "#1A1A2E",
    };
    applyBranding(branding);
  }, [org?.primaryColor, org?.secondaryColor, org?.accentColor, org?.backgroundColor, org?.textColor]);

  return <>{children}</>;
}
