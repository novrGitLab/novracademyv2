"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BrandingSetupModal } from "@/components/BrandingSetupModal";
import { generatePalette, applyBranding } from "@/lib/branding";
import { apiMutate } from "@/lib/useApi";

/**
 * Shows the one-time branding setup to a tenant admin whose organization
 * hasn't configured branding yet. Saves logo + extracted colors to the
 * backend, applies them immediately, then refreshes the session.
 */
export function TenantOnboarding() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const org = session?.user?.organization;
  const role = session?.user?.role;
  const isTenantAdmin = role === "ORG_ADMIN" || role === "INSTITUTION_ADMIN";
  const needsSetup = isTenantAdmin && !!org && !org.primaryColor;

  async function handleComplete(branding: { logoUrl: string; primaryColor: string }) {
    if (!org || saving) return;
    setSaving(true);
    const palette = generatePalette(branding.primaryColor);
    const payload = {
      logoUrl: branding.logoUrl || null,
      primaryColor: branding.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      backgroundColor: palette.backgroundColor,
      textColor: palette.textColor,
    };
    try {
      await apiMutate(`/organizations/${org.id}/branding`, "PATCH", payload);
      applyBranding({ ...payload, logoUrl: payload.logoUrl ?? "" });
      await update();
    } catch (err) {
      console.error("Failed to save branding", err);
    } finally {
      setSaving(false);
    }
  }

  return <BrandingSetupModal open={needsSetup} onComplete={handleComplete} />;
}
