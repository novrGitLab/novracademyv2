import { PrismaClient, UserRole, MemberType, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "test@academy.com";
const ADMIN_PASSWORD = "test1234";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Test Admin",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      memberType: MemberType.NEW_LEARNER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`✅ Admin user created/updated: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
