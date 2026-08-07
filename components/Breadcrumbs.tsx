"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/learn": "Learn",
  "/dashboard/community": "Community",
  "/dashboard/profile": "Profile",
  "/dashboard/notifications": "Notifications",
  "/admin": "Admin",
  "/admin/analytics": "Analytics",
  "/admin/courses": "Courses",
  "/admin/courses/assign": "Assign Course",
  "/admin/courses/new": "New Course",
  "/admin/cohorts": "Cohorts",
  "/admin/community": "Community",
  "/admin/notifications": "Notifications",
  "/admin/reports": "Reports",
  "/admin/alumni": "Alumni",
  "/admin/users": "User Management",
  "/admin/compliance": "Compliance",
  "/admin/organizations": "Organizations",
  "/admin/organizations/new": "New Organization",
  "/admin/organizations/[id]": "Organization Details",
  "/admin/institutions": "Institutions",
  "/admin/institutions/new": "New Institution",
  "/admin/institutions/[id]": "Institution Details",
  "/admin/settings": "Settings",
  "/admin/phishing": "Phishing Campaigns",
  "/admin/departments": "Departments",
  "/admin/certifications": "Certifications",
};

function getPageName(pathname: string) {
  // Try exact match first
  if (routeNames[pathname]) return routeNames[pathname];

  // Try parent route match (e.g. /admin/courses/123 -> /admin/courses)
  const matchingRoute = Object.keys(routeNames)
    .filter((route) => route !== "/dashboard" && !route.includes("[") && pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingRoute) return routeNames[matchingRoute];

  // For dynamic routes like /admin/organizations/123, show "Details"
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 3) {
    const lastSegment = segments[segments.length - 1];
    // If last segment is numeric or looks like an ID, use parent name + "Details"
    if (/^\d+$/.test(lastSegment) || lastSegment.length > 8) {
      const parentPath = `/${segments.slice(0, -1).join("/")}`;
      const parentName = routeNames[parentPath];
      if (parentName) return `${parentName.replace(/s$/, "")} Details`;
    }
  }

  const segment = segments.pop();
  return segment
    ? segment.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Dashboard";
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  return (
    <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1 text-[14px] font-sans sm:flex">
      <Link href="/dashboard" className="text-[#1A1A2E] transition hover:opacity-70">
        Novr Academy
      </Link>
      <ChevronRight aria-hidden="true" className="h-4 w-4 text-[#666666]" strokeWidth={1.75} />
      <span className="font-medium text-[#1A1A2E]">{pageName}</span>
    </nav>
  );
}
