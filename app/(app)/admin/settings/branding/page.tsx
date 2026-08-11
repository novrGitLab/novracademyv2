"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { extractColorsFromLogo, generatePalette, type TenantBranding } from "@/lib/branding";
import { Upload, Palette, Save, RotateCcw, CheckCircle2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Default branding                                                            */
/* -------------------------------------------------------------------------- */

const defaultBranding: TenantBranding = {
  logoUrl: "",
  primaryColor: "#683290",
  secondaryColor: "#8B5CF6",
  accentColor: "#4451A2",
  backgroundColor: "#68329008",
  textColor: "#1A1A2E",
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BrandingPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [branding, setBranding] = useState<TenantBranding>(defaultBranding);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract colors
    setExtracting(true);
    try {
      // Create a temporary URL for the file
      const tempUrl = URL.createObjectURL(file);
      const colors = await extractColorsFromLogo(tempUrl);
      URL.revokeObjectURL(tempUrl);

      const palette = generatePalette(colors.primary);
      palette.logoUrl = tempUrl;

      setBranding((prev) => ({
        ...prev,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        accentColor: colors.accent,
      }));

      setToast({ message: "Colors extracted from logo", type: "success" });
    } catch {
      setToast({ message: "Could not extract colors, using defaults", type: "error" });
    } finally {
      setExtracting(false);
    }
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      // TODO: Save branding to backend API
      // await apiMutate("/settings/branding", "PATCH", branding);

      // Apply branding to the current page
      const palette = generatePalette(branding.primaryColor);
      document.documentElement.style.setProperty("--tenant-primary", branding.primaryColor);
      document.documentElement.style.setProperty("--tenant-secondary", branding.secondaryColor);
      document.documentElement.style.setProperty("--tenant-accent", branding.accentColor);

      setToast({ message: "Branding saved successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to save branding", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setBranding(defaultBranding);
    setLogoPreview(null);
    document.documentElement.style.removeProperty("--tenant-primary");
    document.documentElement.style.removeProperty("--tenant-secondary");
    document.documentElement.style.removeProperty("--tenant-accent");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
          Tenant Branding
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Customize your organization&apos;s appearance. Upload a logo and we&apos;ll
          extract your brand colors automatically.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Logo</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Upload your organization logo. We&apos;ll extract brand colors automatically.
        </p>

        <div className="mt-4 flex items-start gap-6">
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] transition hover:border-[#683290]/40"
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-20 w-20 object-contain"
              />
            ) : (
              <>
                <Upload className="h-6 w-6 text-[#9CA3AF]" />
                <span className="mt-1 text-[11px] text-[#9CA3AF]">Upload</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Status */}
          <div className="flex-1">
            {extracting ? (
              <div className="flex items-center gap-2 text-[13px] text-[#683290]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F1F3F5] border-t-[#683290]" />
                Extracting colors...
              </div>
            ) : logoPreview ? (
              <div className="flex items-center gap-2 text-[13px] text-[#16A34A]">
                <CheckCircle2 className="h-4 w-4" />
                Logo uploaded. Colors extracted.
              </div>
            ) : (
              <p className="text-[13px] text-[#9CA3AF]">
                No logo uploaded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Color Palette</h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#1A1A2E]"
          >
            <RotateCcw className="h-3 w-3" /> Reset to defaults
          </button>
        </div>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          These colors are extracted from your logo and applied across your portal.
        </p>

        <div className="mt-4 space-y-3">
          {[
            { label: "Primary", key: "primaryColor" as const, desc: "CTAs, headers, accents" },
            { label: "Secondary", key: "secondaryColor" as const, desc: "Hover states, secondary elements" },
            { label: "Accent", key: "accentColor" as const, desc: "Borders, subtle highlights" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding[item.key]}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  className="h-10 w-10 cursor-pointer rounded-[6px] border border-[#E5E7EB]"
                />
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">{item.label}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{item.desc}</p>
                </div>
              </div>
              <span className="ml-auto font-mono text-[12px] text-[#6B7280]">
                {branding[item.key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Preview</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          See how your branding will look across the platform.
        </p>

        <div className="mt-4 overflow-hidden rounded-[8px] border border-[#E5E7EB]">
          {/* Mini nav preview */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3">
            {logoPreview && (
              <img src={logoPreview} alt="" className="h-6 w-6 object-contain" />
            )}
            <span className="text-[14px] font-semibold" style={{ color: branding.primaryColor }}>
              Your Organization
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[12px] text-[#6B7280]">Dashboard</span>
              <span className="text-[12px] text-[#6B7280]">Courses</span>
            </div>
          </div>

          {/* Mini content preview */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium" style={{ color: branding.primaryColor }}>
                Welcome back
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <div
                className="rounded-[6px] px-3 py-1.5 text-[12px] font-medium text-white"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Primary CTA
              </div>
              <div
                className="rounded-[6px] border px-3 py-1.5 text-[12px] font-medium"
                style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
              >
                Secondary
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Branding"}
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
