"use server";

import { prisma } from "@novr/db";
import bcrypt from "bcryptjs";
import { UserStatus, UserRole, MemberType } from "@novr/types";

export async function createUserAccount(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; email?: string }> {
  const { name, email, password } = data;

  // Validate
  if (!name.trim()) return { success: false, error: "Please enter your full name." };
  if (!email.trim()) return { success: false, error: "Please enter your email." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { success: false, error: "Please enter a valid email address." };
  if (password.length < 8)
    return { success: false, error: "Password must be at least 8 characters." };

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      role: UserRole.LEARNER,
      memberType: MemberType.NEW_LEARNER,
      status: UserStatus.ACTIVE,
    },
  });

  return { success: true, email: user.email };
}
