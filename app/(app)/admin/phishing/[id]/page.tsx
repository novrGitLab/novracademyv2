"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import type { Campaign, CampaignResults } from "@/types/campaigns";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Mail,
  MousePointerClick,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function ResultStatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: typeof Mail;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">{label}</p>
      </div>
      <p className={`mt-1 text-[28px] font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Event Timeline                                                             */
/* -------------------------------------------------------------------------- */

interface TimelineEvent {
  id: string;
  email: string;
  name: string;
  eventType: string;
  createdAt: string;
  ip?: string;
}

const eventTypeConfig: Record<string, { icon: typeof Mail; color: string; bg: string; label: string }> = {
  sent: { icon: Mail, color: "text-[#6B7280]", bg: "bg-[#F8F9FB]", label: "Email Sent" },
  opened: { icon: Eye, color: "text-[#2563EB]", bg: "bg-[#EFF6FF]", label: "Email Opened" },
  clicked: { icon: MousePointerClick, color: "text-[#EA580C]", bg: "bg-[#FFF7ED]", label: "Link Clicked" },
  submitted: { icon: ShieldAlert, color: "text-[#DC2626]", bg: "bg-[#FEF2F2]", label: "Data Submitted" },
  reported: { icon: CheckCircle2, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]", label: "Reported Phish" },
};

function EventTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-[14px] text-[#9CA3AF]">No events recorded yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((e) => {
        const cfg = eventTypeConfig[e.eventType] ?? eventTypeConfig.sent;
        const Icon = cfg.icon;
        const time = new Date(e.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div key={e.id} className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#1A1A2E]">{e.name || e.email}</span>
                <span className={`text-[12px] font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                <span>{time}</span>
                {e.ip && <span>IP: {e.ip}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: campaign, loading: campaignLoading } = useApi<Campaign>(
    `/campaigns/${id}`,
    null as any
  );

  const { data: results, loading: resultsLoading, refetch: refetchResults } = useApi<CampaignResults>(
    `/campaigns/${id}/results`,
    { total: 0, sent: 0, opened: 0, clicked: 0, submittedData: 0, reported: 0, clickedDetails: [] }
  );

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function exportCsv() {
    const rows: string[][] = [
      ["Email", "Event", "Timestamp (UTC)", "IP Address"],
      ...(campaign?.campaignResults ?? []).map((r: any) => [
        r.employeeEmail ?? "",
        r.eventType ?? "",
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
        r.metadata?.browser?.address ?? r.metadata?.ip ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(campaign?.name ?? "campaign").replace(/[^a-z0-9-]+/gi, "-")}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Auto-poll results every 15 seconds when campaign is active
  useEffect(() => {
    if (!autoRefresh || campaign?.status !== "active") return;
    const interval = setInterval(refetchResults, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, campaign?.status, refetchResults]);

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[14px] text-[#9CA3AF]">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldCheck className="h-12 w-12 text-[#E5E7EB]" />
        <p className="mt-4 text-[14px] font-medium text-[#6B7280]">Campaign not found</p>
        <Link href="/admin/phishing" className="mt-3 text-[13px] font-semibold text-[#683290] hover:underline">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const clickRate = results.sent > 0 ? Math.round((results.clicked / results.sent) * 100) : 0;
  const openRate = results.sent > 0 ? Math.round((results.opened / results.sent) * 100) : 0;

  const statusStyle = {
    active: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
    completed: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
    draft: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
    archived: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]" },
  }[campaign.status] ?? { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" };

  const timelineEvents: TimelineEvent[] = (campaign.campaignResults ?? []).map((r: any) => ({
    id: r.id,
    email: r.employeeEmail,
    name: r.metadata?.firstName
      ? `${r.metadata.firstName} ${r.metadata.lastName ?? ""}`.trim()
      : r.employeeEmail,
    eventType: r.eventType,
    createdAt: r.createdAt,
    ip: r.metadata?.ip,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="mt-1 rounded-[8px] p-2 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">{campaign.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Launched {campaign.launchedAt ? new Date(campaign.launchedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not yet launched"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            Export CSV
          </button>
          {campaign.status === "active" && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-[13px] font-medium transition ${
                autoRefresh
                  ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                  : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "animate-spin" : ""}`} strokeWidth={2} />
              {autoRefresh ? "Auto-refreshing" : "Auto-refresh"}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <ResultStatCard label="Total" value={results.total} icon={Mail} color="text-[#1A1A2E]" />
        <ResultStatCard label="Sent" value={results.sent} icon={Mail} color="text-[#6B7280]" />
        <ResultStatCard label="Opened" value={results.opened} icon={Eye} color="text-[#2563EB]" sub={`${openRate}% open rate`} />
        <ResultStatCard label="Clicked" value={results.clicked} icon={MousePointerClick} color="text-[#EA580C]" sub={`${clickRate}% click rate`} />
        <ResultStatCard label="Submitted" value={results.submittedData} icon={ShieldAlert} color="text-[#DC2626]" />
        <ResultStatCard label="Reported" value={results.reported} icon={CheckCircle2} color="text-[#16A34A]" />
      </div>

      {/* Landing Page Preview */}
      {campaign.landingPageHtml && (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Landing Page Preview</h3>
            <button
              onClick={() => setShowLandingPage(!showLandingPage)}
              className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={2} />
              {showLandingPage ? "Hide" : "Show Preview"}
            </button>
          </div>
          {showLandingPage && (
            <div className="border-t border-[#E5E7EB] p-6">
              <iframe
                srcDoc={campaign.landingPageHtml}
                title={`${campaign.name} landing page`}
                sandbox="allow-forms allow-scripts"
                className="h-[420px] w-full rounded-[8px] border border-[#E5E7EB] bg-white"
              />
            </div>
          )}
        </div>
      )}

      {/* Click Rate Visual */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Click Rate Breakdown</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Opened", value: results.opened, total: results.sent, color: "#2563EB" },
            { label: "Clicked", value: results.clicked, total: results.sent, color: "#EA580C" },
            { label: "Submitted Data", value: results.submittedData, total: results.sent, color: "#DC2626" },
            { label: "Reported", value: results.reported, total: results.sent, color: "#16A34A" },
          ].map((item) => {
            const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1A1A2E]">{item.label}</span>
                  <span className="text-[13px] font-medium tabular-nums" style={{ color: item.color }}>
                    {item.value} ({pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F1F3F5]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
        {/* Clicked Details Table */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Clicked Details</h3>
            <span className="text-[13px] text-[#6B7280]">{results.clickedDetails.length} user{results.clickedDetails.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Employee</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Email</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Clicked At</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {results.clickedDetails.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                      No clicks recorded yet.
                    </td>
                  </tr>
                ) : (
                  results.clickedDetails.map((d, i) => (
                    <tr key={i} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">
                        {d.firstName} {d.lastName}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280]">{d.email}</td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280]">
                        {new Date(d.clickedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-mono text-[#6B7280]">{d.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Event Timeline</h3>
            <button
              onClick={() => refetchResults()}
              className="rounded-[6px] p-1.5 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            <EventTimeline events={timelineEvents} />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
