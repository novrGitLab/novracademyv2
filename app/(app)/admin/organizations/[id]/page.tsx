"use client";

import { useApi } from "@/lib/useApi";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Building2, Users, BookOpen, ShieldCheck } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl: string | null;
  createdAt: string;
  _count: { users: number };
}

interface OrgStats {
  userCount: number;
  courseCount: number;
  enrollmentCount: number;
  complianceSetting: { deadline: string | null; threshold: number } | null;
}

interface ComplianceStats {
  rate: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  total: number;
}

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: org, loading: orgLoading } = useApi<Organization>(`/organizations/${id}`, {} as Organization);
  const { data: stats, loading: statsLoading } = useApi<OrgStats>(`/organizations/${id}/stats`, {} as OrgStats);
  const { data: complianceStats } = useApi<ComplianceStats>("/compliance/stats", { rate: 0, compliant: 0, partial: 0, nonCompliant: 0, total: 0 });

  if (orgLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-[8px] bg-[#F1F3F5]" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[8px] bg-[#F1F3F5]" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-[#9CA3AF]">Organization not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">{org.name}</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Organization details and management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#F4ECF8] text-[#683290]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Users</p>
              <p className="text-[20px] font-bold tabular-nums text-[#1A1A2E]">{stats?.userCount ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#F4ECF8] text-[#683290]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Courses</p>
              <p className="text-[20px] font-bold tabular-nums text-[#1A1A2E]">{stats?.courseCount ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#F0FDF4] text-[#16A34A]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance</p>
              <p className="text-[20px] font-bold tabular-nums text-[#16A34A]">{complianceStats.rate}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#FFF7ED] text-[#EA580C]">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Plan</p>
              <p className="text-[14px] font-semibold text-[#1A1A2E] capitalize">{org.plan}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Organization Info</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="text-[13px] text-[#6B7280]">Name</span>
                <span className="text-[13px] font-medium text-[#1A1A2E]">{org.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="text-[13px] text-[#6B7280]">Slug</span>
                <span className="text-[13px] font-medium text-[#1A1A2E]">{org.slug}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <span className="text-[13px] text-[#6B7280]">Plan</span>
                <span className="text-[13px] font-medium text-[#1A1A2E] capitalize">{org.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6B7280]">Created</span>
                <span className="text-[13px] font-medium text-[#1A1A2E]">{new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance Summary</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#1A1A2E]">Compliant</span>
                <span className="text-[13px] font-semibold text-[#16A34A]">{complianceStats.compliant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#1A1A2E]">In Progress</span>
                <span className="text-[13px] font-semibold text-[#EA580C]">{complianceStats.partial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#1A1A2E]">Non-Compliant</span>
                <span className="text-[13px] font-semibold text-[#DC2626]">{complianceStats.nonCompliant}</span>
              </div>
              {stats?.complianceSetting && (
                <div className="border-t border-[#E5E7EB] pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">Threshold</span>
                    <span className="text-[13px] font-medium text-[#1A1A2E]">{stats.complianceSetting.threshold}%</span>
                  </div>
                  {stats.complianceSetting.deadline && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[13px] text-[#6B7280]">Deadline</span>
                      <span className="text-[13px] font-medium text-[#1A1A2E]">{new Date(stats.complianceSetting.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link href="/admin/compliance" className="mt-4 block text-center text-[13px] font-semibold text-[#683290] hover:underline">VIEW COMPLIANCE</Link>
          </div>

          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Quick Actions</h4>
            <div className="mt-4 space-y-2">
              <Link href="/admin/users" className="block rounded-[6px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                Manage Users
              </Link>
              <Link href="/admin/courses" className="block rounded-[6px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                Manage Courses
              </Link>
              <Link href="/admin/compliance" className="block rounded-[6px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                Compliance Settings
              </Link>
              <Link href="/admin/phishing" className="block rounded-[6px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                Phishing Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
