"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@novr/types";
import { useApi, apiMutate } from "@/lib/useApi";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import type {
  CompliancePolicy,
  CompliancePolicyStatus,
  CreateCompliancePolicyPayload,
} from "@/types/tenants";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CourseOption {
  id: string;
  title: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  COMPLIANT: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]", icon: CheckCircle2 },
  PARTIAL: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#EA580C]", icon: Clock },
  NON_COMPLIANT: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]", icon: AlertTriangle },
};

const ROLE_OPTIONS = Object.values(UserRole);

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CompliancePage() {
  const { data: policies, loading: policiesLoading, refetch: refetchPolicies } = useApi<CompliancePolicy[]>(
    "/compliance/policies",
    []
  );
  const { data: coursesResult } = useApi<{ courses: CourseOption[] }>("/courses?pageSize=100", { courses: [] });

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  useEffect(() => {
    if (!selectedPolicyId && policies.length > 0) setSelectedPolicyId(policies[0].id);
  }, [policies, selectedPolicyId]);

  const { data: status, loading: statusLoading, refetch: refetchStatus } = useApi<CompliancePolicyStatus | null>(
    selectedPolicyId ? `/compliance/policies/${selectedPolicyId}/status` : "/compliance/policies/none/status",
    null
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const rows = status?.rows ?? [];
  const filtered = rows.filter((r) => {
    const matchesSearch =
      (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  function exportCsv() {
    if (!status) return;
    const header = "Employee,Email,Role,Progress %,Completed At,Status\n";
    const body = status.rows
      .map((r) => [r.name ?? "", r.email, r.role, r.progressPct, r.completedAt ?? "", r.status].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${status.policy.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Report exported as CSV", type: "success" });
  }

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
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={!status}
            className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            Export Report
          </button>
          <button
            onClick={() => setShowNewPolicy(true)}
            className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            New Policy
          </button>
        </div>
      </div>

      {/* Policy selector */}
      {policies.length > 0 && (
        <div className="flex items-center gap-2">
          {policies.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPolicyId(p.id)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                selectedPolicyId === p.id
                  ? "bg-[#683290] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {!policiesLoading && policies.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#E5E7EB]" />
          <p className="mt-3 text-[14px] font-medium text-[#6B7280]">No compliance policies yet</p>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Create a policy to require a role to complete a course by a deadline.
          </p>
          <button
            onClick={() => setShowNewPolicy(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Policy
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance Rate</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{status?.summary.compliancePct ?? 0}%</p>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliant</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums text-[#16A34A]">{status?.summary.compliant ?? 0}</p>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">In Progress</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums text-[#EA580C]">{status?.summary.partial ?? 0}</p>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Non-Compliant</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums text-[#DC2626]">{status?.summary.nonCompliant ?? 0}</p>
            </div>
          </div>

          {/* Compliance progress bar */}
          {status && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[#1A1A2E]">
                  {status.policy.name} — {status.policy.course.title}
                </h3>
                <span className="text-[14px] font-bold text-[#16A34A]">{status.summary.compliancePct}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F1F3F5]">
                <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{ width: `${status.summary.compliancePct}%` }} />
              </div>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                {status.summary.compliant} of {status.summary.total} {status.policy.roleName.toLowerCase().replace(/_/g, " ")}s compliant.
                {status.policy.deadline && ` Deadline: ${new Date(status.policy.deadline).toLocaleDateString()}.`}
              </p>
            </div>
          )}

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
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Role</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Progress</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Completed</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statusLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                        No records match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const s = statusConfig[r.status];
                      return (
                        <tr key={r.userId} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-medium text-[#1A1A2E]">{r.name ?? r.email}</div>
                            <div className="text-[12px] text-[#9CA3AF]">{r.email}</div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#6B7280]">{r.role.replace(/_/g, " ")}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F1F3F5]">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${r.progressPct}%`,
                                    backgroundColor: r.progressPct >= 80 ? "#16A34A" : r.progressPct >= 50 ? "#EA580C" : "#DC2626",
                                  }}
                                />
                              </div>
                              <span className="text-[12px] tabular-nums text-[#6B7280]">{r.progressPct}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#6B7280]">
                            {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {r.status === "NON_COMPLIANT" ? "Non-Compliant" : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
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
        </>
      )}

      {/* New Policy Modal */}
      <NewPolicyModal
        open={showNewPolicy}
        onClose={() => setShowNewPolicy(false)}
        courses={coursesResult.courses}
        onCreated={(policy) => {
          setShowNewPolicy(false);
          refetchPolicies();
          setSelectedPolicyId(policy.id);
          setToast({ message: "Compliance policy created", type: "success" });
        }}
        onError={(message) => setToast({ message, type: "error" })}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  New Policy modal                                                          */
/* -------------------------------------------------------------------------- */

function NewPolicyModal({
  open,
  onClose,
  courses,
  onCreated,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  courses: CourseOption[];
  onCreated: (policy: CompliancePolicy) => void;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [roleName, setRoleName] = useState<string>(UserRole.LEARNER);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !courseId) {
      onError("Name and course are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: CreateCompliancePolicyPayload = {
        name: name.trim(),
        courseId,
        roleName,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      };
      const policy = await apiMutate<CompliancePolicy>("/compliance/policies", "POST", payload);
      setName("");
      setCourseId("");
      setDeadline("");
      onCreated(policy);
    } catch (err) {
      onError((err as Error).message || "Failed to create policy");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Compliance Policy" description="Require a role to complete a course by a deadline.">
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">POLICY NAME</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual Security Awareness Training"
            className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">REQUIRED COURSE</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          >
            <option value="">Select a course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">APPLIES TO ROLE</label>
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">DEADLINE</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
        </div>
      </div>
      <Modal.Footer>
        <button onClick={onClose} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Policy"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
