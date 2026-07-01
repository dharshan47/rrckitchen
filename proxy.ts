import { NextResponse } from "next/server";

const CSRF_EXEMPT_PATHS = ["/api/auth/", "/api/webhooks/"];

export function proxy(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // CSRF Protection for mutating requests
  if (
    !CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p)) &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const csrfToken = request.headers.get("x-csrf-token");

    if (!csrfToken || csrfToken !== "1") {
      if (origin && host && !origin.includes(host)) {
        return new NextResponse("CSRF validation failed", { status: 403 });
      }
    }
  }

  const requestHeaders = new Headers(request.headers);

  // Security headers
  requestHeaders.set("x-forwarded-proto", "https");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Add security headers at the proxy boundary
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}
