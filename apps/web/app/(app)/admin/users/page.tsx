"use client";

import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { UserBulkTable } from "./UserBulkTable";

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

export default function AdminUsersPage() {
  const { data: usersData, loading: usersLoading } = useApi<{ users: UserRow[] }>("/users?pageSize=100", { users: [] });
  const { data: cohortsData, loading: cohortsLoading } = useApi<{ cohorts: { id: string; name: string }[] }>("/cohorts", {
    cohorts: [],
  });
  const { data: badgesData, loading: badgesLoading } = useApi<{ badges: { id: string; name: string }[] }>("/badges", {
    badges: [],
  });

  const loading = usersLoading || cohortsLoading || badgesLoading;

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Users</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Select users for bulk actions: suspend/reactivate, assign to a cohort, award XP or a badge, export.
      </p>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : (
          <UserBulkTable users={usersData.users} cohorts={cohortsData.cohorts} badges={badgesData.badges} />
        )}
      </div>
    </div>
  );
}
