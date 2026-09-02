/** Readable labels + styles for the role/status/member-type enums. */

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Org Admin",
  INSTITUTION_ADMIN: "Institution Admin",
  MANAGER: "Manager",
  LEARNER: "Learner",
  LEGACY_ALUMNI: "Alumni",
  COMMUNITY_ONLY: "Community",
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  PENDING: "Pending",
};

export const MEMBER_TYPE_LABELS: Record<string, string> = {
  NEW_LEARNER: "Learner",
  COMMUNITY_ONLY: "Community",
  LEGACY_ALUMNI: "Alumni",
};

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-[#FEF3C7] text-[#92400E]",
  ORG_ADMIN: "bg-[#EDE9FE] text-[#5B21B6]",
  INSTITUTION_ADMIN: "bg-[#EDE9FE] text-[#5B21B6]",
  MANAGER: "bg-[#DBEAFE] text-[#1E40AF]",
  LEARNER: "bg-[#F1F5F9] text-[#475569]",
  LEGACY_ALUMNI: "bg-[#FCE7F3] text-[#9D174D]",
  COMMUNITY_ONLY: "bg-[#FCE7F3] text-[#9D174D]",
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-[#F0FDF4] text-[#16A34A]",
  SUSPENDED: "bg-[#FEF2F2] text-[#DC2626]",
  PENDING: "bg-[#F8F9FB] text-[#6B7280]",
};
