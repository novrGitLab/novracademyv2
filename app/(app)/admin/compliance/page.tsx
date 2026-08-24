"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi, apiMutate } from "@/lib/useApi";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Search,
  ShieldAlert,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ComplianceRecord {
  userId: string;
  name: string | null;
  email: string;
  totalRequired: number;
  completed: number;
  progressPct: number;
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  lastCompletedAt: string | null;
  dueDate: string | null;
  phishingClicked: boolean;
  campaignCount: number;
}

interface ComplianceStats {
  rate: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  total: number;
}

interface ComplianceSettings {
  organizationId: string;
  deadline: string | null;
  threshold: number;
  autoSuspend: boolean;
}

interface CourseItem {
  courseId: string;
  courseTitle: string;
  status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
  progressPct: number;
  completedAt: string | null;
  isMandatory: boolean;
}

interface PhishingItem {
  campaignId: string;
  campaignName: string;
  eventType: string;
  occurredAt: string | null;
}

interface UserComplianceDetail {
  userId: string;
  name: string | null;
  email: string;
  overallStatus: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  courseBreakdown: CourseItem[];
  phishingBreakdown: PhishingItem[];
}

/* -------------------------------------------------------------------------- */
/*  Expandable Row                                                             */
/* -------------------------------------------------------------------------- */

function ExpandableRow({ userId, colSpan }: { userId: string; colSpan: number }) {
  const { data: detail, loading } = useApi<UserComplianceDetail | null>(
    userId ? `/compliance/records/${userId}` : "",
    null,
  );

  const statusColors = {
    COMPLETED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", icon: CheckCircle2 },
    IN_PROGRESS: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", icon: Clock },
    NOT_STARTED: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", icon: AlertTriangle },
  };

  const phishingColors: Record<string, { bg: string; text: string }> = {
    clicked: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
    sent: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
    opened: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]" },
    submitted: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
  };

  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-0 bg-[#F8F9FB]/50">
        {loading ? (
          <div className="py-6 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#F1F3F5] border-t-[#683290]" />
          </div>
        ) : !detail ? (
          <p className="py-6 text-center text-[13px] text-[#9CA3AF]">No data found.</p>
        ) : (
          <div className="space-y-4 py-4 pl-4">
            {/* Courses */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-[#683290]" />
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Courses ({detail.courseBreakdown.length})
                </h4>
              </div>
              {detail.courseBreakdown.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF] pl-5">No courses assigned.</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.courseBreakdown.map((c) => {
                    const sc = statusColors[c.status];
                    const Icon = sc.icon;
                    return (
                      <div key={c.courseId} className="flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${sc.text}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-medium text-[#1A1A2E] truncate">{c.courseTitle}</p>
                              {c.isMandatory && (
                                <span className="shrink-0 rounded bg-[#F4ECF8] px-1.5 py-0.5 text-[10px] font-semibold text-[#683290]">Required</span>
                              )}
                            </div>
                            <p className="text-[12px] text-[#6B7280]">
                              {c.status === "COMPLETED" ? `Completed ${new Date(c.completedAt!).toLocaleDateString()}` : `${c.progressPct}% progress`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.status !== "NOT_STARTED" && (
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1F3F5]">
                              <div className="h-full rounded-full" style={{ width: `${c.progressPct}%`, backgroundColor: c.progressPct >= 80 ? "#16A34A" : c.progressPct >= 50 ? "#EA580C" : "#DC2626" }} />
                            </div>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                            {c.status === "NOT_STARTED" ? "Not Started" : c.status === "IN_PROGRESS" ? "In Progress" : "Done"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Phishing */}
            {detail.phishingBreakdown.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#683290]" />
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Phishing Results ({detail.phishingBreakdown.length})
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {detail.phishingBreakdown.map((p, i) => {
                    const pc = phishingColors[p.eventType] ?? { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]" };
                    return (
                      <div key={i} className="flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1A1A2E] truncate">{p.campaignName}</p>
                          <p className="text-[12px] text-[#6B7280]">
                            {p.occurredAt ? new Date(p.occurredAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pc.bg} ${pc.text}`}>
                          {p.eventType.charAt(0).toUpperCase() + p.eventType.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CompliancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data: statsData, loading: statsLoading } = useApi<ComplianceStats>("/compliance/stats", { rate: 0, compliant: 0, partial: 0, nonCompliant: 0, total: 0 });
  const { data: recordsData, loading: recordsLoading } = useApi<{ records: ComplianceRecord[]; total: number }>("/compliance/records", { records: [], total: 0 });
  const { data: settings } = useApi<ComplianceSettings>("/compliance/settings", { organizationId: "", deadline: null, threshold: 80, autoSuspend: false });

  const records = recordsData?.records ?? [];
  const stats = statsData ?? { rate: 0, compliant: 0, partial: 0, nonCompliant: 0, total: 0 };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/proxy/compliance/export?format=${exportFormat}${filter !== "ALL" ? `&status=${filter}` : ""}`, {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `compliance-report.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setToast({ message: "Report exported successfully", type: "success" });
      } else {
        setToast({ message: "Failed to export report", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to export report", type: "error" });
    }
    setShowExport(false);
  };

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    COMPLIANT: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
    PARTIAL: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]" },
    NON_COMPLIANT: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Compliance</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Track employee compliance with mandatory training requirements.
          </p>
        </div>
        <button onClick={() => setShowExport(true)} className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance Rate</p>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{stats.rate}%</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliant</p>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{stats.compliant}</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">In Progress</p>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#EA580C]">{stats.partial}</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Non-Compliant</p>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#DC2626]">{stats.nonCompliant}</p>
        </div>
      </div>

      {/* Compliance progress bar */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Overall Compliance Progress</h3>
          <span className="text-[14px] font-bold text-[#16A34A]">{stats.rate}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F1F3F5]">
          <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{ width: `${stats.rate}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-[#6B7280]">
          {stats.compliant} of {stats.total} employees fully compliant. Threshold: {settings?.threshold ?? 80}%.
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {["ALL", "COMPLIANT", "PARTIAL", "NON_COMPLIANT"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                filter === f
                  ? "bg-[#683290] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {f === "ALL" ? "All" : f === "NON_COMPLIANT" ? "Non-Compliant" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Employee</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Email</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Progress</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Phishing</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last Completed</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recordsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    No compliance records found. Assign mandatory courses to get started.
                  </td>
                </tr>
              ) : (
                records
                  .filter((r) => {
                    const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase());
                    const matchesFilter = filter === "ALL" || r.status === filter;
                    return matchesSearch && matchesFilter;
                  })
                  .flatMap((r) => {
                    const s = statusConfig[r.status];
                    const isExpanded = expandedUser === r.userId;
                    const rows: React.ReactNode[] = [];

                    rows.push(
                      <tr key={r.userId} className={`border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB] ${isExpanded ? "bg-[#F8F9FB]/50" : ""}`}>
                        <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{r.name ?? r.email}</td>
                        <td className="px-6 py-4 text-[13px] text-[#6B7280]">{r.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F1F3F5]">
                              <div className="h-full rounded-full" style={{ width: `${r.progressPct}%`, backgroundColor: r.progressPct >= 80 ? "#16A34A" : r.progressPct >= 50 ? "#EA580C" : "#DC2626" }} />
                            </div>
                            <span className="text-[12px] tabular-nums text-[#6B7280]">{r.completed}/{r.totalRequired}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {r.campaignCount > 0 ? (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.phishingClicked ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#16A34A]"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${r.phishingClicked ? "bg-[#DC2626]" : "bg-[#16A34A]"}`} />
                              {r.phishingClicked ? "Clicked" : "Passed"}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#9CA3AF]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#6B7280]">{r.lastCompletedAt ? new Date(r.lastCompletedAt).toLocaleDateString() : "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {r.status === "NON_COMPLIANT" ? "Non-Compliant" : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedUser(isExpanded ? null : r.userId)}
                            className="flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:border-[#683290]/30 hover:bg-[#F4ECF8]/30 hover:text-[#683290]"
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {isExpanded ? "Close" : "View"}
                          </button>
                        </td>
                      </tr>
                    );

                    if (isExpanded) {
                      rows.push(
                        <ExpandableRow key={`${r.userId}-detail`} userId={r.userId} colSpan={7} />
                      );
                    }

                    return rows;
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title="Export Compliance Report" description="Choose format and filters for your report.">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FORMAT</label>
            <div className="mt-2 flex gap-3">
              {["csv", "pdf"].map((f) => (
                <button key={f} onClick={() => setExportFormat(f)} className={`rounded-[8px] border px-4 py-2 text-[13px] font-medium transition ${exportFormat === f ? "border-[#683290] bg-[#F4ECF8] text-[#683290]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">STATUS FILTER</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="PARTIAL">In Progress Only</option>
              <option value="NON_COMPLIANT">Non-Compliant Only</option>
            </select>
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setShowExport(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={handleExport} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]"><Download className="inline h-3.5 w-3.5 mr-1" /> Export</button>
        </Modal.Footer>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
