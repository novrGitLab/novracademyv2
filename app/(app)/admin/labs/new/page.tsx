"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiMutate } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import { ArrowLeft, Send } from "lucide-react";
import { UserRole } from "@novr/types";

export default function NewLabPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgId = (session?.user as any)?.organization?.id;
  const userRole = session?.user?.role;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("50");
  const [flag, setFlag] = useState("");
  const [labTemplateId, setLabTemplateId] = useState("");
  const [organizationScope, setOrganizationScope] = useState<"org" | "global">("org");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const canSetGlobal = userRole === UserRole.SUPER_ADMIN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Lab name is required"); return; }
    if (!category.trim()) { setError("Category is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    if (!flag.trim()) { setError("Flag is required"); return; }
    if (!labTemplateId.trim()) { setError("Lab template ID is required"); return; }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum < 1) { setError("Points must be a positive number"); return; }

    setLoading(true);
    try {
      await apiMutate("/labs", "POST", {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        flag: flag.trim(),
        labTemplateId: labTemplateId.trim(),
        points: pointsNum,
        organizationId: organizationScope === "global" ? null : orgId ?? null,
      });
      setToast({ message: "Lab created successfully!", type: "success" });
      setTimeout(() => router.push("/admin/labs"), 1000);
    } catch (err) {
      setError((err as Error).message || "Failed to create lab");
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
            Create Lab
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Set up a new CTF-style hands-on security lab.
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

        {/* Lab Name */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            LAB NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. SQL Injection Fundamentals"
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>

        {/* Category & Points */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                CATEGORY
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web Exploitation"
                className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                POINTS
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            DESCRIPTION
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what this lab covers and what skills it tests..."
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>

        {/* Lab Template ID & Scope */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                LAB TEMPLATE ID
              </label>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Must match a directory name under ~/lab-templates/ on the Linode VPS.
              </p>
              <input
                type="text"
                value={labTemplateId}
                onChange={(e) => setLabTemplateId(e.target.value)}
                placeholder="e.g. sqli-fundamentals"
                className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              />
            </div>
            {canSetGlobal && (
              <div>
                <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                  VISIBILITY
                </label>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  Global labs are visible to all organizations.
                </p>
                <select
                  value={organizationScope}
                  onChange={(e) => setOrganizationScope(e.target.value as "org" | "global")}
                  className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                >
                  <option value="org">My Organization</option>
                  <option value="global">Global (all organizations)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Flag */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            FLAG
          </label>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            The exact string employees must submit to solve this lab. Case-sensitive.
          </p>
          <input
            type="text"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="e.g. FLAG{s3cur1ty_pr0t3ct3d}"
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 font-mono text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
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
            {loading ? "Creating..." : "Create Lab"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
