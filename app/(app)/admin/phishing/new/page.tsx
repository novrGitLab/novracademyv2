"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiMutate } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import type { LaunchCampaignPayload } from "@/types/campaigns";
import {
  ArrowLeft,
  Mail,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [emails, setEmails] = useState<Array<{ email: string; firstName?: string; lastName?: string }>>([]);
  const [emailInput, setEmailInput] = useState("");
  const [templateHtml, setTemplateHtml] = useState(
    `<h1>Verify your account</h1>\n<p>Click <a href="{{.URL}}">here</a> to verify your email address.</p>\n<p>If you did not request this, please ignore this email.</p>`
  );
  const [landingPageHtml, setLandingPageHtml] = useState(
    `<h1>Employee Portal</h1>\n<form>\n  <label>Email</label>\n  <input name="email" type="email" placeholder="you@company.com" />\n  <label>Password</label>\n  <input name="password" type="password" placeholder="Enter password" />\n  <button type="submit">Login</button>\n</form>`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function addEmail(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const newEmails = parts.map((e) => {
      const [email, ...rest] = e.split(/\s+/);
      const firstName = rest[0] || "";
      const lastName = rest.slice(1).join(" ") || "";
      return { email, firstName: firstName || undefined, lastName: lastName || undefined };
    }).filter((e) => e.email && e.email.includes("@") && !emails.some((x) => x.email === e.email));
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
      const lines = text.split("\n").slice(1); // skip header
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
    if (emails.length === 0) { setError("Add at least one recipient email"); return; }
    if (!templateHtml.trim()) { setError("Email template is required"); return; }
    if (!landingPageHtml.trim()) { setError("Landing page is required"); return; }

    setLoading(true);
    try {
      const payload: LaunchCampaignPayload = {
        name: name.trim(),
        employeeEmails: emails,
        templateHtml,
        landingPageHtml,
      };
      await apiMutate<{ campaignId: number; dbCampaignId: string }>(
        "/campaigns",
        "POST",
        payload
      );
      setToast({ message: "Campaign launched successfully!", type: "success" });
      setTimeout(() => router.push("/admin/phishing"), 1000);
    } catch (err) {
      setError((err as Error).message || "Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  }

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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}

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
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            RECIPIENT EMAILS
          </label>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Enter emails separated by commas or press Enter after each one.
          </p>

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
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            EMAIL TEMPLATE (HTML)
          </label>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Use <code className="rounded bg-[#F1F3F5] px-1.5 py-0.5 text-[12px] font-mono">{"{{.URL}}"}</code> as
            the phishing link placeholder. GoPhish will replace it with the tracking URL.
          </p>
          <textarea
            value={templateHtml}
            onChange={(e) => setTemplateHtml(e.target.value)}
            rows={10}
            className="mt-3 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-mono text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
            spellCheck={false}
          />
        </div>

        {/* Landing Page */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            LANDING PAGE (HTML)
          </label>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            The page employees see after clicking. Typically a fake login form to
            capture submitted credentials for the simulation.
          </p>
          <textarea
            value={landingPageHtml}
            onChange={(e) => setLandingPageHtml(e.target.value)}
            rows={10}
            className="mt-3 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-mono text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
            spellCheck={false}
          />
        </div>

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
            <Send className="h-3.5 w-3.5" />
            {loading ? "Launching..." : "Launch Campaign"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
