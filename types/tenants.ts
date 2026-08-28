export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number; courses: number; cohorts: number };
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  plan?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface UpdateTenantBrandingPayload {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface CompliancePolicy {
  id: string;
  tenantId: string;
  name: string;
  courseId: string;
  roleName: string;
  deadline: string | null;
  createdAt: string;
  course: { id: string; title: string };
}

export interface CreateCompliancePolicyPayload {
  name: string;
  courseId: string;
  roleName: string;
  deadline?: string;
  tenantId?: string;
}

export type ComplianceStatus = "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";

export interface CompliancePolicyStatusRow {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  progressPct: number;
  completedAt: string | null;
  status: ComplianceStatus;
}

export interface CompliancePolicyStatus {
  policy: CompliancePolicy;
  rows: CompliancePolicyStatusRow[];
  summary: {
    total: number;
    compliant: number;
    partial: number;
    nonCompliant: number;
    compliancePct: number;
  };
}
