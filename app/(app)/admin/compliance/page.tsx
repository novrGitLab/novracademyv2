"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ComplianceRecord {
  id: string;
  employeeName: string;
  department: string;
  requiredCourses: number;
  completedCourses: number;
  lastCompleted: string;
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  dueDate: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                                */
/* -------------------------------------------------------------------------- */

const complianceData: ComplianceRecord[] = [
  { id: "1", employeeName: "Sarah Jenkins", department: "Engineering", requiredCourses: 5, completedCourses: 5, lastCompleted: "2026-07-28", status: "COMPLIANT", dueDate: "2026-09-30" },
  { id: "2", employeeName: "Marcus Chen", department: "Sales", requiredCourses: 5, completedCourses: 2, lastCompleted: "2026-06-15", status: "PARTIAL", dueDate: "2026-09-30" },
  { id: "3", employeeName: "Elena Rostova", department: "HR", requiredCourses: 5, completedCourses: 4, lastCompleted: "2026-08-01", status: "PARTIAL", dueDate: "2026-09-30" },
  { id: "4", employeeName: "Amina Yusuf", department: "Marketing", requiredCourses: 5, completedCourses: 1, lastCompleted: "2026-05-20", status: "NON_COMPLIANT", dueDate: "2026-09-30" },
  { id: "5", employeeName: "Tunde Bakare", department: "Operations", requiredCourses: 5, completedCourses: 0, lastCompleted: "—", status: "NON_COMPLIANT", dueDate: "2026-09-30" },
  { id: "6", employeeName: "Fatima Bello", department: "Finance", requiredCourses: 5, completedCourses: 5, lastCompleted: "2026-08-05", status: "COMPLIANT", dueDate: "2026-09-30" },
  { id: "7", employeeName: "Chidi Eze", department: "Engineering", requiredCourses: 5, completedCourses: 3, lastCompleted: "2026-07-10", status: "PARTIAL", dueDate: "2026-09-30" },
  { id: "8", employeeName: "Ngozi Okafor", department: "Legal", requiredCourses: 5, completedCourses: 5, lastCompleted: "2026-08-03", status: "COMPLIANT", dueDate: "2026-09-30" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  COMPLIANT: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]", icon: CheckCircle2 },
  PARTIAL: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]", icon: Clock },
  NON_COMPLIANT: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]", icon: AlertTriangle },
};

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

  const filtered = complianceData.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: complianceData.length,
    compliant: complianceData.filter((r) => r.status === "COMPLIANT").length,
    partial: complianceData.filter((r) => r.status === "PARTIAL").length,
    nonCompliant: complianceData.filter((r) => r.status === "NON_COMPLIANT").length,
  };

  const complianceRate = Math.round((stats.compliant / stats.total) * 100);

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
          <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{complianceRate}%</p>
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
          <span className="text-[14px] font-bold text-[#16A34A]">{complianceRate}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F1F3F5]">
          <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{ width: `${complianceRate}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-[#6B7280]">
          {stats.compliant} of {stats.total} employees fully compliant. Deadline: September 30, 2026.
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
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Department</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Progress</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last Completed</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Due Date</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const s = statusConfig[r.status];
                const progress = Math.round((r.completedCourses / r.requiredCourses) * 100);
                return (
                  <tr key={r.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{r.employeeName}</td>
                    <td className="px-6 py-4 text-[14px] text-[#6B7280]">{r.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F1F3F5]">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: progress >= 80 ? "#16A34A" : progress >= 50 ? "#EA580C" : "#DC2626" }} />
                        </div>
                        <span className="text-[12px] tabular-nums text-[#6B7280]">{r.completedCourses}/{r.requiredCourses}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">{r.lastCompleted}</td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">{r.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {r.status === "NON_COMPLIANT" ? "Non-Compliant" : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    No records match your search.
                  </td>
                </tr>
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
            <select className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="PARTIAL">In Progress Only</option>
              <option value="NON_COMPLIANT">Non-Compliant Only</option>
            </select>
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setShowExport(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={() => { setToast({ message: `Report exported as ${exportFormat.toUpperCase()}`, type: "success" }); setShowExport(false); }} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]"><Download className="inline h-3.5 w-3.5 mr-1" /> Export</button>
        </Modal.Footer>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
