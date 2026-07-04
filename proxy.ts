import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/menu/tomorrow": { maxRequests: 60, windowMs: 60_000 },
  "/api/payment/create-order": { maxRequests: 10, windowMs: 60_000 },
  "/api/payment/verify": { maxRequests: 10, windowMs: 60_000 },
};

const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

function rateLimit(key: string, config: { maxRequests: number; windowMs: number }) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs, limit: config.maxRequests };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
    limit: config.maxRequests,
  };
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  addSecurityHeaders(response);

  fixBfcache(response, pathname);

  if (!pathname.startsWith("/api/")) return response;

  const route = Object.keys(RATE_LIMITS).find((r) => pathname.startsWith(r));
  if (!route) return response;

  const result = rateLimit(getIp(request) + ":" + route, RATE_LIMITS[route]);

  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    });
  }

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
}

function fixBfcache(response: NextResponse, pathname: string) {
  if (pathname.startsWith("/api/")) return;
  const cc = response.headers.get("Cache-Control") || "";
  if (cc.includes("no-store")) {
    response.headers.set(
      "Cache-Control",
      cc.replace("no-store", "no-cache")
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
