"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import {
  bulkAssignCohortAction,
  bulkAwardBadgeAction,
  bulkAwardXpAction,
  bulkSetStatusAction,
} from "./actions";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  memberType: string;
  status: string;
  xp: number;
  reputationLevel: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function UserBulkTable({
  users,
  cohorts,
  badges,
}: {
  users: UserRow[];
  cohorts: { id: string; name: string }[];
  badges: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === users.length ? new Set() : new Set(users.map((u) => u.id))));
  }

  async function runAction(fn: () => Promise<void>) {
    setPending(true);
    await fn();
    setSelected(new Set());
    setPending(false);
    router.refresh();
  }

  const ids = Array.from(selected);

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card border border-[#683290] bg-[#F4ECF8] px-4 py-3">
          <span className="text-[13px] font-medium text-[#683290]">{selected.size} selected</span>
          <button
            disabled={pending}
            onClick={() => runAction(() => bulkSetStatusAction(ids, "SUSPENDED"))}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary hover:bg-surface disabled:opacity-50"
          >
            Suspend
          </button>
          <button
            disabled={pending}
            onClick={() => runAction(() => bulkSetStatusAction(ids, "ACTIVE"))}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary hover:bg-surface disabled:opacity-50"
          >
            Reactivate
          </button>
          {cohorts.length > 0 && (
            <select
              disabled={pending}
              defaultValue=""
              onChange={(e) => e.target.value && runAction(() => bulkAssignCohortAction(ids, e.target.value))}
              className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary disabled:opacity-50"
            >
              <option value="" disabled>
                Assign cohort…
              </option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            disabled={pending}
            onClick={() => {
              const amount = Number(prompt("XP to award:", "10"));
              if (amount) runAction(() => bulkAwardXpAction(ids, amount));
            }}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary hover:bg-surface disabled:opacity-50"
          >
            Award XP
          </button>
          {badges.length > 0 && (
            <select
              disabled={pending}
              defaultValue=""
              onChange={(e) => e.target.value && runAction(() => bulkAwardBadgeAction(ids, e.target.value))}
              className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary disabled:opacity-50"
            >
              <option value="" disabled>
                Award badge…
              </option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <a
            href={`${API_URL}/bulk/export-users?userIds=${ids.join(",")}`}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary hover:bg-surface"
          >
            Export CSV
          </a>
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-surface text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">XP</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{u.name ?? u.email}</p>
                  <p className="text-[13px] text-text-secondary">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{u.role}</td>
                <td className="px-4 py-3 text-text-secondary">{u.memberType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-pill px-2 py-1 text-[13px] ${
                      u.status === "ACTIVE" ? "bg-success-light text-success" : "bg-red-light text-red"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {u.xp} · {u.reputationLevel}
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
