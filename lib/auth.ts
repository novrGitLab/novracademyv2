import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@novr/db";
import { GroupType, UserStatus } from "@novr/types";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        if (user.status !== UserStatus.ACTIVE) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberType: user.memberType,
          status: user.status,
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
      }
      if (token.id) {
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
            _count: { select: { enrollmentsAsAssignee: true, certificates: true, posts: true } },
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.memberType = dbUser.memberType;
          token.status = dbUser.status;
          token.xp = dbUser.xp;
          token.enrollmentCount = dbUser._count.enrollmentsAsAssignee;
          token.certificateCount = dbUser._count.certificates;
          token.postCount = dbUser._count.posts;
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
      }
      return session;
    },
  },
};
