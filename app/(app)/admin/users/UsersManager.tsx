"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShieldCheck,
  Mail,
  Trash2,
  RotateCcw,
  Ban,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import { useApi, apiMutate } from "@/lib/useApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { FileUploadModal } from "@/components/ui/FileUploadModal";
import { Toast } from "@/components/ui/Toast";
import {
  ROLE_LABELS,
  STATUS_LABELS,
  MEMBER_TYPE_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "@/lib/user-labels";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OrgRef {
  id: string;
  name: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  memberType: string;
  status: string;
  xp: number;
  reputationLevel: string;
  lastLoginAt: string | null;
  createdAt: string;
  organization: OrgRef | null;
}

interface UserListResponse {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface GrowthData {
  baselineScore?: number | null;
  closingScore?: number | null;
  growth?: number;
}

export type UsersMode = "org" | "platform";

const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "INSTITUTION_ADMIN",
  "MANAGER",
  "LEARNER",
  "LEGACY_ALUMNI",
  "COMMUNITY_ONLY",
];
const ORG_ROLES = ["ORG_ADMIN", "INSTITUTION_ADMIN", "MANAGER", "LEARNER"];
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "PENDING"];

const PLATFORM_ADD_ROLES = ["LEARNER", "MANAGER", "ORG_ADMIN", "INSTITUTION_ADMIN"];
const ORG_ADD_ROLES = ["LEARNER", "MANAGER"];

function initials(name: string | null | undefined) {
  const source = name?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function roleBadge(role: string) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[role] ?? ROLE_COLORS.LEARNER}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function statusBadge(status: string) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[status] ?? STATUS_COLORS.PENDING}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "ACTIVE" ? "bg-[#16A34A]" : status === "SUSPENDED" ? "bg-[#DC2626]" : "bg-[#6B7280]"}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function UsersManager({ mode }: { mode: UsersMode }) {
  const isPlatform = mode === "platform";

  // Server-side list state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [memberType, setMemberType] = useState("");
  const [orgId, setOrgId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Detail / action state
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [action, setAction] = useState<null | "resetPassword" | "suspend" | "reactivate" | "delete" | "changeEmail">(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add-user / invite modal (platform: picks tenant; org: fixed to own org)
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail2, setNewEmail2] = useState("");
  const [newUserOrg, setNewUserOrg] = useState("");
  const [newUserRole, setNewUserRole] = useState("LEARNER");
  const [addLoading, setAddLoading] = useState(false);

  // Bulk import (org mode)
  const [showImport, setShowImport] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<null | "suspend" | "reactivate">(null);

  const roleOptions = isPlatform ? PLATFORM_ROLES : ORG_ROLES;
  const addRoleOptions = isPlatform ? PLATFORM_ADD_ROLES : ORG_ADD_ROLES;

  // Org list for the platform tenant filter / add-user tenant picker.
  const { data: orgs } = useApi<{ organizations: { id: string; name: string }[] } | { id: string; name: string }[]>(
    isPlatform ? "/organizations" : "__disabled__",
    []
  );
  const orgOptions = useMemo(() => {
    const arr = Array.isArray(orgs) ? orgs : (orgs as { organizations?: { id: string; name: string }[] })?.organizations ?? [];
    return arr;
  }, [orgs]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Reset to page 1 when a filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, memberType, orgId]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (role) p.set("role", role);
    if (status) p.set("status", status);
    if (memberType) p.set("memberType", memberType);
    if (isPlatform && orgId) p.set("organizationId", orgId);
    const s = p.toString();
    return s ? `/users?${s}` : "/users";
  }, [page, debouncedSearch, role, status, memberType, orgId, isPlatform]);

  const { data, loading, error, refetch } = useApi<UserListResponse>(qs, {
    users: [],
    total: 0,
    page: 1,
    pageSize,
  });

  const users = data.users;
  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

  // Clear selections no longer present on this page
  useEffect(() => {
    if (selectedIds.size === 0) return;
    const present = new Set(users.map((u) => u.id));
    const next = new Set([...selectedIds].filter((id) => present.has(id)));
    if (next.size !== selectedIds.size) setSelectedIds(next);
  }, [users, selectedIds]);

  const allOnPageSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        users.forEach((u) => next.delete(u.id));
      } else {
        users.forEach((u) => next.add(u.id));
      }
      return next;
    });
  }

  async function openDetail(user: UserRow) {
    setSelected(user);
    setGrowth(null);
    setDrawerOpen(true);
    try {
      const res = await fetch(`/api/proxy/users/${user.id}/growth`, { cache: "no-store" });
      if (res.ok) {
        const g = (await res.json()) as GrowthData;
        setGrowth(g);
      }
    } catch {
      // Growth is optional — the drawer still works without it.
    }
  }

  async function runAction() {
    if (!selected) return;
    setActionLoading(true);
    try {
      if (action === "resetPassword") {
        await apiMutate("/auth/forgot-password", "POST", { email: selected.email });
        setToast({ message: `Password reset email sent to ${selected.email}`, type: "success" });
      } else if (action === "changeEmail") {
        if (!newEmail) return;
        await apiMutate(`/users/${selected.id}`, "PATCH", { email: newEmail });
        setToast({ message: `Email updated to ${newEmail}`, type: "success" });
        setNewEmail("");
      } else if (action === "suspend") {
        await apiMutate(`/users/${selected.id}`, "PATCH", { status: "SUSPENDED" });
        setToast({ message: `${selected.name ?? selected.email} suspended`, type: "success" });
        refetch();
      } else if (action === "reactivate") {
        await apiMutate(`/users/${selected.id}`, "PATCH", { status: "ACTIVE" });
        setToast({ message: `${selected.name ?? selected.email} reactivated`, type: "success" });
        refetch();
      } else if (action === "delete") {
        await apiMutate(`/users/${selected.id}`, "DELETE");
        setToast({ message: `${selected.name ?? selected.email} deleted`, type: "success" });
        setDrawerOpen(false);
        refetch();
      }
      setAction(null);
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function saveRoleChange() {
    if (!selected || !newRole) return;
    setActionLoading(true);
    try {
      await apiMutate(`/users/${selected.id}`, "PATCH", { role: newRole });
      setToast({ message: `Role updated to ${ROLE_LABELS[newRole] ?? newRole}`, type: "success" });
      setRoleModalOpen(false);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddUser() {
    const email = newEmail2.trim();
    if (!email) return;
    if (isPlatform && !newUserOrg) return;
    setAddLoading(true);
    try {
      const result = await apiMutate<{ tempPassword?: string }>("/users", "POST", {
        email,
        name: newName || email.split("@")[0],
        role: newUserRole,
        ...(isPlatform ? { organizationId: newUserOrg } : {}),
      });
      const tenantName = isPlatform ? orgOptions.find((o) => o.id === newUserOrg)?.name : undefined;
      setToast({
        message: result?.tempPassword
          ? `User created. Temp password: ${result.tempPassword}`
          : `User created${tenantName ? ` for ${tenantName}` : ""}`,
        type: "success",
      });
      setNewName("");
      setNewEmail2("");
      setNewUserOrg("");
      setNewUserRole("LEARNER");
      setAddUserOpen(false);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleBulkImport(rows: Record<string, string>[]) {
    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        await apiMutate<{ tempPassword?: string }>("/users", "POST", {
          email: row.email,
          name: row.name,
          role: row.role?.toUpperCase() === "ADMIN" ? "ORG_ADMIN" : row.role?.toUpperCase() === "MANAGER" ? "MANAGER" : "LEARNER",
        });
        imported++;
      } catch (err) {
        console.error("Failed to import user:", err);
        failed++;
      }
    }
    setToast({
      message: `Import complete: ${imported} imported, ${failed} failed`,
      type: imported > 0 ? "success" : "error",
    });
    setShowImport(false);
    refetch();
  }

  async function runBulkAction() {
    if (selectedIds.size === 0 || !bulkAction) return;
    setActionLoading(true);
    try {
      const nextStatus = bulkAction === "suspend" ? "SUSPENDED" : "ACTIVE";
      await apiMutate("/users/bulk/status", "POST", {
        userIds: [...selectedIds],
        status: nextStatus,
      });
      setToast({ message: `${selectedIds.size} user${selectedIds.size === 1 ? "" : "s"} ${nextStatus === "SUSPENDED" ? "suspended" : "reactivated"}`, type: "success" });
      setSelectedIds(new Set());
      setBulkAction(null);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  const title = isPlatform ? "Users" : "Employees";
  const subtitle = isPlatform
    ? `${data.total} user${data.total === 1 ? "" : "s"} across all tenants.`
    : `Manage your team's training enrollment and progress. ${data.total} member${data.total === 1 ? "" : "s"}.`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">{title}</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isPlatform && (
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              <Upload className="h-3.5 w-3.5" /> Bulk Import
            </button>
          )}
          <button
            onClick={() => {
              setNewName("");
              setNewEmail2("");
              setNewUserRole("LEARNER");
              setNewUserOrg(orgId);
              setAddUserOpen(true);
            }}
            className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            <UserPlus className="h-3.5 w-3.5" /> {isPlatform ? "Add User" : "Invite Employee"}
          </button>
        </div>
      </div>

      {/* Stat cards (org mode) */}
      {!isPlatform && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: data.total },
            { label: "Active", value: activeCount, color: "text-[#16A34A]" },
            { label: "Suspended", value: suspendedCount, color: "text-[#DC2626]" },
          ].map((s) => (
            <div key={s.label} className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">{s.label}</p>
              <p className={`mt-1 text-[24px] font-bold tabular-nums ${s.color ?? "text-[#1A1A2E]"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isPlatform ? "Search name or email..." : "Search employees..."}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>
        {isPlatform && (
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
            <option value="">All tenants</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
          <option value="">All roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>
        <select value={memberType} onChange={(e) => setMemberType(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]">
          <option value="">All member types</option>
          {Object.entries(MEMBER_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
          <p className="mt-4 text-[14px] text-[#6B7280]">Loading…</p>
        </div>
      ) : error ? (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-10 text-center">
          <p className="text-[14px] text-[#DC2626]">Could not load users.</p>
          <button onClick={refetch} className="mt-3 rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#1A1A2E] hover:bg-[#F8F9FB]">Retry</button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="h-4 w-4 accent-[#683290]" aria-label="Select all on page" />
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">{isPlatform ? "User" : "Employee"}</th>
                  {isPlatform && <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant</th>}
                  <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Role</th>
                  <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                  {isPlatform && <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Member</th>}
                  <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="cursor-pointer border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]"
                    onClick={() => openDetail(u)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} className="h-4 w-4 accent-[#683290]" aria-label={`Select ${u.name ?? u.email}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A2E]">{u.name || "Unnamed"}</p>
                          <p className="text-[12px] text-[#6B7280]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {isPlatform && <td className="px-4 py-3 text-[13px] text-[#6B7280]">{u.organization?.name ?? "—"}</td>}
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">{statusBadge(u.status)}</td>
                    {isPlatform && <td className="px-4 py-3 text-[13px] text-[#6B7280]">{MEMBER_TYPE_LABELS[u.memberType] ?? u.memberType}</td>}
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(u); setAction(u.status === "SUSPENDED" ? "reactivate" : "suspend"); }}
                          title={u.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
                        >
                          {u.status === "SUSPENDED" ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={isPlatform ? 8 : 6} className="px-4 py-12 text-center text-[14px] text-[#9CA3AF]">
                      No {isPlatform ? "users" : "employees"} match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > 0 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8F9FB] px-4 py-2.5">
              <p className="text-[13px] text-[#6B7280]">
                {data.total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#6B7280] transition hover:bg-[#E5E7EB] disabled:opacity-30" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-[13px] tabular-nums text-[#1A1A2E]">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#6B7280] transition hover:bg-[#E5E7EB] disabled:opacity-30" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-lg">
          <span className="text-[13px] font-medium text-[#1A1A2E]">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <button onClick={() => { setBulkAction("suspend"); }} className="flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-[12px] font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]">
            <Ban className="h-3 w-3" /> Suspend
          </button>
          <button onClick={() => { setBulkAction("reactivate"); }} className="flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-[12px] font-medium text-[#16A34A] transition hover:bg-[#DCFCE7]">
            <CheckCircle2 className="h-3 w-3" /> Reactivate
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]" aria-label="Clear selection">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Detail drawer ── */}
      {drawerOpen && selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4ECF8] text-[14px] font-semibold text-[#683290]">{initials(selected.name)}</div>
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A2E]">{selected.name || "Unnamed"}</p>
                  <p className="text-[12px] text-[#6B7280]">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                {/* Summary chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {roleBadge(selected.role)}
                  {statusBadge(selected.status)}
                  <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                    {MEMBER_TYPE_LABELS[selected.memberType] ?? selected.memberType}
                  </span>
                </div>

                {/* Key facts */}
                <dl className="grid grid-cols-2 gap-3 rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-4 text-[13px]">
                  {isPlatform && (
                    <div>
                      <dt className="text-[#6B7280]">Tenant</dt>
                      <dd className="mt-0.5 font-medium text-[#1A1A2E]">{selected.organization?.name ?? "—"}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[#6B7280]">Joined</dt>
                    <dd className="mt-0.5 font-medium text-[#1A1A2E]">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7280]">Last active</dt>
                    <dd className="mt-0.5 font-medium text-[#1A1A2E]">{selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleDateString() : "Never"}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7280]">Reputation</dt>
                    <dd className="mt-0.5 font-medium text-[#1A1A2E]">{selected.reputationLevel ?? "—"}{selected.xp ? ` · ${selected.xp} XP` : ""}</dd>
                  </div>
                </dl>

                {/* Growth */}
                {growth && (growth.baselineScore != null || growth.closingScore != null) && (
                  <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Assessment growth</h3>
                    <div className="mt-2 flex items-center gap-4 rounded-[8px] border border-[#E5E7EB] p-3 text-[13px]">
                      <div>
                        <p className="text-[#6B7280]">Baseline</p>
                        <p className="font-semibold text-[#1A1A2E]">{growth.baselineScore != null ? `${Math.round(growth.baselineScore)}%` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B7280]">Closing</p>
                        <p className="font-semibold text-[#1A1A2E]">{growth.closingScore != null ? `${Math.round(growth.closingScore)}%` : "—"}</p>
                      </div>
                      {growth.growth != null && (
                        <div>
                          <p className="text-[#6B7280]">Growth</p>
                          <p className={`font-semibold ${growth.growth >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                            {growth.growth >= 0 ? "+" : ""}{Math.round(growth.growth)} pts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 border-t border-[#E5E7EB] pt-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Actions</p>
                  <button onClick={() => { setNewRole(selected.role); setRoleModalOpen(true); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#683290]" /> Change role
                  </button>
                  <button onClick={() => { setAction("changeEmail"); setNewEmail(selected.email); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                    <Mail className="h-3.5 w-3.5 text-[#683290]" /> Change email
                  </button>
                  <button onClick={() => { setAction("resetPassword"); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#1A1A2E] transition hover:bg-[#F8F9FB]">
                    <Mail className="h-3.5 w-3.5 text-[#683290]" /> Send password reset
                  </button>
                  {selected.status === "SUSPENDED" ? (
                    <button onClick={() => { setAction("reactivate"); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#16A34A] transition hover:bg-[#F0FDF4]">
                      <RotateCcw className="h-3.5 w-3.5" /> Reactivate account
                    </button>
                  ) : (
                    <button onClick={() => { setAction("suspend"); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]">
                      <Ban className="h-3.5 w-3.5" /> Suspend account
                    </button>
                  )}
                  <button onClick={() => { setAction("delete"); }} className="flex w-full items-center gap-2 rounded-[8px] border border-[#FECACA] px-3 py-2 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]">
                    <Trash2 className="h-3.5 w-3.5" /> Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role change modal */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Change role" description={`Update the role for ${selected?.name ?? selected?.email}.`}>
        <div className="space-y-2">
          {roleOptions.filter((r) => r !== "LEGACY_ALUMNI" && r !== "COMMUNITY_ONLY").map((r) => (
            <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] transition ${newRole === r ? "border-[#683290] bg-[#F4ECF8] text-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]"}`}>
              <input type="radio" name="role" value={r} checked={newRole === r} onChange={() => setNewRole(r)} className="accent-[#683290]" />
              {ROLE_LABELS[r] ?? r}
            </label>
          ))}
        </div>
        <Modal.Footer>
          <button onClick={() => setRoleModalOpen(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={saveRoleChange} disabled={!newRole || newRole === selected?.role || actionLoading} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50">
            {actionLoading ? "Saving…" : "Save"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Add-user / invite modal */}
      <Modal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title={isPlatform ? "Add user" : "Invite employee"}
        description={
          isPlatform
            ? "Create a user under a tenant. A temp password is emailed to them."
            : "Send an email invitation to onboard a new employee."
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FULL NAME</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">EMAIL</label>
            <input type="email" value={newEmail2} onChange={(e) => setNewEmail2(e.target.value)} placeholder="user@company.com" className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
          {isPlatform && (
            <div>
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">TENANT</label>
              <select value={newUserOrg} onChange={(e) => setNewUserOrg(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]">
                <option value="">Select a tenant…</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ROLE</label>
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]">
              {addRoleOptions.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setAddUserOpen(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">Cancel</button>
          <button
            onClick={handleAddUser}
            disabled={!newEmail2.trim() || (isPlatform && !newUserOrg) || addLoading}
            className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
          >
            {addLoading ? "Creating…" : isPlatform ? "Create User" : "Send Invite"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Change-email modal */}
      <Modal open={action === "changeEmail"} onClose={() => setAction(null)} title="Change email" description={`Update the email address for ${selected?.name}.`}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">CURRENT EMAIL</label>
            <p className="mt-1 text-[14px] text-[#1A1A2E]">{selected?.email}</p>
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">NEW EMAIL</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setAction(null)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={runAction} disabled={!newEmail || newEmail === selected?.email || actionLoading} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50">
            {actionLoading ? "Saving…" : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Bulk import (org mode) */}
      <FileUploadModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleBulkImport}
        title="Import Employees"
        description="Upload a CSV file with employee data."
        templateHeaders={["name", "email", "department", "role"]}
      />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={action === "suspend"}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title="Suspend user"
        message={`${selected?.name ?? selected?.email} will not be able to log in until reactivated.`}
        confirmLabel="Suspend"
        variant="danger"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={action === "reactivate"}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title="Reactivate user"
        message={`Restore login access for ${selected?.name ?? selected?.email}?`}
        confirmLabel="Reactivate"
        variant="info"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={action === "resetPassword"}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title="Send password reset"
        message={`Send a password reset email to ${selected?.email}?`}
        confirmLabel="Send"
        variant="info"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={action === "delete"}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title="Delete user"
        message={`Delete ${selected?.name ?? selected?.email}? Their account will be anonymized and disabled. Their past enrollments and certificates are kept for records.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={bulkAction === "suspend"}
        onClose={() => setBulkAction(null)}
        onConfirm={runBulkAction}
        title="Suspend selected users"
        message={`Suspend ${selectedIds.size} selected user${selectedIds.size === 1 ? "" : "s"}?`}
        confirmLabel="Suspend"
        variant="danger"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={bulkAction === "reactivate"}
        onClose={() => setBulkAction(null)}
        onConfirm={runBulkAction}
        title="Reactivate selected users"
        message={`Reactivate ${selectedIds.size} selected user${selectedIds.size === 1 ? "" : "s"}?`}
        confirmLabel="Reactivate"
        variant="info"
        loading={actionLoading}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
