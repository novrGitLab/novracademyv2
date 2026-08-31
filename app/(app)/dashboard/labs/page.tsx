"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { FlaskConical, Award, Tag, ArrowRight } from "lucide-react";
import { DataState } from "@/components/DataState";

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

export default function EmployeeLabsPage() {
  const { data, loading, error, refetch } = useApi<{ labs: Lab[] }>("/labs", { labs: [] });
  const labs = data.labs ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
          Labs
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Hands-on cybersecurity challenges. Spin up a lab environment, explore, and capture the flag.
        </p>
      </div>

      {/* Labs grid */}
      <DataState
        loading={loading}
        error={!!error}
        errorMessage="Couldn't load labs right now."
        onRetry={refetch}
        empty={!loading && labs.length === 0}
        emptyIcon={<FlaskConical className="h-10 w-10 text-[#D1D5DB]" />}
        emptyTitle="No labs available yet"
        emptyDescription="Check back soon — new challenges are on the way."
        skeleton="grid"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#683290]/50"
            >
              <div
                aria-hidden="true"
                className={
                  lab.solved
                    ? "h-2 bg-gradient-to-r from-green-500 to-emerald-400"
                    : "h-2 bg-gradient-to-r from-[#683290] to-[#9863bc]"
                }
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F4ECF8] px-2.5 py-0.5 text-[11px] font-medium text-[#683290]">
                    <Tag className="h-3 w-3" />
                    {lab.category}
                  </span>
                  {lab.solved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                      <Award className="h-3 w-3" />
                      Solved
                    </span>
                  )}
                </div>

                <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#683290]">
                  {lab.name}
                </h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">
                  {lab.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <span className="text-[13px] font-semibold text-[#683290]">
                    {lab.points} pts
                  </span>
                  <Link
                    href={`/dashboard/labs/${lab.id}`}
                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
                  >
                    {lab.solved ? "Review" : "Start Lab"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </div>
  );
}
