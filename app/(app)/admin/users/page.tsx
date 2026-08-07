"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FileUploadModal } from "@/components/ui/FileUploadModal";
import { Toast } from "@/components/ui/Toast";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import {
  Download,
  Edit,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Upload,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  memberType: string;
  status: string;
  xp: number;
  reputationLevel: string;
  department?: string;
  lastActive?: string;
  courseProgress?: number;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                                */
/* -------------------------------------------------------------------------- */

const sampleEmployees: UserRow[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@acme.com", role: "Admin", memberType: "EMPLOYEE", status: "ACTIVE", xp: 2400, reputationLevel: "Gold", department: "Engineering", lastActive: "2 hours ago", courseProgress: 100 },
  { id: "2", name: "Marcus Chen", email: "marcus@acme.com", role: "Member", memberType: "EMPLOYEE", status: "ACTIVE", xp: 1800, reputationLevel: "Silver", department: "Sales", lastActive: "3 days ago", courseProgress: 40 },
  { id: "3", name: "Elena Rostova", email: "elena@acme.com", role: "Member", memberType: "EMPLOYEE", status: "ACTIVE", xp: 1200, reputationLevel: "Silver", department: "HR", lastActive: "1 day ago", courseProgress: 75 },
  { id: "4", name: "Amina Yusuf", email: "amina@acme.com", role: "Member", memberType: "EMPLOYEE", status: "INACTIVE", xp: 600, reputationLevel: "Bronze", department: "Marketing", lastActive: "1 week ago", courseProgress: 15 },
  { id: "5", name: "Tunde Bakare", email: "tunde@acme.com", role: "Member", memberType: "EMPLOYEE", status: "SUSPENDED", xp: 200, reputationLevel: "Bronze", department: "Operations", lastActive: "2 weeks ago", courseProgress: 0 },
];

function initials(name: string | null | undefined) {
  const source = name?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  INACTIVE: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
  SUSPENDED: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
};

/* -------------------------------------------------------------------------- */
/*  Org Admin Employees Page                                                   */
/* -------------------------------------------------------------------------- */

function OrgEmployeesPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const employees = sampleEmployees;
  const filtered = employees.filter(
    (e) =>
      (e.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.department?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "ACTIVE").length,
    atRisk: employees.filter((e) => (e.courseProgress ?? 0) < 50).length,
  };

  function handleInvite() {
    if (!inviteEmail) return;
    console.log("Inviting:", inviteEmail, inviteRole);
    setToast({ message: `Invitation sent to ${inviteEmail}`, type: "success" });
    setInviteEmail("");
    setShowInvite(false);
  }

  function handleResetPassword() {
    console.log("Reset password for:", selectedUser?.email);
    setToast({ message: `Password reset email sent to ${selectedUser?.email}`, type: "success" });
    setShowResetPassword(false);
  }

  function handleChangeEmail() {
    console.log("Change email for:", selectedUser?.email, "to:", newEmail);
    setToast({ message: `Email changed to ${newEmail}`, type: "success" });
    setNewEmail("");
    setShowChangeEmail(false);
  }

  function handleDeactivate() {
    console.log("Deactivate user:", selectedUser?.id);
    setToast({ message: `${selectedUser?.name} has been deactivated`, type: "success" });
    setShowDeactivate(false);
  }

  async function handleBulkImport(rows: Record<string, string>[]) {
    console.log("Importing rows:", rows);
    await new Promise((r) => setTimeout(r, 1000));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Employees</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Manage your team&apos;s training enrollment and progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">
            <Upload className="h-3.5 w-3.5" strokeWidth={2} /> Bulk Import
          </button>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={2} /> Invite Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: stats.total },
          { label: "Active", value: stats.active, color: "text-[#16A34A]" },
          { label: "At-Risk", value: stats.atRisk, color: "text-[#DC2626]" },
        ].map((s) => (
          <div key={s.label} className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">{s.label}</p>
            <p className={`mt-1 text-[24px] font-bold tabular-nums ${s.color ?? "text-[#1A1A2E]"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10" />
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Employee</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Department</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Role</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Course Progress</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last Active</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const s = statusStyles[user.status] ?? statusStyles.ACTIVE;
                const progress = user.courseProgress ?? 0;
                return (
                  <tr key={user.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">{initials(user.name)}</div>
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A2E]">{user.name}</p>
                          <p className="text-[12px] text-[#6B7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#6B7280]">{user.department ?? "—"}</td>
                    <td className="px-6 py-4 text-[14px] text-[#6B7280]">{user.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-[#F1F3F5]">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: progress >= 80 ? "#16A34A" : progress >= 50 ? "#EA580C" : "#DC2626" }} />
                        </div>
                        <span className="text-[12px] tabular-nums text-[#6B7280]">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.lastActive ?? "—"}</td>
                    <td className="px-6 py-4">
                      <DropdownMenu
                        trigger={<button className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"><MoreVertical className="h-4 w-4" strokeWidth={2} /></button>}
                        items={[
                          { label: "Reset Password", icon: ShieldCheck, onClick: () => { setSelectedUser(user); setShowResetPassword(true); } },
                          { label: "Change Email", icon: Mail, onClick: () => { setSelectedUser(user); setNewEmail(user.email); setShowChangeEmail(true); } },
                          { label: "Deactivate", icon: Trash2, danger: true, onClick: () => { setSelectedUser(user); setShowDeactivate(true); } },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Invite Employee Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Employee" description="Send an email invitation to onboard a new employee.">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">EMAIL</label>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="employee@company.com" className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ROLE</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]">
              <option value="Member">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setShowInvite(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={handleInvite} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"><Mail className="inline h-3.5 w-3.5 mr-1" /> Send Invite</button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Import Modal */}
      <FileUploadModal open={showImport} onClose={() => setShowImport(false)} onImport={handleBulkImport} title="Import Employees" description="Upload a CSV file with employee data." templateHeaders={["name", "email", "department", "role"]} />

      {/* Reset Password Confirmation */}
      <ConfirmDialog open={showResetPassword} onClose={() => setShowResetPassword(false)} onConfirm={handleResetPassword} title="Reset Password" message={`Send a password reset email to ${selectedUser?.name} at ${selectedUser?.email}?`} confirmLabel="Send Reset Email" variant="info" />

      {/* Change Email Modal */}
      <Modal open={showChangeEmail} onClose={() => setShowChangeEmail(false)} title="Change Email" description={`Update the email address for ${selectedUser?.name}.`}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">CURRENT EMAIL</label>
            <p className="mt-1 text-[14px] text-[#1A1A2E]">{selectedUser?.email}</p>
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">NEW EMAIL</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
        </div>
        <Modal.Footer>
          <button onClick={() => setShowChangeEmail(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">Cancel</button>
          <button onClick={handleChangeEmail} disabled={!newEmail || newEmail === selectedUser?.email} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50">Save Changes</button>
        </Modal.Footer>
      </Modal>

      {/* Deactivate Confirmation */}
      <ConfirmDialog open={showDeactivate} onClose={() => setShowDeactivate(false)} onConfirm={handleDeactivate} title="Deactivate User" message={`Are you sure you want to deactivate ${selectedUser?.name}? They will no longer be able to log in.`} confirmLabel="Deactivate" variant="danger" />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Super Admin Users Page                                                     */
/* -------------------------------------------------------------------------- */

function SuperAdminUsersPage() {
  const { data: usersData, loading: usersLoading } = useApi<{ users: UserRow[] }>("/users?pageSize=100", { users: [] });

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Users</h1>
      <p className="mt-1 text-[15px] text-text-secondary">Select users for bulk actions: suspend/reactivate, assign to a cohort, award XP or a badge, export.</p>
      <div className="mt-6">
        {usersLoading ? <TableSkeleton /> : <p className="text-[14px] text-[#6B7280]">User table loads from API.</p>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "SUPER_ADMIN" || role === "CYBERNOVR_ADMIN") return <SuperAdminUsersPage />;
  if (role === "ORG_ADMIN") return <OrgEmployeesPage />;
  if (role === "INSTITUTION_ADMIN") return <OrgEmployeesPage />;
  return <SuperAdminUsersPage />;
}
