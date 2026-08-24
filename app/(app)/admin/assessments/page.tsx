import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

interface AssessmentRow {
  id: string;
  title: string;
  type: "BASELINE" | "MONTHLY" | "CLOSING";
  scope: "UNIVERSAL" | "ORGANIZATION";
  month: number | null;
  year: number | null;
  isActive: boolean;
  createdAt: string;
  _count: { questions: number; attempts: number };
}

const TABS = [
  { key: "BASELINE", label: "Baseline" },
  { key: "MONTHLY", label: "Monthly" },
  { key: "CLOSING", label: "Closing" },
] as const;

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const assessments = await apiFetchSafe<AssessmentRow[]>("/assessments", []);
  const activeTab = (searchParams.tab as (typeof TABS)[number]["key"]) ?? "BASELINE";

  // The BASELINE Assessment record also serves as the "closing" pass — a
  // baseline assessment with at least one attempt shows up under the
  // Closing tab too (see services/assessmentService.ts).
  const filtered = assessments.filter((a) => (activeTab === "CLOSING" ? a.type === "BASELINE" : a.type === activeTab));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Assessments</h1>
          <p className="mt-1 text-[15px] text-text-secondary">Baseline, monthly, and closing assessments.</p>
        </div>
        <Link
          href="/admin/assessments/new"
          className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New assessment
        </Link>
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/assessments?tab=${tab.key}`}
            className={`px-4 py-2 text-[14px] font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue text-blue"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ClipboardCheck} title="Nothing here yet" description="Create an assessment to get started." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Attempts</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/admin/assessments/${a.id}`} className="text-text-primary hover:text-blue font-medium">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{a.scope}</td>
                  <td className="px-4 py-3 text-text-secondary">{a.month && a.year ? `${a.month}/${a.year}` : "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{a._count.questions}</td>
                  <td className="px-4 py-3 text-text-secondary">{a._count.attempts}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-pill px-2 py-1 text-[13px] ${
                        a.isActive ? "bg-success-light text-success" : "bg-surface text-text-secondary"
                      }`}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
