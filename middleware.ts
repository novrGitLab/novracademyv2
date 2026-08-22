import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ADMIN_ROLES, MANAGER_ROLES, UserRole } from "@novr/types";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Super admins land on the admin dashboard, not the learner dashboard
    if (pathname === "/dashboard" && role === UserRole.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(role as any)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/team") && !MANAGER_ROLES.includes(role as any)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/team/:path*"],
};
