// Test credentials for development/testing only.
// These users bypass database authentication and must never be enabled in production.
export const TEST_CREDENTIALS = {
  // Regular Learner
  learner: {
    email: "test@novr.academy",
    password: "Test1234!",
    user: {
      id: "test-learner-001",
      email: "test@novr.academy",
      name: "Test Learner",
      role: "LEARNER",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      xp: 1250,
      enrollmentCount: 3,
      certificateCount: 1,
      postCount: 5,
    },
  },
  // Admin User
  admin: {
    email: "admin@novr.academy",
    password: "Admin1234!",
    user: {
      id: "test-admin-001",
      email: "admin@novr.academy",
      name: "Admin User",
      role: "SUPER_ADMIN",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      xp: 5000,
      enrollmentCount: 10,
      certificateCount: 5,
      postCount: 25,
    },
  },
  // Manager User
  manager: {
    email: "manager@novr.academy",
    password: "Manager1234!",
    user: {
      id: "test-manager-001",
      email: "manager@novr.academy",
      name: "Team Manager",
      role: "MANAGER",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      xp: 3000,
      enrollmentCount: 7,
      certificateCount: 3,
      postCount: 15,
    },
  },
  // CyberNovr Admin (Content Manager)
  cybernovrAdmin: {
    email: "content@novr.academy",
    password: "Content1234!",
    user: {
      id: "test-cybernovradmin-001",
      email: "content@novr.academy",
      name: "Content Admin",
      role: "CYBERNOVR_ADMIN",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      xp: 5000,
      enrollmentCount: 10,
      certificateCount: 5,
      postCount: 25,
    },
  },
  // Organization Admin
  orgAdmin: {
    email: "orgadmin@novr.academy",
    password: "OrgAdmin1234!",
    user: {
      id: "test-orgadmin-001",
      email: "orgadmin@novr.academy",
      name: "Org Admin User",
      role: "ORG_ADMIN",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      tenantType: "ORGANIZATION",
      xp: 4000,
      enrollmentCount: 8,
      certificateCount: 4,
      postCount: 20,
    },
  },
  // Institution Admin
  instAdmin: {
    email: "instadmin@novr.academy",
    password: "InstAdmin1234!",
    user: {
      id: "test-instadmin-001",
      email: "instadmin@novr.academy",
      name: "Institution Admin User",
      role: "INSTITUTION_ADMIN",
      memberType: "INDIVIDUAL",
      status: "ACTIVE",
      xp: 4000,
      enrollmentCount: 8,
      certificateCount: 4,
      postCount: 20,
    },
  },
} as const;
