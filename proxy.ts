import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = [
  "/kitchen/dashboard",
  "/delivery-partner/dashboard",
  "/admin",
];

const roleLoginMap: Record<string, string> = {
  "/kitchen": "/kitchen/login",
  "/delivery-partner": "/delivery-partner/login",
  "/admin": "/admin/2fa",
};

function matchesProtected(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

const PUBLIC_ADMIN_PATHS = ["/admin/2fa", "/admin/2fa-setup"];

const STATIC_EXTENSIONS = /\.(jpg|jpeg|png|webp|avif|svg|ico|css|js|woff2?)$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  if (pathname.startsWith("/_next/static")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return response;
  }

  if (pathname.startsWith("/icons/") || pathname.startsWith("/banners/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return response;
  }

  const matchedPrefix = protectedPaths.find((p) => matchesProtected(pathname, p));
  if (!matchedPrefix) {
    return response;
  }

  if (matchedPrefix === "/admin" && PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return response;
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginPath = roleLoginMap[matchedPrefix];
    if (loginPath) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
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
      if (!sessionRes.ok) {
        // Transient failure (e.g. dev server still compiling/OOM) - let the
        // admin layout handle auth instead of showing a misleading 404.
        return NextResponse.next();
      }
      const session = await sessionRes.json();
      if (!session?.user || session.user.role !== "admin") {
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch {
      // Same as above: never rewrite to /404 on a failed session fetch.
      return NextResponse.next();
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/kitchen/dashboard/:path*",
    "/delivery-partner/dashboard/:path*",
    "/admin/:path*",
  ],
};
