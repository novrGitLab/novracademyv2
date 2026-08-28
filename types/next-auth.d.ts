import type { MemberType, ReputationLevel, UserRole, UserStatus } from "@novr/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      memberType: MemberType;
      status: UserStatus;
      xp: number;
      reputationLevel: ReputationLevel;
      enrollmentCount: number;
      certificateCount: number;
      postCount: number;
      mustChangePassword: boolean;
      tenantType?: "ORGANIZATION" | "INSTITUTION";
      organization?: {
        id: string;
        name: string;
        slug: string;
        primaryColor?: string | null;
        secondaryColor?: string | null;
        accentColor?: string | null;
        backgroundColor?: string | null;
        textColor?: string | null;
      } | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    memberType: MemberType;
    status: UserStatus;
    tenantType?: "ORGANIZATION" | "INSTITUTION";
    organization?: {
      id: string;
      name: string;
      slug: string;
      primaryColor?: string | null;
      secondaryColor?: string | null;
      accentColor?: string | null;
      backgroundColor?: string | null;
      textColor?: string | null;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    memberType: MemberType;
    status: UserStatus;
    xp: number;
    reputationLevel: ReputationLevel;
    enrollmentCount: number;
    certificateCount: number;
    postCount: number;
    mustChangePassword: boolean;
    tenantType?: "ORGANIZATION" | "INSTITUTION";
    organization?: {
      id: string;
      name: string;
      slug: string;
      primaryColor?: string | null;
      secondaryColor?: string | null;
      accentColor?: string | null;
      backgroundColor?: string | null;
      textColor?: string | null;
    } | null;
  }
}
