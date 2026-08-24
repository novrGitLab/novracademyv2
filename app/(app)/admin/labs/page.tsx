"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { Plus, FlaskConical, Award, Tag } from "lucide-react";

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

export default function AdminLabsPage() {
  const { data, loading } = useApi<{ labs: Lab[] }>("/labs", { labs: [] });
  const labs = data.labs ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Labs
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Manage CTF-style hands-on security labs for your organization.
          </p>
        </div>
        <Link
          href="/admin/labs/new"
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
        >
          <Plus className="h-4 w-4" />
          Create Lab
        </Link>
      </div>

      {/* Labs list */}
      {loading ? (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-12 text-center text-[14px] text-[#6B7280]">
          Loading labs...
        </div>
      ) : labs.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-[#D1D5DB]" />
          <p className="mt-3 text-[14px] font-medium text-[#6B7280]">
            No labs yet
          </p>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Create your first lab to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-6 py-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[14px] font-semibold text-[#1A1A2E]">
                    {lab.name}
                  </h3>
                  {lab.solved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                      <Award className="h-3 w-3" />
                      Solved
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-[12px] text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {lab.category}
                  </span>
                  <span>{lab.points} pts</span>
                  <span>Template: {lab.labTemplateId}</span>
                  {lab.organizationId === null && (
                    <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-medium text-[#92400E]">
                      Global
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/labs/${lab.id}`}
                className="ml-4 shrink-0 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
