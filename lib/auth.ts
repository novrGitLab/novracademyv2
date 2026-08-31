import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@novr/db";
import { GroupType, UserStatus } from "@novr/types";
import { TEST_CREDENTIALS } from "./test-credentials";

/**
 * PrismaAdapter passes the OAuth profile's `image` field straight into
 * `prisma.user.create`, but our User model stores it as `avatarUrl`. Wrap the
 * adapter and remap that one field so Google/Microsoft sign-up works.
 */
function buildAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    async createUser(user: AdapterUser) {
      const { image, ...rest } = user;
      const created = await base.createUser!({ ...rest } as AdapterUser);
      if (image) {
        await prisma.user.update({ where: { id: created.id }, data: { avatarUrl: image } });
      }
      return created;
    },
  } as Adapter;
}

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
  adapter: buildAdapter(),
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
        // If a real user row exists for the test email, enrich the fake user
        // with live counts (xp, enrollments, certificates, posts) so the
        // dashboard reflects actual data instead of hardcoded demo numbers.
        if (process.env.NODE_ENV === "development") {
          const testUser = Object.values(TEST_CREDENTIALS).find(
            ({ email, password }) =>
              email === credentials.email && password === credentials.password,
          );
          if (testUser) {
            const realUser = await prisma.user.findUnique({
              where: { email: testUser.email },
              select: {
                id: true,
                name: true,
                role: true,
                status: true,
                xp: true,
                reputationLevel: true,
                _count: { select: { enrollmentsAsAssignee: true, certificates: true, posts: true } },
              },
            });
            if (realUser) {
              return {
                ...testUser.user,
                id: realUser.id,
                name: realUser.name ?? testUser.user.name,
                role: realUser.role,
                status: realUser.status,
                xp: realUser.xp,
                reputationLevel: realUser.reputationLevel,
                enrollmentCount: realUser._count.enrollmentsAsAssignee,
                certificateCount: realUser._count.certificates,
                postCount: realUser._count.posts,
              } as any;
            }
            return testUser.user as any;
          }
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
    // Fires when an OAuth account is first created (first login via OAuth).
    async createUser({ user }) {
      await autoJoinGeneralChannel(user.id);
    },
    // Automatically link OAuth accounts to existing users with the same email.
    // This fixes the "OAuthAccountNotLinked" error when a user first signs up
    // with email/password, then tries to sign in with Microsoft/Google.
    async linkAccount({ user, account, profile }) {
      // Check if an account with this provider already exists for this user
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      });

      // Only link if no account exists for this provider
      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });
      }
    },
  },
  callbacks: {
    // Automatically link OAuth account to existing user with same email
    async signIn({ user, account, profile }) {
      if (!account || !user.email) return true;

      // Check if this OAuth account is already linked
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });

      // If already linked, allow sign in
      if (existingAccount) return true;

      // Check if a user with this email already exists (from another login method)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // If user exists but OAuth account doesn't, link them
      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });
        // Update the user's name and avatar from OAuth if not set
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: existingUser.name || user.name || (profile as any)?.name,
            avatarUrl: existingUser.avatarUrl || user.image || (profile as any)?.picture,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.memberType = (user as any).memberType;
        token.status = (user as any).status;
        token.xp = (user as any).xp ?? 0;
        token.reputationLevel = (user as any).reputationLevel ?? "NEWCOMER";
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
            reputationLevel: true,
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
          token.reputationLevel = dbUser.reputationLevel;
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
        session.user.reputationLevel = token.reputationLevel ?? "NEWCOMER";
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
