"use client";

import { GraduationCap } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { createManualAlumniAction } from "./actions";
import { AlumniImportForm } from "./AlumniImportForm";

interface AlumniRow {
  id: string;
  fullName: string;
  email: string | null;
  courseName: string;
  completionDate: string | null;
  score: number | null;
  claimed: boolean;
  cohort: { id: string; name: string } | null;
}

export default function AdminAlumniPage() {
  const { data, loading, refetch } = useApi<{ records: AlumniRow[] }>("/alumni?pageSize=100", { records: [] });
  const records = data.records;

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await createManualAlumniAction(new FormData(form));
    form.reset();
    refetch();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Alumni database</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Offline training records — import via CSV or add manually. Each record gets a certificate generated
        automatically and an email invite to claim their profile.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <AlumniImportForm onImported={refetch} />

        <form onSubmit={handleAdd} className="space-y-3 rounded-card border border-dashed border-border p-4">
          <p className="text-[13px] font-medium text-text-secondary">Add a single record</p>
          <input
            name="fullName"
            required
            placeholder="Full name"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <input
              name="phone"
              placeholder="Phone"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
          <input
            name="courseName"
            required
            placeholder="Course name"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              name="completionDate"
              type="date"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <input
              name="score"
              type="number"
              placeholder="Score"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <input
              name="cohortLabel"
              placeholder="Cohort"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
          <button
            type="submit"
            className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
          >
            Add record
          </button>
        </form>
      </div>

      <div className="mt-8">
        {loading ? (
          <TableSkeleton />
        ) : records.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No alumni records yet" description="Import a CSV or add a record manually above." />
        ) : (
          <div className="overflow-hidden rounded-card border border-border">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-surface text-[13px] text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Cohort</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{r.fullName}</p>
                      <p className="text-[13px] text-text-secondary">{r.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{r.courseName}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.cohort?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.score ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-pill px-2 py-1 text-[13px] ${
                          r.claimed ? "bg-success-light text-success" : "bg-surface text-text-secondary"
                        }`}
                      >
                        {r.claimed ? "Claimed" : "Unclaimed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
