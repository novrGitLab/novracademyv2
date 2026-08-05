"use client";

import { Layers } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { createCohortAction, deleteCohortAction } from "./actions";

interface CohortRow {
  id: string;
  name: string;
  year: number | null;
  description: string | null;
  _count: { members: number; alumniRecords: number };
}

export default function AdminCohortsPage() {
  const { data, loading, refetch } = useApi<{ cohorts: CohortRow[] }>("/cohorts", { cohorts: [] });
  const cohorts = data.cohorts;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await createCohortAction(new FormData(form));
    form.reset();
    refetch();
  }

  async function handleDelete(id: string) {
    await deleteCohortAction(id);
    refetch();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Cohorts</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Batches/intakes used to group learners and alumni (e.g. "2019 Intake").
      </p>

      <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-card border border-dashed border-border p-4">
        <p className="text-[13px] font-medium text-text-secondary">Create a cohort</p>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="name"
            required
            placeholder="Name (e.g. 2019 Intake)"
            className="col-span-2 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
          <input
            name="year"
            type="number"
            placeholder="Year"
            className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
        </div>
        <input
          name="description"
          placeholder="Description (optional)"
          className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
        <button
          type="submit"
          className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
        >
          Create cohort
        </button>
      </form>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : cohorts.length === 0 ? (
          <EmptyState icon={Layers} title="No cohorts yet" description="Create a cohort above to group learners and alumni by intake." />
        ) : (
          <div className="overflow-hidden rounded-card border border-border">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-surface text-[13px] text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Members</th>
                  <th className="px-4 py-3 font-medium">Alumni records</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.year ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{c._count.members}</td>
                    <td className="px-4 py-3 text-text-secondary">{c._count.alumniRecords}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-[13px] text-red hover:underline">
                        Delete
                      </button>
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
