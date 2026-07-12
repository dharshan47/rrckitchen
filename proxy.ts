import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = [
  "/kitchen/dashboard",
  "/delivery-partner/dashboard",
  "/admin",
];

const publicAdminPaths = [
  "/admin/2fa",
  "/admin/2fa-setup",
];

const roleLoginMap: Record<string, string> = {
  "/kitchen": "/kitchen/login",
  "/delivery-partner": "/delivery-partner/login",
};

function matchesProtected(pathname: string, prefix: string): boolean {
  if (prefix === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = protectedPaths.find((p) => matchesProtected(pathname, p));
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (
    matchedPrefix === "/admin" &&
    publicAdminPaths.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    if (matchedPrefix === "/admin") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchedPrefix === "/admin") {
    try {
      const sessionRes = await fetch(
        new URL("/api/auth/get-session", request.url),
        { headers: { cookie: request.headers.get("cookie") ?? "" } }
      );
      if (!sessionRes.ok) return NextResponse.rewrite(new URL("/404", request.url));
      const session = await sessionRes.json();
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.rewrite(new URL("/404", request.url));
      }
    } catch {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
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
