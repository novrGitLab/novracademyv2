import type { MemberType, UserRole, UserStatus } from "@novr/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      memberType: MemberType;
      status: UserStatus;
      xp: number;
      enrollmentCount: number;
      certificateCount: number;
      postCount: number;
      tenantId: string | null;
      tenantType?: "ORGANIZATION" | "INSTITUTION";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    memberType: MemberType;
    status: UserStatus;
    tenantId?: string | null;
    tenantType?: "ORGANIZATION" | "INSTITUTION";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    memberType: MemberType;
    status: UserStatus;
    xp: number;
    enrollmentCount: number;
    certificateCount: number;
    postCount: number;
    tenantId: string | null;
    tenantType?: "ORGANIZATION" | "INSTITUTION";
  }
}
