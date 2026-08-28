"use client";

import { Download } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";

interface AttemptRow {
  id: string;
  userId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
  user: { id: string; name: string | null; email: string };
}

function toCsv(rows: AttemptRow[]) {
  const headers = ["name", "email", "score", "passed", "attemptedAt"];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.user.name ?? "", r.user.email, r.score, r.passed, r.attemptedAt].map(escape).join(",")
    ),
  ];
  return lines.join("\n");
}

export function ResultsTable({ assessmentId }: { assessmentId: string }) {
  const { data: results, loading } = useApi<AttemptRow[]>(`/assessments/${assessmentId}/results`, []);

  function handleExport() {
    const blob = new Blob([toCsv(results)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assessment-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-text-primary">Results ({results.length})</p>
        {results.length > 0 && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-surface transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={ClipboardList} title="No attempts yet" description="Results will appear here once learners complete this assessment." />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Learner</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Attempted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{r.user.name ?? r.user.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.score}%</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2 py-1 text-[13px] ${r.passed ? "bg-success-light text-success" : "bg-red-light text-red"}`}>
                      {r.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(r.attemptedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
