"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/DesignSystem";

const fieldClassName =
  "h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10";

const selectClassName =
  "h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("Enterprise");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Organization name is required."); return; }
    if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) { setError("Valid admin email is required."); return; }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log("Creating organization:", { name, slug, plan, adminEmail, adminName });
      router.push("/admin/organizations");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <BackLink href="/admin/organizations" label="Back to Organizations" />

      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
          New Organization
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Create a new organization tenant with an admin account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              ORGANIZATION NAME
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setSlug(generateSlug(e.target.value)); }}
              placeholder="e.g. Acme Corporation"
              className={`${fieldClassName} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              SLUG
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. acme-corporation"
              className={`${fieldClassName} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="plan" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              PLAN
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className={`${selectClassName} mt-2`}
            >
              <option value="Starter">Starter</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Enterprise Plus">Enterprise Plus</option>
            </select>
          </div>

          <div className="border-t border-[#E5E7EB] pt-5">
            <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Admin Account</h3>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              The primary admin for this organization.
            </p>
          </div>

          <div>
            <label htmlFor="adminName" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              ADMIN FULL NAME
            </label>
            <input
              id="adminName"
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Jane Doe"
              className={`${fieldClassName} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="adminEmail" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              ADMIN EMAIL
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@company.com"
              className={`${fieldClassName} mt-2`}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-[6px] bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="h-[42px] rounded-[8px] bg-[#683290] px-6 text-[13px] font-semibold text-white transition hover:bg-[#542573] disabled:opacity-60"
          >
            {loading ? "CREATING…" : "CREATE ORGANIZATION"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/organizations")}
            className="h-[42px] rounded-[8px] border border-[#E5E7EB] px-6 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
