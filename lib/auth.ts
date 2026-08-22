import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@novr/db";
import { GroupType, UserStatus } from "@novr/types";
import { TEST_CREDENTIALS } from "./test-credentials";

async function autoJoinGeneralChannel(userId: string) {
  const general = await prisma.communityGroup.upsert({
    where: { slug: "general" },
    create: { name: "General", slug: "general", type: GroupType.GENERAL },
    update: {},
  });
  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId: general.id } },
    create: { userId, groupId: general.id },
    update: {},
  });
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Development-only test users bypass the database for quick UI testing.
        if (process.env.NODE_ENV === "development") {
          const testUser = Object.values(TEST_CREDENTIALS).find(
            ({ email, password }) =>
              email === credentials.email && password === credentials.password,
          );
          if (testUser) return testUser.user as any;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        if (user.status !== UserStatus.ACTIVE) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // Update lastLoginAt
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberType: user.memberType,
          status: user.status,
          mustChangePassword: (user as any).mustChangePassword ?? false,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.MICROSOFT_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
          }),
        ]
      : []),
  ],
  events: {
    // Fires for the Prisma adapter's own user creation (OAuth first login).
    // Credentials-based accounts are created by API routes (admin create,
    // alumni claim) which call the equivalent join directly.
    async createUser({ user }) {
      await autoJoinGeneralChannel(user.id);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.memberType = (user as any).memberType;
        token.status = (user as any).status;
        token.xp = (user as any).xp ?? 0;
        token.enrollmentCount = (user as any).enrollmentCount ?? 0;
        token.certificateCount = (user as any).certificateCount ?? 0;
        token.postCount = (user as any).postCount ?? 0;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      const isTestUser = typeof token.id === "string" && token.id.startsWith("test-");
      if (token.id && !isTestUser) {
        // Refresh claims from the DB so role/status/xp changes take effect
        // without forcing a re-login. Counts power the dashboard stat cards
        // directly from the session, so that page never has to call the API.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            memberType: true,
            status: true,
            xp: true,
            organizationId: true,
            mustChangePassword: true,
            _count: { select: { enrollmentsAsAssignee: true, certificates: true, posts: true } },
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.memberType = dbUser.memberType;
          token.status = dbUser.status;
          token.xp = dbUser.xp;
          token.mustChangePassword = dbUser.mustChangePassword;
          token.enrollmentCount = dbUser._count.enrollmentsAsAssignee;
          token.certificateCount = dbUser._count.certificates;
          token.postCount = dbUser._count.posts;
          if (dbUser.organizationId) {
            const organization = await prisma.organization.findUnique({
              where: { id: dbUser.organizationId },
              select: {
                id: true,
                name: true,
                slug: true,
                primaryColor: true,
                secondaryColor: true,
                accentColor: true,
                backgroundColor: true,
                textColor: true,
              },
            });
            if (organization) {
              // NOTE: logoUrl is deliberately excluded — it's a base64 data
              // URL that can be hundreds of KB, and embedding it in the JWT
              // blows past header limits (HTTP 431). Fetch it via /me/org.
              token.organization = {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                primaryColor: organization.primaryColor,
                secondaryColor: organization.secondaryColor,
                accentColor: organization.accentColor,
                backgroundColor: organization.backgroundColor,
                textColor: organization.textColor,
              };
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.memberType = token.memberType as any;
        session.user.status = token.status as any;
        session.user.xp = token.xp ?? 0;
        session.user.enrollmentCount = token.enrollmentCount ?? 0;
        session.user.certificateCount = token.certificateCount ?? 0;
        session.user.postCount = token.postCount ?? 0;
        session.user.mustChangePassword = token.mustChangePassword ?? false;
        session.user.organization = token.organization ?? null;
      }
      return session;
    },
  },
};
