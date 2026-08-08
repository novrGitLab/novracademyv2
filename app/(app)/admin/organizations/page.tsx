"use client";

import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/useApi";

/* -------------------------------------------------------------------------- */
/*  NOTE: This page requires a dedicated Tenant Management API that does not    */
/*  exist yet. Currently using placeholder data. When the API is built,        */
/*  replace the organizations array with: useApi("/tenants?type=ORG", ...)     */
/* -------------------------------------------------------------------------- */

interface Organization {
  id: string;
  name: string;
  plan: string;
  activeUsers: number;
  compliance: number;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
}

// TODO: Replace with API call when tenant management endpoints are built
// const { data, loading } = useApi<{ tenants: Organization[] }>("/tenants?type=ORG", { tenants: [] });

const organizations: Organization[] = [
  { id: "1", name: "Dangote Group", plan: "Enterprise", activeUsers: 2450, compliance: 92, status: "ACTIVE" },
  { id: "2", name: "Airtel Nigeria", plan: "Enterprise Plus", activeUsers: 1890, compliance: 45, status: "ACTIVE" },
  { id: "3", name: "GTBank", plan: "Enterprise", activeUsers: 3200, compliance: 88, status: "ACTIVE" },
  { id: "4", name: "Flutterwave", plan: "Starter", activeUsers: 420, compliance: 76, status: "TRIAL" },
  { id: "5", name: "Interswitch", plan: "Enterprise", activeUsers: 1560, compliance: 91, status: "ACTIVE" },
];

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  TRIAL: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]" },
  SUSPENDED: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
};

function ComplianceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#16A34A" : value >= 50 ? "#EA580C" : "#DC2626";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F1F3F5]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-medium tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Organizations
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Manage organization tenants and their subscriptions.
          </p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Organization
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search organizations..."
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
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Type</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Plan</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Active Users</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => {
                const s = statusStyles[org.status];
                return (
                  <tr key={org.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                    <td className="px-6 py-4">
                      <Link href={`/admin/organizations/${org.id}`} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#F4ECF8]">
                          <Building2 className="h-4 w-4 text-[#683290]" strokeWidth={2} />
                        </div>
                        <span className="text-[14px] font-medium text-[#1A1A2E] hover:text-[#683290]">{org.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#F4ECF8] px-2.5 py-1 text-[11px] font-semibold text-[#683290]">
                        ORG
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#6B7280]">{org.plan}</td>
                    <td className="px-6 py-4 text-[14px] font-medium tabular-nums text-[#1A1A2E]">{org.activeUsers.toLocaleString()}</td>
                    <td className="px-6 py-4"><ComplianceBar value={org.compliance} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {org.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
