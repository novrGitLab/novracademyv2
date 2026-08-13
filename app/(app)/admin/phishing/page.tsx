"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi, apiMutate } from "@/lib/useApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import type { Campaign } from "@/types/campaigns";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MousePointerClick,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Status config                                                              */
/* -------------------------------------------------------------------------- */

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  completed: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  draft: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
  archived: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]" },
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PhishingCampaignsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: campaigns, loading, refetch } = useApi<Campaign[]>(
    "/campaigns",
    []
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || c.status.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    totalClicked: campaigns.reduce((sum, c) => sum + (c.results?.clicked ?? 0), 0),
  };

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiMutate(`/campaigns/${deleteId}`, "DELETE");
      setToast({ message: "Campaign deleted successfully", type: "success" });
      refetch();
    } catch {
      setToast({ message: "Failed to delete campaign", type: "error" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function clickRate(c: Campaign) {
    const sent = c.results?.sent ?? c._count?.campaignResults ?? 0;
    const clicked = c.results?.clicked ?? 0;
    if (sent === 0) return "0%";
    return `${Math.round((clicked / sent) * 100)}%`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Phishing Campaigns
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Manage and monitor phishing awareness campaigns.
          </p>
        </div>
        <Link
          href="/admin/phishing/new"
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
        >
          <Plus className="h-3.5 w-3.5" />
          Launch Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#683290]" />
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Total Campaigns
            </p>
          </div>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#1A1A2E]">{stats.total}</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Active</p>
          </div>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{stats.active}</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#2563EB]" />
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Completed</p>
          </div>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#2563EB]">{stats.completed}</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-[#EA580C]" />
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Total Clicks</p>
          </div>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#EA580C]">{stats.totalClicked}</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "COMPLETED", "DRAFT"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                filter === f
                  ? "bg-[#683290] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Campaign
                </th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Status
                </th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Launched
                </th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Recipients
                </th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    Loading campaigns...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ShieldCheck className="mx-auto h-10 w-10 text-[#E5E7EB]" />
                    <p className="mt-3 text-[14px] font-medium text-[#6B7280]">No campaigns found</p>
                    <p className="mt-1 text-[13px] text-[#9CA3AF]">
                      {campaigns.length === 0
                        ? "Launch your first phishing campaign to get started."
                        : "Try adjusting your search or filters."}
                    </p>
                    {campaigns.length === 0 && (
                      <Link
                        href="/admin/phishing/new"
                        className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Launch Campaign
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const s = statusConfig[c.status] ?? statusConfig.draft;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/phishing/${c.id}`}
                          className="text-[14px] font-medium text-[#1A1A2E] hover:text-[#683290]"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280]">
                        {formatDate(c.launchedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[14px] tabular-nums text-[#1A1A2E]">
                          <Users className="h-3.5 w-3.5 text-[#6B7280]" />
                          {c.results?.total ?? c._count?.campaignResults ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium tabular-nums text-[#1A1A2E]">
                          {clickRate(c)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/phishing/${c.id}`}
                            className="rounded-[6px] p-1.5 text-[#6B7280] transition hover:bg-[#F4ECF8] hover:text-[#683290]"
                            title="View results"
                          >
                            <Eye className="h-4 w-4" strokeWidth={2} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(c.id)}
                            className="rounded-[6px] p-1.5 text-[#6B7280] transition hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                            title="Delete campaign"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
