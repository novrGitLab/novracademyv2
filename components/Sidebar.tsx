"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ADMIN_ROLES, MANAGER_ROLES } from "@novr/types";
import { useApi } from "@/lib/useApi";
import {
  BarChart3,
  BookOpen,
  Building2,
  FileText,
  FlaskConical,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  Users2,
  Bell,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

/* -------------------------------------------------------------------------- */
/*  Navigation configs per role                                                */
/* -------------------------------------------------------------------------- */

const baseNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/dashboard/learn", icon: BookOpen },
  { label: "Labs", href: "/dashboard/labs", icon: FlaskConical },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Assessments", href: "/dashboard/assessments", icon: GraduationCap },
  { label: "Community", href: "/dashboard/community", icon: Users },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

const superAdminSections: NavSection[] = [
  {
    label: "PLATFORM",
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "TENANTS",
    items: [
      { label: "Organizations", href: "/admin/organizations", icon: Building2 },
      { label: "Institutions", href: "/admin/institutions", icon: GraduationCap },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "Phishing Campaigns", href: "/admin/phishing", icon: ShieldAlert },
      { label: "Labs", href: "/admin/labs", icon: FlaskConical },
      { label: "ITF Export", href: "/admin/itf", icon: FileText },
      { label: "Marketing", href: "/admin/marketing", icon: Mail },
      { label: "Assessments", href: "/admin/assessments", icon: GraduationCap },
      { label: "Enrollment Codes", href: "/admin/enrollment-codes", icon: Ticket },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const cybernovrAdminSections: NavSection[] = [
  {
    label: "CONTENT",
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Curriculum", href: "/admin/curriculum", icon: GraduationCap },
      { label: "Certificates", href: "/admin/certificates", icon: ShieldCheck },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const orgAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Employees", href: "/admin/users", icon: Users },
  { label: "Assign Course", href: "/admin/courses/assign", icon: BookOpen },
  { label: "Phishing Campaigns", href: "/admin/phishing", icon: ShieldAlert },
  { label: "Labs", href: "/admin/labs", icon: FlaskConical },
  { label: "ITF Export", href: "/admin/itf", icon: FileText },
  { label: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
  { label: "Assessments", href: "/admin/assessments", icon: GraduationCap },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const institutionAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Students", href: "/admin/users", icon: Users },
  { label: "Grading", href: "/admin/grading", icon: BarChart3 },
  { label: "Certificates", href: "/admin/certificates", icon: ShieldCheck },
  { label: "Phishing Campaigns", href: "/admin/phishing", icon: ShieldAlert },
  { label: "Labs", href: "/admin/labs", icon: FlaskConical },
  { label: "ITF Export", href: "/admin/itf", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getNavForRole(
  role: string | undefined,
  tenantType?: string
): NavSection[] {
  if (role === "SUPER_ADMIN") {
    return superAdminSections;
  }

  if (role === "CYBERNOVR_ADMIN") {
    return cybernovrAdminSections;
  }

  if (role === "ORG_ADMIN") {
    return [{ items: orgAdminNav }];
  }

  if (role === "INSTITUTION_ADMIN") {
    return [{ items: institutionAdminNav }];
  }

  // Manager and base users: no admin sections
  return [];
}

function getAdminSections(
  role: string | undefined,
  tenantType?: string
): NavSection[] {
  if (role && ADMIN_ROLES.includes(role as any)) {
    return getNavForRole(role, tenantType);
  }
  return [];
}

function isActive(pathname: string, href: string, isParent: boolean) {
  return isParent
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  // The org logo is fetched separately — it's not in the session (a base64
  // data URL would blow up the JWT/cookie past header limits).
  const { data: org } = useApi<{ logoUrl?: string | null } | null>("/me/org", null);
  const tenantType = session?.user?.tenantType;

  // Build full nav — base nav only for non-admin users
  const isAdmin = role && ADMIN_ROLES.includes(role as any);
  const nav = isAdmin ? [] : [...baseNav];
  const adminSections = getAdminSections(role, tenantType);

  // For manager role (not admin), add Team link
  if (role && MANAGER_ROLES.includes(role as any) && !ADMIN_ROLES.includes(role as any)) {
    nav.push({ label: "Team", href: "/team", icon: Users2 });
  }

  // Determine if we need to show section headers
  const showSections = role === "SUPER_ADMIN" || role === "CYBERNOVR_ADMIN";

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    CYBERNOVR_ADMIN: "CyberNovr Admin",
    ORG_ADMIN: "Tenant Portal",
    INSTITUTION_ADMIN: "Institutional Portal",
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Brand */}
      <div className="px-5 py-6">
        <img
          src={org?.logoUrl || "/novracademy-logo.png"}
          alt="Novr Academy"
          className="h-16 w-auto object-contain"
        />
        {roleLabels[role ?? ""] && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {roleLabels[role ?? ""]}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {/* Base nav items */}
        {nav.map((item) => {
          const isParent = nav.some(
            (other) => other !== item && other.href.startsWith(`${item.href}/`)
          );
          const active = isActive(pathname, item.href, isParent);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-pill px-3 py-2 text-[14px] font-medium transition-all ${
                active
                  ? "bg-[#E82027] text-white shadow-card"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                }`}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}

        {/* Admin sections (with optional section headers) */}
        {adminSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : "mt-2"}>
            {section.label && showSections && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isParent = section.items.some(
                (other) => other !== item && other.href.startsWith(`${item.href}/`)
              );
              const active = isActive(pathname, item.href, isParent);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-pill px-3 py-2 text-[14px] font-medium transition-all ${
                    active
                      ? "bg-[#E82027] text-white shadow-card"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      active ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                    }`}
                    strokeWidth={2}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      {session?.user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-card px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-purple text-[13px] font-semibold text-white">
              {initials(session.user.name, session.user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-text-primary">
                {session.user.name ?? session.user.email}
              </p>
              <p className="truncate text-[12px] text-text-secondary">{role?.replace(/_/g, " ")}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="shrink-0 rounded-md p-1.5 text-text-secondary transition hover:bg-red-light hover:text-red"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
