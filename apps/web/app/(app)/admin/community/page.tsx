"use client";

import { Hash } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { createGroupAction, deleteGroupAction, toggleArchiveAction, togglePinAction } from "./actions";

interface GroupRow {
  id: string;
  name: string;
  type: "GENERAL" | "COHORT" | "INTEREST" | "COURSE";
  isArchived: boolean;
  isPinned: boolean;
  _count: { members: number };
}

export default function AdminCommunityPage() {
  const { data, loading, refetch } = useApi<{ groups: GroupRow[] }>("/groups?includeArchived=true", { groups: [] });
  const groups = data.groups;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await createGroupAction(new FormData(form));
    form.reset();
    refetch();
  }

  async function run(action: () => Promise<unknown>) {
    await action();
    refetch();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Community channels</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        General and cohort channels are created automatically. Interest and course channels are created here.
      </p>

      <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-card border border-dashed border-border p-4">
        <p className="text-[13px] font-medium text-text-secondary">Create a channel</p>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="name"
            required
            placeholder="Name (e.g. Leadership)"
            className="col-span-2 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <select
            name="type"
            className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          >
            <option value="INTEREST">Interest</option>
            <option value="COURSE">Course</option>
          </select>
        </div>
        <input
          name="description"
          placeholder="Description (optional)"
          className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
        />
        <button type="submit" className="rounded-card bg-purple px-4 py-2 text-[15px] font-medium text-white hover:bg-purple/90">
          Create channel
        </button>
      </form>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : groups.length === 0 ? (
          <EmptyState icon={Hash} title="No channels yet" description="Create an interest or course channel above to get started." />
        ) : (
          <div className="overflow-hidden rounded-card border border-border">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-surface text-[13px] text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Members</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      # {g.name} {g.isPinned && "📌"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{g.type}</td>
                    <td className="px-4 py-3 text-text-secondary">{g._count.members}</td>
                    <td className="px-4 py-3 text-text-secondary">{g.isArchived ? "Archived" : "Active"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 text-[13px]">
                        <button
                          onClick={() => run(() => togglePinAction(g.id, !g.isPinned))}
                          className="text-blue hover:underline"
                        >
                          {g.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => run(() => toggleArchiveAction(g.id, !g.isArchived))}
                          className="text-text-secondary hover:underline"
                        >
                          {g.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        {g.type !== "GENERAL" && g.type !== "COHORT" && (
                          <button onClick={() => run(() => deleteGroupAction(g.id))} className="text-red hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
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
