"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiMutate } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/components/ui/toast-context";
import { Modal } from "@/components/ui/Modal";
import { HtmlEditor } from "@/components/ui/HtmlEditor";
import type { LaunchCampaignPayload, SendingProfile } from "@/types/campaigns";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";

interface OrgUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
}

type SenderForm = {
  id?: string;
  name: string;
  senderName: string;
  senderEmail: string;
  isDefault: boolean;
};

const EMPTY_SENDER: SenderForm = {
  name: "",
  senderName: "",
  senderEmail: "",
  isDefault: false,
};

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgId = (session?.user as any)?.organization?.id;

  const [name, setName] = useState("");
  const [emails, setEmails] = useState<Array<{ email: string; firstName?: string; lastName?: string }>>([]);
  const [emailInput, setEmailInput] = useState("");

  // Saved senders
  const [senders, setSenders] = useState<SendingProfile[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  const [savingSender, setSavingSender] = useState(false);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [editingSender, setEditingSender] = useState<SenderForm | null>(null);

  const [templateHtml, setTemplateHtml] = useState(
    `<h1>Verify your account</h1>\n<p>Click <a href="{{.URL}}">here</a> to verify your email address.</p>\n<p>If you did not request this, please ignore this email.</p>`
  );
  const [landingPageHtml, setLandingPageHtml] = useState(
    `<h1>Employee Portal</h1>\n<form>\n  <label>Email</label>\n  <input name="email" type="email" placeholder="you@company.com" />\n  <label>Password</label>\n  <input name="password" type="password" placeholder="Enter password" />\n  <button type="submit">Login</button>\n</form>`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { toast: showToast } = useToast();

  // Employee picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [loadingOrgUsers, setLoadingOrgUsers] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const loadSenders = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/proxy/sending-profiles?organizationId=${orgId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list: SendingProfile[] = data.profiles ?? [];
        setSenders(list);
        // Default to the org's default sender, or first
        if (!selectedSenderId) {
          const def = list.find((s) => s.isDefault) ?? list[0];
          if (def) setSelectedSenderId(def.id);
        }
      }
    } catch (e) {
      console.error("Failed to load senders", e);
    }
  }, [orgId, selectedSenderId]);

  useEffect(() => {
    loadSenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const openPicker = useCallback(async () => {
    setPickerOpen(true);
    if (orgUsers.length === 0 && orgId) {
      setLoadingOrgUsers(true);
      try {
        const res = await fetch(`/api/proxy/organizations/${orgId}/users?pageSize=100`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setOrgUsers(data.users ?? []);
        }
      } catch (e) {
        console.error("Failed to load org users", e);
      } finally {
        setLoadingOrgUsers(false);
      }
    }
  }, [orgId, orgUsers.length]);

  const filteredOrgUsers = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return orgUsers;
    return orgUsers.filter(
      (u) => u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q)
    );
  }, [orgUsers, pickerSearch]);

  function addOrgUsersAsRecipients(selected: OrgUser[]) {
    const existing = new Set(emails.map((e) => e.email.toLowerCase()));
    const additions = selected
      .filter((u) => !existing.has(u.email.toLowerCase()))
      .map((u) => {
        const [first, ...rest] = (u.name ?? "").split(" ").filter(Boolean);
        return { email: u.email, firstName: first, lastName: rest.join(" ") };
      });
    if (additions.length > 0) {
      setEmails([...emails, ...additions]);
      setToast({ message: `Added ${additions.length} recipient${additions.length === 1 ? "" : "s"}`, type: "success" });
    } else {
      setToast({ message: "No new recipients to add", type: "error" });
    }
    setPickerOpen(false);
  }

  function openNewSenderForm() {
    setEditingSender({ ...EMPTY_SENDER });
    setSenderError(null);
  }

  function openEditSenderForm(p: SendingProfile) {
    setEditingSender({
      id: p.id,
      name: p.name,
      senderName: p.senderName,
      senderEmail: p.senderEmail,
      isDefault: p.isDefault,
    });
    setSenderError(null);
  }

  async function saveSender(form: SenderForm) {
    if (!form.name.trim() || !form.senderName.trim() || !form.senderEmail.trim()) {
      setSenderError("Profile name, sender name, and sender email are required");
      return;
    }
    setSavingSender(true);
    setSenderError(null);
    try {
      const payload = {
        name: form.name.trim(),
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        isDefault: form.isDefault,
      };
      if (form.id) {
        await apiMutate(`/sending-profiles/${form.id}`, "PATCH", payload);
      } else {
        await apiMutate("/sending-profiles", "POST", payload);
      }
      setToast({ message: form.id ? "Sender updated" : "Sender saved", type: "success" });
      setEditingSender(null);
      await loadSenders();
    } catch (e) {
      setSenderError((e as Error).message || "Failed to save sender");
    } finally {
      setSavingSender(false);
    }
  }

  async function deleteSender(id: string) {
    if (!confirm("Delete this saved sender?")) return;
    try {
      await apiMutate(`/sending-profiles/${id}`, "DELETE", undefined);
      setToast({ message: "Sender deleted", type: "success" });
      if (selectedSenderId === id) setSelectedSenderId("");
      await loadSenders();
    } catch (e) {
      setToast({ message: (e as Error).message || "Failed to delete", type: "error" });
    }
  }

  function addEmail(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const newEmails = parts
      .map((e) => {
        const [email, ...rest] = e.split(/\s+/);
        const firstName = rest[0] || "";
        const lastName = rest.slice(1).join(" ") || "";
        return { email, firstName: firstName || undefined, lastName: lastName || undefined };
      })
      .filter((e) => e.email && e.email.includes("@") && !emails.some((x) => x.email === e.email));
    if (newEmails.length > 0) setEmails([...emails, ...newEmails]);
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(emailInput);
      setEmailInput("");
    }
  }

  function removeEmail(index: number) {
    setEmails(emails.filter((_, i) => i !== index));
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1);
      const parsed = lines
        .map((line) => {
          const [email, firstName, lastName] = line.split(",").map((s) => s.trim());
          if (!email || !email.includes("@")) return null;
          return { email, firstName: firstName || undefined, lastName: lastName || undefined };
        })
        .filter(Boolean) as Array<{ email: string; firstName?: string; lastName?: string }>;
      const unique = parsed.filter((e) => !emails.some((x) => x.email === e.email));
      setEmails([...emails, ...unique]);
      setToast({ message: `Imported ${unique.length} emails`, type: "success" });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Campaign name is required"); return; }
    if (!selectedSenderId) { setError("Select an email sender"); return; }
    if (emails.length === 0) { setError("Add at least one recipient email"); return; }
    if (!templateHtml.trim()) { setError("Email template is required"); return; }
    if (!landingPageHtml.trim()) { setError("Landing page is required"); return; }

    setLoading(true);
    try {
      const payload: LaunchCampaignPayload = {
        name: name.trim(),
        sendingProfileId: selectedSenderId,
        employeeEmails: emails,
        templateHtml,
        landingPageHtml,
      };
      await apiMutate<{ campaignId: number; dbCampaignId: string }>("/campaigns", "POST", payload);
      setToast({ message: "Campaign launched successfully!", type: "success" });
      showToast("Campaign launched successfully");
      setTimeout(() => router.push("/admin/phishing"), 1000);
    } catch (err) {
      const msg = (err as Error).message || "Failed to launch campaign";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const selectedSender = senders.find((s) => s.id === selectedSenderId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-[8px] p-2 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Launch Phishing Campaign
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Create a new phishing awareness campaign to test employee security.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Saved Email Senders */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Email Sender</h3>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                Pick a saved sender or create a new one. Senders are reused across campaigns.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewSenderForm}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#683290] bg-white px-3 py-1.5 text-[12px] font-medium text-[#683290] transition hover:bg-[#F9F4FC]"
            >
              <Plus className="h-3 w-3" /> New Sender
            </button>
          </div>

          {senders.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#6B7280]">
              No saved senders yet. Create one to launch a campaign.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {senders.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-[8px] border px-4 py-3 transition ${
                    selectedSenderId === s.id
                      ? "border-[#683290] bg-[#F9F4FC]"
                      : "border-[#E5E7EB] bg-white hover:bg-[#F8F9FB]"
                  }`}
                >
                  <input
                    type="radio"
                    name="sender"
                    value={s.id}
                    checked={selectedSenderId === s.id}
                    onChange={() => setSelectedSenderId(s.id)}
                    className="h-4 w-4 text-[#683290] focus:ring-[#683290]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#1A1A2E]">{s.name}</span>
                      {s.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E]">
                          <Star className="h-2.5 w-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {s.senderName} &lt;{s.senderEmail}&gt;
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openEditSenderForm(s);
                    }}
                    className="rounded-[6px] p-1.5 text-[#6B7280] transition hover:bg-white hover:text-[#1A1A2E]"
                    title="Edit"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteSender(s.id);
                    }}
                    className="rounded-[6px] p-1.5 text-[#6B7280] transition hover:bg-white hover:text-[#DC2626]"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </label>
              ))}
            </div>
          )}

          {selectedSender && (
            <div className="mt-3 rounded-[8px] border border-[#FFF7ED] bg-[#FFFBEB] px-4 py-3">
              <p className="text-[13px] text-[#92400E]">
                Recipients will see: <span className="font-semibold">{selectedSender.senderName}</span> &lt;<span className="font-semibold">{selectedSender.senderEmail}</span>&gt;
              </p>
            </div>
          )}
        </div>

        {/* Campaign Name */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            CAMPAIGN NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Phishing Awareness Test"
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>

        {/* Recipient Emails */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                RECIPIENT EMAILS
              </label>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Add manually, upload a CSV, or pick from your employees.
              </p>
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#683290] bg-white px-3 py-1.5 text-[12px] font-medium text-[#683290] transition hover:bg-[#F9F4FC]"
            >
              <Users className="h-3 w-3" /> From Employees
            </button>
          </div>

          {/* Email tags */}
          {emails.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {emails.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F4ECF8] px-3 py-1 text-[12px] font-medium text-[#683290]"
                >
                  <Mail className="h-3 w-3" />
                  {e.email}
                  {e.firstName && (
                    <span className="text-[#683290]/60">({e.firstName})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeEmail(i)}
                    className="ml-0.5 rounded-full p-0.5 transition hover:bg-[#683290]/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Email input */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              placeholder="user@company.com"
              className="flex-1 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
            />
            <button
              type="button"
              onClick={() => { addEmail(emailInput); setEmailInput(""); }}
              className="rounded-[8px] border border-[#E5E7EB] px-3 py-3 text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* CSV Upload */}
          <div className="mt-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-dashed border-[#E5E7EB] px-4 py-3 text-[13px] text-[#6B7280] transition hover:border-[#683290]/30 hover:bg-[#F4ECF8]/30">
              <Upload className="h-4 w-4" />
              Upload CSV (columns: email, firstName, lastName)
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
          </div>

          <p className="mt-2 text-[12px] text-[#9CA3AF]">
            {emails.length} recipient{emails.length !== 1 ? "s" : ""} added
          </p>
        </div>

        {/* Email Template */}
        <HtmlEditor
          label="EMAIL TEMPLATE (HTML)"
          value={templateHtml}
          onChange={setTemplateHtml}
          hint={
            <>
              Use <code className="rounded bg-[#F1F3F5] px-1.5 py-0.5 text-[12px] font-mono">{"{{.URL}}"}</code> as
              the phishing link placeholder. GoPhish will replace it with the tracking URL.
            </>
          }
          placeholder="<p>Dear {{.FirstName}}, ...</p>"
        />

        {/* Landing Page */}
        <HtmlEditor
          label="LANDING PAGE (HTML)"
          value={landingPageHtml}
          onChange={setLandingPageHtml}
          hint={
            <>
              The page employees see after clicking. Typically a fake login form to
              capture submitted credentials for the simulation.
            </>
          }
          placeholder="<form>...</form>"
        />

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-[8px] border border-[#E5E7EB] px-5 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {loading ? "Launching..." : "Launch Campaign"}
          </button>
        </div>
      </form>

      {/* Sender form modal */}
      {editingSender && (
        <SenderFormModal
          initial={editingSender}
          saving={savingSender}
          error={senderError}
          onSave={saveSender}
          onClose={() => setEditingSender(null)}
        />
      )}

      {/* Employee picker modal */}
      {pickerOpen && (
        <EmployeePickerModal
          users={filteredOrgUsers}
          loading={loadingOrgUsers}
          search={pickerSearch}
          onSearch={setPickerSearch}
          existingEmails={new Set(emails.map((e) => e.email.toLowerCase()))}
          onConfirm={addOrgUsersAsRecipients}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function SenderFormModal({
  initial,
  saving,
  error,
  onSave,
  onClose,
}: {
  initial: SenderForm;
  saving: boolean;
  error: string | null;
  onSave: (f: SenderForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SenderForm>(initial);

  const upd = <K extends keyof SenderForm>(k: K, v: SenderForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open
      onClose={onClose}
      title={initial.id ? "Edit Sender" : "New Email Sender"}
      description="Pick how phishing emails appear to recipients. Delivery is handled by the platform's shared SMTP relay."
      size="md"
    >
      <div className="space-y-3">
        {error && (
          <div className="rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#DC2626]">
            {error}
          </div>
        )}
        <Field label="PROFILE NAME" hint="An internal name to identify this sender">
          <input
            value={form.name}
            onChange={(e) => upd("name", e.target.value)}
            placeholder="e.g. Primary IT Sender"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SENDER NAME">
            <input
              value={form.senderName}
              onChange={(e) => upd("senderName", e.target.value)}
              placeholder="IT Security Team"
              className={inputCls}
            />
          </Field>
          <Field label="SENDER EMAIL" hint="Must be on a verified sending domain">
            <input
              type="email"
              value={form.senderEmail}
              onChange={(e) => upd("senderEmail", e.target.value)}
              placeholder="security@yourdomain.com"
              className={inputCls}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#374151]">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => upd("isDefault", e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E7EB] text-[#683290] focus:ring-[#683290]"
          />
          Use as default sender for this organization
        </label>
        <div className="rounded-[6px] border border-[#E0E7FF] bg-[#EEF2FF] px-3 py-2 text-[12px] text-[#3730A3]">
          The actual SMTP transport is provided by the platform — no SMTP credentials needed.
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[6px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
        >
          {saving ? "Saving..." : initial.id ? "Save Changes" : "Create Sender"}
        </button>
      </div>
    </Modal>
  );
}

function EmployeePickerModal({
  users,
  loading,
  search,
  onSearch,
  existingEmails,
  onConfirm,
  onClose,
}: {
  users: OrgUser[];
  loading: boolean;
  search: string;
  onSearch: (s: string) => void;
  existingEmails: Set<string>;
  onConfirm: (selected: OrgUser[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (email: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.email)));
    }
  };

  const confirm = () => {
    const chosen = users.filter((u) => selected.has(u.email));
    onConfirm(chosen);
    setSelected(new Set());
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Pick from Employees"
      description={`${users.length} employee${users.length === 1 ? "" : "s"} in your organization. Select who should receive the campaign.`}
      size="lg"
    >
      <div className="mb-3 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name or email…"
          className={inputCls}
        />
        <button
          type="button"
          onClick={toggleAll}
          className="whitespace-nowrap rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
        >
          {selected.size === users.length ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="max-h-[360px] overflow-y-auto rounded-[6px] border border-[#E5E7EB]">
        {loading ? (
          <div className="p-6 text-center text-[13px] text-[#6B7280]">Loading employees…</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-[#6B7280]">No employees found.</div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F9FAFB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const already = existingEmails.has(u.email.toLowerCase());
                return (
                  <tr
                    key={u.id}
                    className={`border-t border-[#F3F4F6] ${already ? "bg-[#F9FAFB] text-[#9CA3AF]" : "hover:bg-[#F9F4FC]"}`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        disabled={already}
                        checked={selected.has(u.email)}
                        onChange={() => toggle(u.email)}
                        className="h-4 w-4 rounded border-[#E5E7EB] text-[#683290] focus:ring-[#683290] disabled:opacity-40"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-[#1A1A2E]">{u.name ?? "—"}</td>
                    <td className="px-3 py-2 text-[#374151]">{u.email}</td>
                    <td className="px-3 py-2 text-[12px] text-[#6B7280]">
                      {u.role}
                      {already && <span className="ml-2 text-[10px] text-[#683290]">already added</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4">
        <p className="text-[12px] text-[#6B7280]">
          {selected.size} selected
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 rounded-[6px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add {selected.size} recipient{selected.size === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-[0.6px] text-[#1A1A2E]">{label}</label>
      {hint && <p className="mt-0.5 text-[11px] text-[#6B7280]">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10";
