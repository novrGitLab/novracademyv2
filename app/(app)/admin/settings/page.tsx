"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApi, apiMutate } from "@/lib/useApi";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  GraduationCap,
  Key,
  Palette,
  Save,
  Shield,
  Upload,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

/* -------------------------------------------------------------------------- */
/*  Shared Settings Form                                                       */
/* -------------------------------------------------------------------------- */

function SettingsForm({
  sections,
}: {
  sections: { label: string; content: React.ReactNode }[];
}) {
  const [activeSection, setActiveSection] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar nav */}
        <nav className="space-y-1">
          {sections.map((section, i) => (
            <button
              key={section.label}
              onClick={() => setActiveSection(i)}
              className={`w-full rounded-[8px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                activeSection === i
                  ? "bg-[#683290] text-white"
                  : "text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          {sections[activeSection]?.content}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form Field                                                                 */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-[12px] text-[#6B7280]">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10";

const textareaClass =
  "w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10 min-h-[80px] resize-y";

const selectClass =
  "h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10";

/* -------------------------------------------------------------------------- */
/*  Super Admin Settings                                                       */
/* -------------------------------------------------------------------------- */

function SuperAdminSettings() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const sections = [
    {
      label: "General",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Platform Settings</h3>
          <Field label="PLATFORM NAME" hint="Display name shown across the platform">
            <input type="text" defaultValue="Novr Academy" className={inputClass} />
          </Field>
          <Field label="SUPPORT EMAIL" hint="Contact email for platform support">
            <input type="email" defaultValue="support@novr.academy" className={inputClass} />
          </Field>
          <Field label="PLATFORM URL" hint="The main URL for your platform">
            <input type="url" defaultValue="https://novr.academy" className={inputClass} />
          </Field>
          <Field label="DEFAULT TIMEZONE">
            <select defaultValue="Africa/Lagos" className={selectClass}>
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </Field>
          <button onClick={() => setToast({ message: "Settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Branding",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Branding</h3>
          <Field label="LOGO" hint="Upload your platform logo (SVG or PNG, recommended 200x40px)">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-32 items-center justify-center rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] text-[12px] text-[#9CA3AF]">
                Drop or click
              </div>
              <img src="/novracademy-logo.png" alt="Current logo" className="h-10 rounded" />
            </div>
          </Field>
          <Field label="PRIMARY COLOR" hint="Brand color used for CTAs and accents">
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#683290" className="h-10 w-10 cursor-pointer rounded-[8px] border border-[#E5E7EB]" />
              <input type="text" defaultValue="#683290" className={inputClass} />
            </div>
          </Field>
          <button onClick={() => setToast({ message: "Branding updated", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Billing",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Billing & Subscription</h3>
          <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A2E]">Enterprise Plan</p>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">$2,500/month · Up to 50,000 users</p>
              </div>
              <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-[12px] font-semibold text-[#16A34A]">Active</span>
            </div>
          </div>
          <Field label="BILLING EMAIL">
            <input type="email" defaultValue="billing@novr.academy" className={inputClass} />
          </Field>
          <button onClick={() => setToast({ message: "Billing updated", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Security",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Security Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Require 2FA for all admins</p>
                <p className="text-[12px] text-[#6B7280]">Enforce two-factor authentication for admin accounts</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#683290]" />
            </label>
            <label className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Session timeout</p>
                <p className="text-[12px] text-[#6B7280]">Auto-logout after inactivity</p>
              </div>
              <select defaultValue="30" className="h-8 w-24 rounded-[6px] border border-[#E5E7EB] px-2 text-[12px] text-[#1A1A2E]">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
              </select>
            </label>
            <label className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">IP allowlist</p>
                <p className="text-[12px] text-[#6B7280]">Restrict admin access to specific IP addresses</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded accent-[#683290]" />
            </label>
          </div>
          <button onClick={() => setToast({ message: "Security settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Integrations",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Integrations</h3>
          <div className="space-y-3">
            {[
              { name: "Google Workspace", connected: true },
              { name: "Microsoft 365", connected: false },
              { name: "Slack", connected: false },
              { name: "Zapier", connected: false },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">{integration.name}</p>
                </div>
                <button className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition ${integration.connected ? "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]" : "bg-[#683290] text-white hover:bg-[#542573]"}`}>
                  {integration.connected ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return <SettingsForm sections={sections} />;
}

/* -------------------------------------------------------------------------- */
/*  Compliance Settings Section                                                */
/* -------------------------------------------------------------------------- */

interface ComplianceSettingsData {
  organizationId: string;
  deadline: string | null;
  threshold: number;
  autoSuspend: boolean;
}

function ComplianceSettingsSection({ toast, setToast }: { toast: any; setToast: any }) {
  const { data: settings, refetch: refetchSettings } = useApi<ComplianceSettingsData>("/compliance/settings", { organizationId: "", deadline: null, threshold: 80, autoSuspend: false });
  const [threshold, setThreshold] = useState<number>(80);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setThreshold(settings.threshold);
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await apiMutate("/compliance/settings", "PUT", {
        threshold,
      });
      refetchSettings();
      setToast({ message: "Compliance settings saved", type: "success" });
    } catch {
      setToast({ message: "Failed to save compliance settings", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Compliance Settings</h3>
      <Field label="COMPLIANCE THRESHOLD" hint="Minimum percentage of required courses to be considered compliant">
        <div className="flex items-center gap-3">
          <input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 0)} min={0} max={100} className="w-24 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]" />
          <span className="text-[14px] text-[#6B7280]">% of required courses</span>
        </div>
      </Field>
      <button onClick={handleSave} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
        <Save className="h-3.5 w-3.5" /> Save Changes
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Phishing Sender Section                                                    */
/* -------------------------------------------------------------------------- */

function PhishingSenderSection({ toast, setToast }: { toast: any; setToast: any }) {
  const { data: session } = useSession();
  const orgId = (session?.user as any)?.organization?.id;
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (orgId && !initialized) {
      apiMutate<{ senderName: string | null; senderEmail: string | null }>(`/organizations/${orgId}`, "GET").then((org) => {
        if (org) {
          setSenderName(org.senderName ?? "");
          setSenderEmail(org.senderEmail ?? "");
        }
        setInitialized(true);
      }).catch(() => setInitialized(true));
    }
  }, [orgId, initialized]);

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await apiMutate(`/organizations/${orgId}/sender`, "PATCH", {
        senderName: senderName || null,
        senderEmail: senderEmail || null,
      });
      setToast({ message: "Phishing sender config saved", type: "success" });
    } catch {
      setToast({ message: "Failed to save sender config", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Phishing Campaign Sender</h3>
      <p className="text-[13px] text-[#6B7280]">
        Configure how phishing simulation emails appear to your employees. This is the "From" name and email they&apos;ll see.
      </p>
      <Field label="SENDER NAME" hint="Display name shown as the email sender">
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="e.g. IT Security Team"
          className={inputClass}
        />
      </Field>
      <Field label="SENDER EMAIL" hint="From address shown in the email header">
        <input
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder="e.g. security@yourcompany.com"
          className={inputClass}
        />
      </Field>
      <div className="rounded-[8px] border border-[#FFF7ED] bg-[#FFFBEB] p-4">
        <p className="text-[13px] text-[#92400E]">
          <strong>Preview:</strong> Your employees will receive phishing emails from{" "}
          <span className="font-semibold">{senderName || "IT Security Team"}</span> &lt;
          <span className="font-semibold">{senderEmail || "security@novracademy.com"}</span>&gt;
        </p>
      </div>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50">
        <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Sender Config"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Org Admin Settings                                                         */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Branding Section                                                           */
/* -------------------------------------------------------------------------- */

function BrandingSection({ toast, setToast }: { toast: any; setToast: any }) {
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#683290");
  const [extracting, setExtracting] = useState(false);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setLogoPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    // Extract colors
    setExtracting(true);
    import("@/lib/branding").then(({ extractColorsFromLogo }) => {
      const tempUrl = URL.createObjectURL(file);
      extractColorsFromLogo(tempUrl).then((colors) => {
        URL.revokeObjectURL(tempUrl);
        setPrimaryColor(colors.primary);
        setExtracting(false);
        setToast({ message: "Brand colors extracted", type: "success" });
      }).catch(() => setExtracting(false));
    });
  }

  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Branding</h3>

      {/* Logo */}
      <Field label="LOGO" hint="Upload your organization logo">
        <div className="flex items-center gap-4">
          <div onClick={() => (fileInputRef as any).current?.click()} className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] transition hover:border-[#683290]/40">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-14 w-14 object-contain" />
            ) : (
              <Upload className="h-6 w-6 text-[#9CA3AF]" />
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
          {extracting && <span className="text-[13px] text-[#683290]">Extracting colors...</span>}
          {logoPreview && !extracting && <span className="text-[13px] text-[#16A34A]">Logo uploaded</span>}
        </div>
      </Field>

      {/* Primary Color */}
      <Field label="PRIMARY COLOR" hint="Extracted from logo or set manually">
        <div className="flex items-center gap-3">
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded-[6px] border border-[#E5E7EB]" />
          <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className={inputClass} />
        </div>
      </Field>

      {/* Preview */}
      <div className="rounded-[8px] border border-[#E5E7EB] p-4">
        <p className="text-[12px] text-[#9CA3AF] mb-2">Preview</p>
        <div className="flex gap-2">
          <div className="rounded-[6px] px-4 py-2 text-[13px] font-medium text-white" style={{ backgroundColor: primaryColor }}>Primary</div>
          <div className="rounded-[6px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: primaryColor, color: primaryColor }}>Secondary</div>
        </div>
      </div>

      <button onClick={() => setToast({ message: "Branding saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
        <Save className="h-3.5 w-3.5" /> Save Branding
      </button>
    </div>
  );
}

function OrgAdminSettings() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { data: session, update } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handlePasswordChange() {
    setPwError(null);
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");
      await apiMutate(`/users/${userId}/password`, "PATCH", { password: newPassword });
      await update();
      setToast({ message: "Password updated successfully", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError((err as Error).message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  }

  const sections = [
    {
      label: "Organization",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Organization Profile</h3>
          <Field label="ORGANIZATION NAME">
            <input type="text" defaultValue="Acme Corporation" className={inputClass} />
          </Field>
          <Field label="SLUG" hint="Used in URLs and API calls">
            <input type="text" defaultValue="acme-corporation" className={inputClass} />
          </Field>
          <Field label="INDUSTRY">
            <select defaultValue="technology" className={selectClass}>
              <option value="technology">Technology</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="COMPANY SIZE">
            <select defaultValue="201-1000" className={selectClass}>
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1,000 employees</option>
              <option value="1001-5000">1,001-5,000 employees</option>
              <option value="5000+">5,000+ employees</option>
            </select>
          </Field>
          <button onClick={() => setToast({ message: "Organization profile updated", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>

          <div className="border-t border-[#E5E7EB] pt-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Change Password</h3>
            <p className="mt-1 text-[13px] text-[#6B7280]">Update your account password.</p>
            <div className="mt-4 space-y-4">
              <Field label="NEW PASSWORD">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
              </Field>
              <Field label="CONFIRM NEW PASSWORD">
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputClass} />
              </Field>
              {pwError && <p className="rounded-[6px] bg-red-50 px-3 py-2 text-[13px] text-red-700">{pwError}</p>}
              <button onClick={handlePasswordChange} disabled={pwLoading || !newPassword || !confirmPassword} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-60">
                <Key className="h-3.5 w-3.5" /> {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Branding",
      content: (
        <BrandingSection toast={toast} setToast={setToast} />
      ),
    },
    {
      label: "Notifications",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Email Notifications</h3>
          <div className="space-y-3">
            {[
              { label: "Course assignment notifications", description: "Notify employees when a course is assigned to them", checked: true },
              { label: "Due date reminders", description: "Send reminders 7 days and 1 day before course deadlines", checked: true },
              { label: "Completion certificates", description: "Email certificates automatically upon course completion", checked: true },
              { label: "Weekly compliance digest", description: "Send admins a weekly summary of compliance status", checked: false },
              { label: "At-risk employee alerts", description: "Notify when an employee falls below compliance threshold", checked: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">{item.label}</p>
                  <p className="text-[12px] text-[#6B7280]">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded accent-[#683290]" />
              </label>
            ))}
          </div>
          <button onClick={() => setToast({ message: "Notification settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Compliance",
      content: (
        <ComplianceSettingsSection toast={toast} setToast={setToast} />
      ),
    },
  ];

  return <SettingsForm sections={sections} />;
}

/* -------------------------------------------------------------------------- */
/*  Institution Admin Settings                                                 */
/* -------------------------------------------------------------------------- */

function InstitutionAdminSettings() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const sections = [
    {
      label: "Institution",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Institution Profile</h3>
          <Field label="INSTITUTION NAME">
            <input type="text" defaultValue="Lagos State University" className={inputClass} />
          </Field>
          <Field label="SLUG">
            <input type="text" defaultValue="lagos-state-university" className={inputClass} />
          </Field>
          <Field label="PROGRAM PLAN">
            <select defaultValue="academic-pro" className={selectClass}>
              <option value="starter">Starter</option>
              <option value="standard">Standard</option>
              <option value="academic-pro">Academic Pro</option>
            </select>
          </Field>
          <Field label="DEPARTMENTS" hint="Comma-separated list of departments">
            <textarea defaultValue="Computer Science, Engineering, Business Administration, Law, Sciences" className={textareaClass} />
          </Field>
          <button onClick={() => setToast({ message: "Institution profile updated", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "LMS Integration",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Learning Management System</h3>
          <Field label="LMS TYPE">
            <select defaultValue="canvas" className={selectClass}>
              <option value="canvas">Canvas</option>
              <option value="blackboard">Blackboard</option>
              <option value="moodle">Moodle</option>
              <option value="google-classroom">Google Classroom</option>
              <option value="none">None</option>
            </select>
          </Field>
          <Field label="LMS API KEY" hint="Found in your LMS admin settings">
            <input type="password" defaultValue="••••••••••••" className={inputClass} />
          </Field>
          <Field label="LMS INSTANCE URL">
            <input type="url" defaultValue="https://lasu.instructure.com" className={inputClass} />
          </Field>
          <div className="flex items-center gap-3 rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-4">
            <Shield className="h-5 w-5 text-[#16A34A]" />
            <div>
              <p className="text-[13px] font-medium text-[#1A1A2E]">Connection Status</p>
              <p className="text-[12px] text-[#16A34A]">Connected and syncing</p>
            </div>
          </div>
          <button onClick={() => setToast({ message: "LMS settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Notifications",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Email Notifications</h3>
          <div className="space-y-3">
            {[
              { label: "Course enrollment notifications", description: "Notify students when enrolled in a course", checked: true },
              { label: "Grade notifications", description: "Email students their quiz and assessment grades", checked: true },
              { label: "Certificate issuance", description: "Send certificates automatically upon completion", checked: true },
              { label: "Low performance alerts", description: "Alert faculty when students fall below pass mark", checked: true },
              { label: "Semester registration opens", description: "Notify students when registration is available", checked: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">{item.label}</p>
                  <p className="text-[12px] text-[#6B7280]">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded accent-[#683290]" />
              </label>
            ))}
          </div>
          <button onClick={() => setToast({ message: "Notification settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
    {
      label: "Grading",
      content: (
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E]">Grading & Certification</h3>
          <Field label="PASS MARK" hint="Minimum percentage to pass a course">
            <div className="flex items-center gap-3">
              <input type="number" defaultValue={60} min={0} max={100} className="w-24" />
              <span className="text-[14px] text-[#6B7280]">%</span>
            </div>
          </Field>
          <Field label="CERTIFICATE TEMPLATE">
            <select defaultValue="standard" className={selectClass}>
              <option value="standard">Standard Certificate</option>
              <option value="academic">Academic Certificate</option>
              <option value="ceap">CEAP Professional Certificate</option>
            </select>
          </Field>
          <Field label="GRADE SCALE">
            <select defaultValue="percentage" className={selectClass}>
              <option value="percentage">Percentage (0-100%)</option>
              <option value="letter">Letter Grades (A-F)</option>
              <option value="gpa">GPA (0.0-4.0)</option>
            </select>
          </Field>
          <label className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] p-4">
            <div>
              <p className="text-[13px] font-medium text-[#1A1A2E]">Auto-issue certificates</p>
              <p className="text-[12px] text-[#6B7280]">Automatically issue certificates when students pass</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#683290]" />
          </label>
          <button onClick={() => setToast({ message: "Grading settings saved", type: "success" })} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      ),
    },
  ];

  return <SettingsForm sections={sections} />;
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "SUPER_ADMIN") {
    return (
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Platform Settings</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Manage platform-wide configuration.</p>
        <div className="mt-6">
          <SuperAdminSettings />
        </div>
      </div>
    );
  }

  if (role === "CYBERNOVR_ADMIN") {
    return (
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Content Settings</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Manage courses, curriculum, and certificates.</p>
        <div className="mt-6">
          <SuperAdminSettings />
        </div>
      </div>
    );
  }

  if (role === "INSTITUTION_ADMIN") {
    return (
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Institution Settings</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Manage institution configuration and integrations.</p>
        <div className="mt-6">
          <InstitutionAdminSettings />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Organization Settings</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Manage your organization configuration.</p>
      <div className="mt-6">
        <OrgAdminSettings />
      </div>
    </div>
  );
}
