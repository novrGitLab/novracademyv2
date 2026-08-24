"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { CertificateTemplate } from "@/components/CertificateTemplate";
import { apiMutate, useApi } from "@/lib/useApi";
import type { Tenant } from "@/types/tenants";

const DEFAULT_COLOR = "#2563EB";

export default function CertificateSettingsPage() {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId ?? null;

  const { data: tenant } = useApi<Tenant | null>(tenantId ? `/tenants/${tenantId}` : "/tenants/none", null);

  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!tenant) return;
    setLogoUrl(tenant.logoUrl ?? "");
    setPrimaryColor(tenant.primaryColor ?? DEFAULT_COLOR);
  }, [tenant]);

  async function handleSave() {
    if (!tenantId) {
      setToast({ message: "No tenant on this account — nothing to save to.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await apiMutate(`/tenants/${tenantId}/branding`, "PATCH", {
        logoUrl: logoUrl || undefined,
        primaryColor,
      });
      setToast({ message: "Certificate branding saved", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message || "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-[24px] font-semibold text-text-primary">Certificate template</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          Your logo and primary color appear on every certificate your learners earn.
        </p>
      </div>

      <div className="rounded-card border border-border bg-background p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Logo URL</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Primary color</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-card border border-border"
              />
              <span className="font-mono text-[13px] text-text-secondary">{primaryColor}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Live preview — mirrors the layout rendered server-side in services/certificateDocument.tsx */}
      <div>
        <p className="mb-2 text-[13px] font-medium text-text-secondary">Preview</p>
        <CertificateTemplate
          learnerName="Jordan Alexis"
          courseName="Advanced Threat Detection"
          completionDate="January 1, 2026"
          certId="sample-cert-id"
          orgName={tenant?.name ?? "Your Organization"}
          orgLogoUrl={logoUrl || null}
          orgPrimaryColor={primaryColor}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
