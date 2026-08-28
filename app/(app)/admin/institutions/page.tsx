"use client";

import Link from "next/link";
import { GraduationCap, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { Tenant } from "@/types/tenants";

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  INACTIVE: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
};

export default function InstitutionsPage() {
  const { data: tenants, loading } = useApi<Tenant[]>("/tenants", []);
  const [search, setSearch] = useState("");

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Institutions
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Manage institutional tenants and their academic programs.
          </p>
        </div>
        <Link
          href="/admin/institutions/new"
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Institution
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search institutions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
        />
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Slug</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Plan</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Members</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Courses</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    Loading institutions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <GraduationCap className="mx-auto h-10 w-10 text-[#E5E7EB]" />
                    <p className="mt-3 text-[14px] font-medium text-[#6B7280]">No institutions found</p>
                    <p className="mt-1 text-[13px] text-[#9CA3AF]">
                      {tenants.length === 0
                        ? "Create your first institutional tenant to get started."
                        : "Try adjusting your search."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => {
                  const s = statusStyles[inst.isActive ? "ACTIVE" : "INACTIVE"];
                  return (
                    <tr key={inst.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#F4ECF8]">
                            <GraduationCap className="h-4 w-4 text-[#683290]" strokeWidth={2} />
                          </div>
                          <span className="text-[14px] font-medium text-[#1A1A2E]">{inst.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7280]">{inst.slug}</td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7280]">{inst.plan}</td>
                      <td className="px-6 py-4 text-[14px] font-medium tabular-nums text-[#1A1A2E]">
                        {(inst._count?.users ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium tabular-nums text-[#1A1A2E]">
                        {(inst._count?.courses ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {inst.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
