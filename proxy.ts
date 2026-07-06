import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = [
  "/kitchen/dashboard",
  "/delivery-partner/dashboard",
  "/admin",
];

const publicAdminPaths = ["/admin/login", "/admin/signup"];

const roleLoginMap: Record<string, string> = {
  "/kitchen": "/kitchen/login",
  "/delivery-partner": "/delivery-partner/login",
  "/admin": "/admin/login",
};

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const matchedPrefix = protectedPaths.find((p) =>
    p === "/admin"
      ? pathname === "/admin" || pathname.startsWith("/admin/")
      : pathname === p || pathname.startsWith(p + "/"),
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (matchedPrefix === "/admin" && publicAdminPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const loginPath = roleLoginMap[matchedPrefix];
  if (loginPath) {
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kitchen/dashboard/:path*",
    "/delivery-partner/dashboard/:path*",
    "/admin/:path*",
  ],
};
