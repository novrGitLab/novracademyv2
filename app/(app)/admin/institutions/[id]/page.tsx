"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Edit, GraduationCap, Mail, MoreVertical, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & Data                                                               */
/* -------------------------------------------------------------------------- */

interface TenantUser { id: string; name: string; email: string; role: string; status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; lastLogin: string; }
interface TenantInfo { id: string; name: string; type: "ORG" | "INST"; plan: string; activeUsers: number; compliance: number; status: string; }

const tenantMap: Record<string, TenantInfo> = {
  "2": { id: "2", name: "Lagos State University", type: "INST", plan: "Academic Pro", activeUsers: 8120, compliance: 78, status: "ACTIVE" },
  "4": { id: "4", name: "University of Lagos", type: "INST", plan: "Academic Pro", activeUsers: 6400, compliance: 85, status: "ACTIVE" },
};

const usersByTenant: Record<string, TenantUser[]> = {
  "2": [
    { id: "1", name: "Prof. Adebayo Johnson", email: "adebayo@lasu.edu.ng", role: "Admin", status: "ACTIVE", lastLogin: "1 hour ago" },
    { id: "2", name: "Dr. Ngozi Okafor", email: "ngozi@lasu.edu.ng", role: "Faculty", status: "ACTIVE", lastLogin: "3 hours ago" },
    { id: "3", name: "Chidi Eze", email: "chidi@student.lasu.edu.ng", role: "Student", status: "ACTIVE", lastLogin: "30 mins ago" },
  ],
};

function initials(name: string) { const p = name.split(/\s+/).filter(Boolean); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase(); }
const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  INACTIVE: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
  SUSPENDED: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function InstitutionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const tenant = tenantMap[id] || { id, name: "Unknown Institution", type: "INST" as const, plan: "—", activeUsers: 0, compliance: 0, status: "—" };
  const users = usersByTenant[id] || [];

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Student");
  const [newEmail, setNewEmail] = useState("");
  const [editName, setEditName] = useState(tenant.name);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  function showToast(message: string, type: "success" | "error" = "success") { setToast({ message, type }); }

  return (
    <div className="space-y-6">
      <BackLink href="/admin/institutions" label="Back to Institutions" />

      {/* Tenant header */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#EFF6FF]"><GraduationCap className="h-6 w-6 text-[#2563EB]" strokeWidth={2} /></div>
            <div>
              <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">{tenant.name}</h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">{tenant.plan} plan · {tenant.activeUsers.toLocaleString()} students · {tenant.compliance}% compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="rounded-[6px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"><Edit className="inline h-3.5 w-3.5 mr-1" /> Edit</button>
            <button onClick={() => setShowSuspend(true)} className="rounded-[6px] border border-[#DC2626] px-4 py-2 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]">Suspend</button>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Student & Staff Management</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"><UserPlus className="h-3.5 w-3.5" strokeWidth={2} /> Invite User</button>
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
              <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-48 rounded-[6px] border border-[#E5E7EB] bg-[#F8F9FB] pl-8 pr-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:bg-white" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">User</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Role</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Last Login</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const s = statusStyles[user.status];
                return (
                  <tr key={user.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[12px] font-semibold text-[#2563EB]">{initials(user.name)}</div><div><p className="text-[14px] font-medium text-[#1A1A2E]">{user.name}</p><p className="text-[12px] text-[#6B7280]">{user.email}</p></div></div></td>
                    <td className="px-6 py-4 text-[14px] text-[#6B7280]">{user.role}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{user.status}</span></td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <DropdownMenu trigger={<button className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"><MoreVertical className="h-4 w-4" strokeWidth={2} /></button>} items={[
                        { label: "Reset Password", icon: ShieldCheck, onClick: () => { setSelectedUser(user); setShowResetPassword(true); } },
                        { label: "Change Email", icon: Mail, onClick: () => { setSelectedUser(user); setNewEmail(user.email); setShowChangeEmail(true); } },
                        { label: "Deactivate", icon: Trash2, danger: true, onClick: () => { setSelectedUser(user); setShowDeactivate(true); } },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Institution">
        <div className="space-y-4">
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">NAME</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]" /></div>
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">PROGRAM</label><select defaultValue={tenant.plan} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"><option>Starter</option><option>Standard</option><option>Academic Pro</option></select></div>
        </div>
        <Modal.Footer><button onClick={() => setShowEdit(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button><button onClick={() => { showToast("Institution updated"); setShowEdit(false); }} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]">Save</button></Modal.Footer>
      </Modal>

      <ConfirmDialog open={showSuspend} onClose={() => setShowSuspend(false)} onConfirm={() => { showToast("Institution suspended"); setShowSuspend(false); }} title="Suspend Institution" message={`Are you sure you want to suspend ${tenant.name}? All ${tenant.activeUsers.toLocaleString()} students and staff will lose access.`} confirmLabel="Suspend" variant="danger" />

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite User" description="Send an email invitation.">
        <div className="space-y-4">
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">EMAIL</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@university.edu.ng" className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]" /></div>
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ROLE</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"><option value="Student">Student</option><option value="Faculty">Faculty</option><option value="Admin">Admin</option></select></div>
        </div>
        <Modal.Footer><button onClick={() => setShowInvite(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button><button onClick={() => { showToast(`Invitation sent to ${inviteEmail}`); setShowInvite(false); setInviteEmail(""); }} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]">Send Invite</button></Modal.Footer>
      </Modal>

      <ConfirmDialog open={showResetPassword} onClose={() => setShowResetPassword(false)} onConfirm={() => { showToast(`Password reset sent to ${selectedUser?.email}`); setShowResetPassword(false); }} title="Reset Password" message={`Send a password reset email to ${selectedUser?.name}?`} confirmLabel="Send Reset" variant="info" />

      <Modal open={showChangeEmail} onClose={() => setShowChangeEmail(false)} title="Change Email">
        <div className="space-y-4">
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">CURRENT</label><p className="mt-1 text-[14px] text-[#1A1A2E]">{selectedUser?.email}</p></div>
          <div><label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">NEW EMAIL</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]" /></div>
        </div>
        <Modal.Footer><button onClick={() => setShowChangeEmail(false)} className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button><button onClick={() => { showToast(`Email updated to ${newEmail}`); setShowChangeEmail(false); }} className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]">Save</button></Modal.Footer>
      </Modal>

      <ConfirmDialog open={showDeactivate} onClose={() => setShowDeactivate(false)} onConfirm={() => { showToast(`${selectedUser?.name} deactivated`); setShowDeactivate(false); }} title="Deactivate User" message={`Are you sure you want to deactivate ${selectedUser?.name}?`} confirmLabel="Deactivate" variant="danger" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
