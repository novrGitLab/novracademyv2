"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import { ArrowLeft, Copy, Check, Tag } from "lucide-react";

interface Lab {
  id: string;
  name: string;
  category: string;
  description: string;
  points: number;
  labTemplateId: string;
  organizationId: string | null;
  createdAt: string;
  solved: boolean;
}

export default function AdminLabDetailPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const router = useRouter();
  const { data: lab, loading } = useApi<Lab>(`/labs/${labId}`, null as any);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function copyId() {
    navigator.clipboard.writeText(labId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-[14px] text-[#6B7280]">
        Loading lab...
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-[14px] text-[#DC2626]">
        Lab not found.
      </div>
    );
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
        <div className="flex-1">
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            {lab.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {lab.category}
            </span>
            <span className="font-semibold text-[#683290]">{lab.points} pts</span>
            {lab.organizationId === null && (
              <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-medium text-[#92400E]">
                Global
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lab Details */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)] space-y-4">
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            DESCRIPTION
          </label>
          <p className="mt-2 text-[14px] leading-relaxed text-[#374151]">
            {lab.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              LAB TEMPLATE ID
            </label>
            <p className="mt-1 font-mono text-[14px] text-[#374151]">
              {lab.labTemplateId}
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              CREATED
            </label>
            <p className="mt-1 text-[14px] text-[#374151]">
              {new Date(lab.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Lab ID for reference */}
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
            LAB ID
          </label>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-[#F1F3F5] px-2 py-1 font-mono text-[13px] text-[#374151]">
              {labId}
            </code>
            <button
              onClick={copyId}
              className="rounded p-1 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              title="Copy lab ID"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Employee link */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
          EMPLOYEE VIEW
        </label>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Employees access this lab from their dashboard. Share this link:
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-[#F1F3F5] px-3 py-2 font-mono text-[13px] text-[#374151]">
            /dashboard/labs/{labId}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/dashboard/labs/${labId}`);
              setToast({ message: "Link copied!", type: "success" });
            }}
            className="shrink-0 rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
