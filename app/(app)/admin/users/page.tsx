"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi, apiMutate } from "@/lib/useApi";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FileUploadModal } from "@/components/ui/FileUploadModal";
import { Toast } from "@/components/ui/Toast";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Edit, Mail, MoreVertical, Search, ShieldCheck, Trash2, UserPlus, Upload } from "lucide-react";
import { SuperAdminUsersView } from "./SuperAdminUsersView";
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
  lastLoginAt?: string | null;
  courseProgress?: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
  const { data, loading, refetch } = useApi<{ users: UserRow[] }>("/users?pageSize=100", { users: [] });
  const employees = data.users;

  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = employees.filter(
    (e) =>
      (e.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "ACTIVE").length,
    atRisk: employees.filter((e) => (e.courseProgress ?? 0) < 50).length,
  };

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const result = await apiMutate<{ tempPassword?: string }>("/users", "POST", {
        email: inviteEmail,
        name: inviteName || inviteEmail.split("@")[0],
        role: inviteRole === "Member" ? "LEARNER" : inviteRole === "Manager" ? "MANAGER" : "ORG_ADMIN",
      });
      if (result?.tempPassword) {
        setToast({ message: `Employee created. Temp password: ${result.tempPassword}`, type: "success" });
      } else {
        setToast({ message: `Invitation sent to ${inviteEmail}`, type: "success" });
      }
      setInviteEmail("");
      setInviteName("");
      setShowInvite(false);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiMutate("/auth/forgot-password", "POST", { email: selectedUser.email });
      setToast({ message: `Password reset email sent to ${selectedUser.email}`, type: "success" });
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
      setShowResetPassword(false);
    }
  }

  async function handleChangeEmail() {
    if (!selectedUser || !newEmail) return;
    setActionLoading(true);
    try {
      await apiMutate(`/users/${selectedUser.id}`, "PATCH", { email: newEmail });
      setToast({ message: `Email updated to ${newEmail}`, type: "success" });
      setNewEmail("");
      setShowChangeEmail(false);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiMutate(`/users/${selectedUser.id}`, "PATCH", { status: "SUSPENDED" });
      setToast({ message: `${selectedUser.name} has been deactivated`, type: "success" });
      setShowDeactivate(false);
      refetch();
    } catch (err) {
      setToast({ message: `Failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBulkImport(rows: Record<string, string>[]) {
    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        const result = await apiMutate<{ tempPassword?: string }>("/users", "POST", {
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
    refetch();
  }

  return (
    <div className="space-y-6">
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

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10" />
      </div>

      {loading ? (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-12 text-center shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
          <p className="mt-4 text-[14px] text-[#6B7280]">Loading employees...</p>
        </div>
      ) : (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Employee</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Role</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                  <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last Active</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const s = statusStyles[user.status] ?? statusStyles.ACTIVE;
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
                      <td className="px-6 py-4 text-[14px] text-[#6B7280]">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
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
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Employee" description="Send an email invitation to onboard a new employee.">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FULL NAME</label>
            <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Doe" className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]" />
          </div>
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
          <button onClick={handleInvite} disabled={inviteLoading} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50">
            <Mail className="inline h-3.5 w-3.5 mr-1" /> {inviteLoading ? "Sending..." : "Send Invite"}
          </button>
        </Modal.Footer>
      </Modal>

      <FileUploadModal open={showImport} onClose={() => setShowImport(false)} onImport={handleBulkImport} title="Import Employees" description="Upload a CSV file with employee data." templateHeaders={["name", "email", "department", "role"]} />

      <ConfirmDialog open={showResetPassword} onClose={() => setShowResetPassword(false)} onConfirm={handleResetPassword} title="Reset Password" message={`Send a password reset email to ${selectedUser?.name} at ${selectedUser?.email}?`} confirmLabel="Send Reset Email" variant="info" />

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

      <ConfirmDialog open={showDeactivate} onClose={() => setShowDeactivate(false)} onConfirm={handleDeactivate} title="Deactivate User" message={`Are you sure you want to deactivate ${selectedUser?.name}? They will no longer be able to log in.`} confirmLabel="Deactivate" variant="danger" loading={actionLoading} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Super Admin Users Page                                                     */
/* -------------------------------------------------------------------------- */

function SuperAdminUsersPage() {
  return <SuperAdminUsersView />;
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
