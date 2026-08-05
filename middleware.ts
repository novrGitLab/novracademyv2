import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ADMIN_ROLES, MANAGER_ROLES } from "@novr/types";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

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
