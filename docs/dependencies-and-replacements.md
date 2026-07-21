# Dependencies & Replacements Guide

> **Status:** Active
> **Last updated:** 2026-07-21
> **Purpose:** Documents every external service actually used, how it's integrated, API key locations, and how to replace each with alternatives.

---

## 1. How to Read This Document

Each dependency has:

| Section | Description |
|---------|-------------|
| **What we use** | The actual service, version, and features used |
| **Integration files** | Where the service is initialized and called |
| **API keys / credentials** | Which env vars, format, where they're used |
| **Replacement options** | Alternative services with migration effort |
| **Replacement guide** | Step-by-step for swapping to an alternative |

---

## 2. Core Infrastructure

### 2.1 Database: Prisma + PostgreSQL (Prisma Data Proxy)

**What we use:**
- **ORM:** Prisma v7 (`@prisma/client`, `@prisma/adapter-pg`)
- **Database:** PostgreSQL hosted via Prisma Data Proxy (`pooled.db.prisma.io`)
- **Connection:** Pooled via `PrismaPg` adapter in `lib/prisma.ts`
- **Client:** Singleton pattern with global caching

**Integration files:**
- `lib/prisma.ts` — Client init with `PrismaPg` adapter, `connectionString: process.env.DATABASE_URL`
- `prisma.config.ts` — Prisma config with schema path and migration tracking
- `prisma/schema.prisma` — Full schema (45+ models)
- Used in ALL `actions/` files and `app/api/` routes

**Credentials:**
```bash
# .env
DATABASE_URL="postgres://<user>:<password>@<host>:5432/<database>?sslmode=require"
# Format: postgres://user:password@host:port/db
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Neon (Serverless Postgres)** | Low | Serverless, branching, pooling built-in | Different connection string format |
| **Supabase Postgres** | Medium | Auth + storage included | Different pooler config |
| **AWS RDS PostgreSQL** | High | Full control, VPC isolation | Provisioned, auto-scaling limited |
| **PlanetScale (MySQL)** | High (different SQL) | Serverless, branching | MySQL vs PostgreSQL differences |
| **SQLite (Turso)** | Very High | Edge-ready, low latency | SQLite limitations, no PG features |

**Replacement guide (Neon):**
```bash
# 1. Create Neon project, get connection string
# 2. Update .env
DATABASE_URL="postgres://<user>:<password>@ep-<project>.us-east-2.aws.neon.tech/neondb?sslmode=require"
# 3. Prisma adapter already uses @prisma/adapter-pg — no code change needed
# 4. Verify connection
npx prisma db push
```

---

### 2.2 Auth: Better-Auth

**What we use:**
- **Library:** `better-auth` v1.6.22
- **Features:** Email+password, phone OTP (via Twilio), admin roles, TOTP 2FA, rate limiting
- **Setup:** Server in `lib/auth.ts`, client in `lib/auth-client.ts`
- **API routes:** `app/api/auth/[...all]/route.ts` — Next.js handler

**Integration files:**
- `lib/auth.ts` — Server `betterAuth()` with `prismaAdapter`, plugins (`phoneNumber`, `admin`, `twoFactor`)
- `lib/auth-client.ts` — Client `createAuthClient()` with `phoneNumberClient`, `adminClient`, `twoFactorClient`
- `lib/auth-guards.ts` — `requireAdmin()`, `requirePermission()` server guards
- `app/api/auth/[...all]/route.ts` — Next.js handler

**Credentials:**
```bash
# .env
BETTER_AUTH_SECRET=<random-secret-32-chars>
BETTER_AUTH_API_KEY=<better-auth-api-key>
BETTER_AUTH_URL=http://localhost:3000
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **NextAuth (Auth.js)** | High | Large community, many providers | No built-in phone OTP or 2FA |
| **Clerk** | Medium | Hosted, feature-rich, fast integration | Vendor lock-in, cost scales |
| **Supabase Auth** | Medium | Free tier, integrated | Not using Supabase DB, phone OTP needs extra config |
| **Firebase Auth** | Medium | Phone OTP built-in, free tier | Google ecosystem lock-in |

**Replacement guide (Auth.js):**
```bash
# 1. Install
npm uninstall better-auth
npm install next-auth@beta @auth/prisma-adapter

# 2. Create auth.ts with NextAuth config
# 3. Implement phone OTP via custom provider (Twilio SMS)
# 4. Implement TOTP 2FA via custom adapter
# 5. Update middleware.ts for session handling
# 6. Update all hooks (usePhoneAuth, useSignUp, etc.)
# 7. Remove lib/auth.ts, lib/auth-client.ts, lib/auth-guards.ts
```
**Migration effort: ~2 weeks**

---

## 3. Payments

### 3.1 Online Payments: Razorpay

**What we use:**
- **Library:** `razorpay` v2.9.6 (server SDK)
- **Client checkout:** Razorpay Checkout.js loaded via `<script>` in `app/layout.tsx`
- **Features:** Order creation, payment verification (HMAC), refunds, webhooks
- **Payouts (RazorpayX):** Kitchen & delivery partner payouts via `razorpay.payouts.create()`

**Integration files:**
- `lib/razorpay.ts` — Server client init with `key_id`, `key_secret`
- `hooks/useRazorpay.ts` — Client checkout modal, loads `checkout.razorpay.com/v1/checkout.js`
- `actions/payments/payment.ts` — Create order, verify, refund, fail
- `actions/payments/refund.ts` — Refund lifecycle
- `actions/payouts/kitchen-payout.ts` — Kitchen payouts (RazorpayX)
- `actions/payouts/delivery-payout.ts` — Delivery partner payouts (RazorpayX)

**Credentials:**
```bash
# .env
RAZORPAY_KEY_ID=rzp_<test_or_live>_<random>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_<test_or_live>_<random>
RAZORPAY_WEBHOOK_SECRET=<webhook-secret-string>
# NOTE: RAZORPAYX_ACCOUNT_NUMBER is referenced in code but NOT in .env — must be added
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Stripe** | High | Global, well-documented, powerful API | No COD, FX charges for INR |
| **PayU** | Medium | Indian market, PCI SAQ A | Less developer-friendly API |
| **PhonePe PG** | Medium | Indian UPI-first | Limited feature set |
| **Cashfree** | Medium | Indian market, good docs | Smaller ecosystem |

**Replacement guide (Stripe):**
```bash
# 1. Install
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# 2. Create lib/stripe.ts — init Stripe server + client
# 3. Rewrite actions/payments/payment.ts — PaymentIntent create/confirm/verify
# 4. Rewrite hooks/useRazorpay.ts → useStripe.ts — Stripe Elements or Checkout
# 5. Rewrite actions/payouts/* — Stripe Connect for marketplace payouts
# 6. Remove lib/razorpay.ts
```
**Migration effort: ~3-4 weeks** (payouts are complex)

---

## 4. Real-Time

### 4.1 WebSocket Messaging: Ably

**What we use:**
- **Library:** `ably` v2.23.0 (REST server + Realtime client)
- **Features:** Order status (publish/subscribe), delivery location (broadcast), kitchen notifications, token auth
- **Server:** `lib/ably/server.ts` — `Ably.Rest` singleton using API key
- **Client:** `lib/ably/client.ts` — `Ably.Realtime` with token auth via `/api/ably-token`

**Integration files:**
- `lib/ably/server.ts` — REST singleton
- `lib/ably/client.ts` — Realtime client with token auth
- `app/api/ably-token/route.ts` — Token auth endpoint (15-min TTL, channel capabilities per role)
- `hooks/useAblySubscribe.ts` — React hooks: `useAblySubscribe`, `useAblyOrderChannel`, `useAblyKitchenChannel`
- Published from: `actions/orders/orders.ts`, `actions/payments/payment.ts`, `actions/dispatch/`, `app/api/rider/location/`

**Credentials:**
```bash
# .env
ABLY_API_KEY=<appId>.<keyName>:<keySecret>
# Format: <appId>.<keyName>:<keySecret>
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Pusher** | Medium | Similar API, well-documented | No presence without additional cost |
| **Socket.io (self-hosted)** | High | Open source, full control | Sticky sessions on Vercel, operational overhead |
| **Supabase Realtime** | Medium | Integrated if switching DB | PostgreSQL replication based |
| **Firebase Realtime DB** | High | Google infra, free tier | No pub/sub, document-based |

**Replacement guide (Pusher):**
```bash
# 1. Install
npm install pusher @pusher/push-notifications

# 2. Create lib/pusher/server.ts, lib/pusher/client.ts
# 3. Rewrite app/api/ably-token → app/api/pusher/auth
# 4. Rewrite hooks/useAblySubscribe → hooks/usePusherSubscribe
# 5. Update all publish calls (order status, location, dispatch)
# 6. Remove lib/ably/
```
**Migration effort: ~2 weeks**

---

## 5. Media & Images

### 5.1 Image Storage & CDN: Cloudinary

**What we use:**
- **Libraries:** `cloudinary` v2.10.0 (server), `next-cloudinary` v6.17.5 (client)
- **Features:** Signed uploads (server-generated signature), image deletion, menu item photos
- **Server config:** `actions/admin/admin-menu.ts` — `v2 as cloudinary` with API key/secret
- **Client upload:** `components/patterns/cloudinary-upload.tsx` — TanStack Query for signature, direct upload via fetch
- **Display:** Via `next/image` with Cloudinary remotePatterns in `next.config.ts`

**Integration files:**
- `actions/admin/admin-menu.ts` — Server-side cloudinary config, image delete
- `app/api/cloudinary/sign/route.ts` — Generate upload signature
- `app/api/cloudinary/delete/route.ts` — Delete image by publicId
- `components/patterns/cloudinary-upload.tsx` — Client upload widget

**Credentials:**
```bash
# .env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<api-key>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<upload-preset-name>
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **AWS S3 + CloudFront** | High | Full control, any CDN, durable | Complex setup, no auto-transform |
| **Cloudflare Images** | Medium | Lower cost, Edge CDN | Limited transformation options |
| **Uploadthing** | Low | Next.js-native, simple setup | Vendor lock-in, cost at scale |
| **Supabase Storage** | Medium | Integrated if using Supabase | Limited CDN |

**Replacement guide (Uploadthing):**
```bash
# 1. Install
npm install uploadthing @uploadthing/react

# 2. Create app/api/uploadthing/core.ts
# 3. Create components/uploadthing-upload.tsx
# 4. Update image URLs in DB to Uploadthing URLs
# 5. Update next.config.ts remotePatterns
# 6. Remove cloudinary-upload.tsx and cloudinary API routes
```
**Migration effort: ~1 week**

---

## 6. Maps & Location

### 6.1 Map Rendering: Leaflet + MapTiler

**What we use:**
- **Libraries:** `leaflet` v1.9.4, `react-leaflet` v5.0.0 (types only — leaflet imported dynamically)
- **Tile provider:** MapTiler (`api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key={API_KEY}`)
- **Geocoding:** Geoapify (forward + reverse geocode)
- **Routing:** OpenRouteService (driving directions + ETA)
- **Maps bounded to:** Thanjavur district

**Integration files:**
- `components/map/thanjavur-map.tsx` — Leaflet map with MapTiler tiles
- `components/map/live-order-tracking-map.tsx` — Live rider tracking with ETA
- `app/api/geocode/search/route.ts` — Geoapify forward geocode
- `app/api/geocode/reverse/route.ts` — Geoapify reverse geocode
- `app/api/route/road-route/route.ts` — OpenRouteService directions

**Credentials:**
```bash
# .env
NEXT_PUBLIC_MAPTILER_KEY=<maptiler-api-key>
GEOAPIFY_API_KEY=<geoapify-api-key>
ORS_API_KEY=<openrouteservice-jwt-token>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-key>  # ❌ DEAD — defined but not used anywhere in code
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Mapbox** | Medium | Map tiles + geocoding + routing all-in-one | Cost scales with usage |
| **Google Maps Platform** | High | Complete solution (maps, geocode, routes) | Expensive, API key required, usage limits |
| **OpenStreetMap (free tiles)** | Low | Free | No SLA, rate-limited |

**Replacement guide (Mapbox — all-in-one):**
```bash
# 1. Sign up for Mapbox — get access token
# 2. Update .env — remove MAPTILER_KEY, GEOAPIFY_API_KEY, ORS_API_KEY
# 3. Add NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
# 4. Update thanjavur-map.tsx — use Mapbox GL JS + mapbox-gl-leaflet
# 5. Update geocode routes — use Mapbox Geocoding API
# 6. Update routing — use Mapbox Directions API
# 7. Update CSP to allow *.mapbox.com
```
**Migration effort: ~1 week**

---

## 7. Communications

### 7.1 SMS / OTP: Twilio

**What we use:**
- **Library:** `twilio` v6.0.2
- **Features:** SMS OTP via Twilio Verify API, templated messages via Twilio Content API, fallback direct SMS
- **Auth flow:** Better Auth `phoneNumber` plugin calls `sendOtpSms()`

**Integration files:**
- `lib/twilio.ts` — Sending SMS: `sendSms()`, `sendOtpSms()` with Verify API
- `app/api/auth/twilio/send/route.ts` — Send OTP endpoint
- `app/api/auth/twilio/verify/route.ts` — Verify OTP endpoint
- `hooks/usePhoneAuth.ts` — Client hooks calling Twilio endpoints

**Credentials:**
```bash
# .env
TWILIO_ACCOUNT_SID=AC<32-hex-chars>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=+<country-code><number>
TWILIO_VERIFY_SERVICE_SID=VA<32-hex-chars>
TWILIO_MESSAGING_SERVICE_SID=MG<32-hex-chars>
TWILIO_CONTENT_SID=HX<32-hex-chars>
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **MSG91** | Medium | Indian provider, lower cost, DLT templates | Different API |
| **AWS SNS** | Medium | Integrated with AWS infra | No OTP verification service |
| **Vonage (Nexmo)** | Medium | Global reach, Verify API | Higher cost |

**Replacement guide (MSG91):**
```bash
# 1. Sign up for MSG91, set up DLT templates
# 2. Install
npm install msg91

# 3. Rewrite lib/twilio.ts → lib/msg91.ts
# 4. Update OTP sending with MSG91 OTP API
# 5. Update app/api/auth/twilio/* → msg91 routes
# 6. Remove lib/twilio.ts and twilio routes
```
**Migration effort: ~1 week**

---

### 7.2 Push Notifications: Web Push (VAPID)

**What we use:**
- **Library:** `web-push` v3.6.7
- **Features:** VAPID-based push, subscription management, delivery-partner notifications

**Integration files:**
- `lib/notification.ts` — VAPID setup, `sendPushNotification()`, `sendPushToDeliveryPartners()`
- `app/api/push/subscribe/route.ts` — Subscribe/unsubscribe endpoint
- Service worker handles push events

**Credentials:**
```bash
# .env
VAPID_PUBLIC_KEY="<base64-encoded-public-key>"
VAPID_PRIVATE_KEY="<base64-encoded-private-key>"
```

**Replacement options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Firebase Cloud Messaging** | Medium | Reliable, cross-platform, no VAPID setup | Google dependency, requires service worker changes |
| **OneSignal** | Medium | Multi-platform, analytics dashboard | Vendor lock-in, SDK overhead |
| **Pushpad** | Low | Simple REST API, same VAPID standard | Smaller scale |

**Replacement guide (FCM):**
```bash
# 1. Firebase project → Cloud Messaging → get server key
# 2. Install
npm install firebase

# 3. Create lib/firebase-messaging.ts
# 4. Rewrite lib/notification.ts — use FCM REST API for server-side send
# 5. Update service worker to handle FCM push
# 6. Update app/api/push/subscribe to store FCM tokens
```
**Migration effort: ~1 week**

---

## 8. Caching (UNUSED)

### 8.1 Upstash Redis — Initialized but Unused

**Current state:** `lib/redis.ts` creates a `Redis.fromEnv()` client but **no file in the codebase imports or calls it**. It's dead code.

```typescript
// lib/redis.ts — NEVER IMPORTED ANYWHERE
import { Redis } from "@upstash/redis";
export const redis = Redis.fromEnv();
```

**Credentials:**
```bash
# .env
UPSTASH_REDIS_REST_URL="https://<random>.upstash.io"
UPSTASH_REDIS_REST_TOKEN="<redis-rest-token>"
```

**Options:**

| Option | Description |
|--------|-------------|
| **Remove entirely** | If caching won't be added soon |
| **Keep + implement caching** | Add Redis calls for: rate limiting, menu cache, session cache, OTP cooldown |
| **Replace with Vercel KV** | Drop-in replacement, same API (uses Upstash under the hood) |

**To implement caching:**
```typescript
// In actions/kitchen/detail.ts
import { redis } from '@/lib/redis';

export async function getKitchenDetail(slug: string) {
  const cacheKey = `kitchen:${slug}:detail`;
  
  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string);
  
  // Fetch from DB
  const data = await queryDatabase(slug);
  
  // Set cache (60s TTL)
  await redis.set(cacheKey, JSON.stringify(data), { ex: 60 });
  
  return data;
}
```

---

## 9. Monitoring (NOT PRESENT)

**Current state:** The codebase has **zero monitoring**. No Sentry, Logtail, Datadog, Winston, or Pino. Only bare `console.log`, `console.warn`, `console.error` scattered across files.

**Files with console.* calls:**
- `lib/twilio.ts` — `console.log("[TWILIO] ...")`, `console.error("[TWILIO] ...")`
- `lib/ably/client.ts` — `console.warn("[Ably] ...")`, `console.error("[Ably] ...")`
- `lib/auth-client.ts` — `console.warn("Rate limited. ...")`
- `app/api/ably-token/route.ts` — `console.error("[Ably Token] ...")`
- `app/api/cloudinary/delete/route.ts` — `console.error("[Cloudinary] ...")`

**Production-required monitoring tools:**

| Option | Effort | Features | Free Tier |
|--------|--------|----------|-----------|
| **Sentry** | Low | Error tracking, performance, replay | 5K events/mo |
| **Better Stack (Logtail)** | Low | Structured logging, alerts | 1GB/mo |
| **Datadog** | High | APM, logs, metrics, traces | 1M log events/mo |
| **OpenTelemetry** | High | Vendor-neutral, traces + metrics | Free (self-hosted) |
| **Axiom** | Medium | Serverless-friendly, Next.js plugin | 500GB ingest/mo |

**Quick implementation (Sentry + structured logger):**
```bash
# 1. Install
npm install @sentry/nextjs @betterstack/logging

# 2. Create lib/logger.ts
export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, meta);
    // Add Sentry here when configured
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(`[${new Date().toISOString()}] INFO: ${message}`, meta);
  },
};

// 3. Replace all console.* calls with logger.*
```

---

## 10. Background Jobs (NOT PRESENT)

**Current state:** No cron jobs, queues, or background workers exist. All operations are synchronous within request handlers.

**Use cases that need background processing:**
- COD reconciliation (daily)
- Session cleanup (daily)
- Abandoned cart cleanup (daily)
- Payout processing (async)
- Payment webhook retries

**Options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Vercel Cron Jobs** | Low | Built-in, no infra | 30s timeout, no retry |
| **Inngest** | Medium | Serverless-native, retries, queues | Cost at scale |
| **Bull + Redis** | High | Full control, persistent queues | Need Redis host, worker infra |

---

## 11. Email (NOT PRESENT)

**Current state:** No transactional email service. The only email is `mailto:support@rrckitchen.com` links.

**Use cases that need email:**
- Admin invite emails
- Order confirmation receipts
- Kitchen payout notifications
- Password reset (if enabled)

**Options:**

| Option | Effort | Pros | Cons |
|--------|--------|------|------|
| **Resend** | Low | Next.js-native, React Email support | Newer service |
| **SendGrid** | Medium | Reliable, high deliverability | Setup complexity |
| **AWS SES** | Medium | Low cost, high throughput | Domain verification required |

---

## 12. Full Dependency Map

```mermaid
graph TB
    subgraph "Production Services"
        PG[("Prisma + PostgreSQL<br/>pooled.db.prisma.io")]
        BA["Better-Auth<br/>Email + Phone OTP + 2FA"]
        RZ["Razorpay + RazorpayX<br/>Payments + Payouts"]
        AB["Ably<br/>Real-time WebSocket"]
        CL["Cloudinary<br/>Image CDN"]
        TW["Twilio<br/>SMS OTP"]
        WP["Web Push (VAPID)<br/>Push notifications"]
        ML["MapTiler<br/>Map tiles"]
        GA["Geoapify<br/>Geocoding"]
        OR["OpenRouteService<br/>Routing + ETA"]
        LF["Leaflet<br/>Map rendering"]
    end

    subgraph "Not Used (Dead Config)"
        GM["Google Maps API Key<br/>Defined in .env but unused"]
        RS["Upstash Redis<br/>Initialized but never called"]
    end

    subgraph "Missing (Production Gap)"
        MON["Monitoring<br/>No Sentry/Logtail/Datadog"]
        LOG["Structured Logging<br/>Only console.* calls"]
        CRON["Background Jobs<br/>No cron/queues"]
        EMAIL["Email Service<br/>No transactional email"]
    end

    subgraph "Client Libraries (Free/No Keys)"
        Z["Zustand v5<br/>Client state"]
        TQ["TanStack Query v5<br/>Server state"]
        RC["Recharts<br/>Charts"]
        LH["Leaflet<br/>Map UI"]
        RH["React Hook Form v7<br/>Forms"]
    end
```

---

## 13. Env Var Cleanup Guide

| Variable | Status | Action |
|----------|--------|--------|
| `DATABASE_URL` | Active | Keep |
| `BETTER_AUTH_SECRET` | Active | Keep |
| `BETTER_AUTH_API_KEY` | Active | Keep |
| `BETTER_AUTH_URL` | Active | Keep |
| `RAZORPAY_KEY_ID` | Active | Keep |
| `RAZORPAY_KEY_SECRET` | Active | Keep |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Active | Keep |
| `RAZORPAY_WEBHOOK_SECRET` | Active | Keep |
| `RAZORPAYX_ACCOUNT_NUMBER` | **Missing from .env** | **Add to .env** |
| `NEXT_PUBLIC_APP_URL` | Active | Keep |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Active | Keep |
| `CLOUDINARY_API_KEY` | Active | Keep |
| `CLOUDINARY_API_SECRET` | Active | Keep |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Active | Keep |
| `UPSTASH_REDIS_REST_URL` | **Unused** | Remove or implement usage |
| `UPSTASH_REDIS_REST_TOKEN` | **Unused** | Remove or implement usage |
| `ABLY_API_KEY` | Active | Keep |
| `ORS_API_KEY` | Active | Keep |
| `GEOAPIFY_API_KEY` | Active | Keep |
| `NEXT_PUBLIC_MAPTILER_KEY` | Active | Keep |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Dead** | **Remove** (unused) |
| `VAPID_PUBLIC_KEY` | Active | Keep |
| `VAPID_PRIVATE_KEY` | Active | Keep |
| `TWILIO_ACCOUNT_SID` | Active | Keep |
| `TWILIO_AUTH_TOKEN` | Active | Keep |
| `TWILIO_PHONE_NUMBER` | Active | Keep |
| `TWILIO_VERIFY_SERVICE_SID` | Active | Keep |
| `TWILIO_MESSAGING_SERVICE_SID` | Active | Keep |
| `TWILIO_CONTENT_SID` | Active | Keep |
