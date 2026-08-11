"use client";

import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { extractColorsFromLogo, generatePalette } from "@/lib/branding";
import { Upload, Palette, ArrowRight, CheckCircle2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Branding Setup Modal (first login)                                         */
/* -------------------------------------------------------------------------- */

interface BrandingSetupModalProps {
  open: boolean;
  onComplete: (branding: { logoUrl: string; primaryColor: string }) => void;
}

export function BrandingSetupModal({ open, onComplete }: BrandingSetupModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#683290");
  const [extracting, setExtracting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setExtracting(true);
    try {
      const tempUrl = URL.createObjectURL(file);
      const colors = await extractColorsFromLogo(tempUrl);
      URL.revokeObjectURL(tempUrl);
      setPrimaryColor(colors.primary);
      setToast({ message: "Brand colors extracted", type: "success" });
    } catch {
      setToast({ message: "Using default colors", type: "error" });
    } finally {
      setExtracting(false);
    }
  }, []);

  function handleComplete() {
    onComplete({
      logoUrl: logoPreview || "",
      primaryColor,
    });
  }

  return (
    <Modal open={open} onClose={() => {}} title="Set Up Your Branding" description="Customize your organization's appearance. This takes 30 seconds." size="md">
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-[14px] text-[#6B7280]">
            Upload your organization logo. We&apos;ll extract your brand colors automatically.
          </p>

          <div className="flex justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] transition hover:border-[#683290]/40"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-24 w-24 object-contain" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-[#9CA3AF]" />
                  <span className="mt-2 text-[12px] text-[#9CA3AF]">Click to upload</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
          </div>

          {extracting && (
            <p className="text-center text-[13px] text-[#683290]">Extracting brand colors...</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!logoPreview}
              className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-[14px] text-[#6B7280]">
            Adjust your brand colors if needed, or keep the auto-extracted ones.
          </p>

          {/* Color picker */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[8px] border border-[#E5E7EB]">
              <Palette className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                PRIMARY COLOR
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-[6px] border border-[#E5E7EB]"
                />
                <span className="font-mono text-[13px] text-[#6B7280]">{primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-[8px] border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#9CA3AF] mb-2">Preview</p>
            <div className="flex gap-2">
              <div className="rounded-[6px] px-4 py-2 text-[13px] font-medium text-white" style={{ backgroundColor: primaryColor }}>
                Primary Button
              </div>
              <div className="rounded-[6px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: primaryColor, color: primaryColor }}>
                Secondary
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">
              Back
            </button>
            <button onClick={handleComplete} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
              <CheckCircle2 className="h-4 w-4" /> Complete Setup
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Modal>
  );
}
