# Observability & Monitoring

> **Status:** Active
> **Last updated:** 2026-07-21
> **Cross-refs:** [Dependencies & Replacements](dependencies-and-replacements.md#9-monitoring-not-present), [System Architecture](01-system-architecture.md)

---

## 1. Current State — No Monitoring

**The codebase currently has zero monitoring infrastructure.** There is no Sentry, Logtail, Datadog, Winston, or Pino. The only observability is bare `console.*` calls scattered across files.

This is a **critical production gap** that must be addressed before going live.

### Current `console.*` Usage

| File | Pattern | Count |
|------|---------|-------|
| `lib/twilio.ts` | `console.log("[TWILIO] Message response:", ...)` | 3 |
| `lib/twilio.ts` | `console.error("[TWILIO] Failed to send SMS:", ...)` | 1 |
| `lib/ably/client.ts` | `console.warn("[Ably] Connection state:", ...)` | 2 |
| `lib/ably/client.ts` | `console.error("[Ably] Failed:", ...)` | 1 |
| `lib/auth-client.ts` | `console.warn("Rate limited. Retrying after", ...)` | 1 |
| `app/api/ably-token/route.ts` | `console.error("[Ably Token] Error:", ...)` | 1 |
| `app/api/cloudinary/delete/route.ts` | `console.error("[Cloudinary] Error:", ...)` | 1 |

---

## 2. Recommended Implementation Plan

### Phase 1 (Pre-Production — 1 day)

Implement a structured logger wrapper to replace all `console.*` calls:

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  error?: unknown;
  [key: string]: unknown;
}

class Logger {
  private format(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, unknown>) {
    const entry = this.format('info', message, meta);
    console.log(JSON.stringify(entry));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    const entry = this.format('warn', message, meta);
    console.warn(JSON.stringify(entry));
  }

  error(message: string, meta?: Record<string, unknown>) {
    const entry = this.format('error', message, meta);
    console.error(JSON.stringify(entry));
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.format('debug', message, meta);
      console.debug(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
```

### Phase 2 (Pre-Production — 1-2 days)

Add error tracking (pick one):

| Option | Install | Setup |
|--------|---------|-------|
| **Sentry** | `npm install @sentry/nextjs` | `npx @sentry/wizard -i nextjs` — auto-configures |
| **Better Stack** | `npm install @betterstack/logging` | Create source → `Logtail` instance in `lib/logtail.ts` |

**Sentry quick setup:**
```bash
npx @sentry/wizard -i nextjs
# Configures sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts
```

### Phase 3 (Production — 1 week)

Add structured log aggregation. Options ranked by ease:

| Service | Integration | Free Tier |
|---------|-------------|-----------|
| **Better Stack (Logtail)** | `@betterstack/logging` — send JSON logs via HTTP | 1GB/mo |
| **Axiom** | `@axiomhq/next` — Next.js plugin, auto-instrumentation | 500GB/mo |
| **Datadog** | `datadog-logs` — forward logs via HTTP | 1M log events/mo |
| **Grafana Loki** | Self-hosted or Grafana Cloud | Free tier (Grafana Cloud) |

---

## 3. What to Log

### 3.1 Business Events (ALWAYS log)

| Event | Level | Fields |
|-------|-------|--------|
| Order placed | `info` | `orderId, userId, amount, paymentMethod` |
| Payment success | `info` | `orderId, paymentId, amount, method` |
| Payment failed | `warn` | `orderId, errorCode, amount, method` |
| Refund processed | `info` | `orderId, refundId, amount, reason` |
| User signup | `info` | `userId, role, phone` |
| Admin login | `info` | `adminId, ipAddress` |
| Kitchen KYC approved | `info` | `kitchenId, adminId` |
| Payout processed | `info` | `payoutId, kitchenId, amount` |

### 3.2 Error Events (ALWAYS capture)

| Event | Severity | Action |
|-------|----------|--------|
| External API failure (Twilio, Razorpay, Ably) | High | Retry + alert |
| Database connection failure | Critical | Alert immediately |
| Auth verification failure | Medium | Log context |
| Rate limit triggered | Low | Log for monitoring |
| Unhandled exceptions | Critical | Capture stack trace |

### 3.3 Performance Events (OPTIONAL)

| Event | Fields |
|-------|--------|
| Server Action duration | `actionName, duration, success` |
| API Route duration | `path, method, duration, status` |
| External API call duration | `service, endpoint, duration` |
| DB query duration (slow queries) | `model, operation, duration` |

---

## 4. Error Tracking Integration Points

### 4.1 Server Actions

```typescript
// Pattern for all Server Actions
export async function placeOrder(data: OrderInput) {
  const start = Date.now();
  try {
    // ... business logic
    logger.info('Order placed', { orderId, userId, amount });
    return { success: true, orderId };
  } catch (error) {
    logger.error('Failed to place order', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
    throw error; // Let Next.js error boundary handle it
  }
}
```

### 4.2 API Routes

```typescript
// Pattern for API routes
export async function POST(request: Request) {
  try {
    // ... handler logic
  } catch (error) {
    logger.error('API route failed', {
      path: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### 4.3 Client-Side

```typescript
// Wrap TanStack Query mutations
const mutation = useMutation({
  mutationFn: addToCart,
  onError: (error) => {
    logger.error('Add to cart failed', { itemId, error: error.message });
  },
});
```

---

## 5. Monitoring Dashboard (Recommended)

Once logging is implemented, set up dashboards for:

### Real-Time Dashboard
- **Errors/min** — Count of `error` level logs
- **Order rate** — Orders per minute
- **Payment success rate** — % of successful payments
- **API latency** — p50/p95/p99 of Server Actions and API Routes

### Daily Dashboard
- **DAU** — Daily active users (from auth logs)
- **Order volume** — Total orders
- **Revenue** — Total collected
- **Error breakdown** — By service (Twilio, Razorpay, Ably, etc.)

---

## 6. Alerting Rules (Recommended)

| Condition | Severity | Notify |
|-----------|----------|--------|
| >5 errors in 5 minutes | Critical | SMS + Slack |
| Payment failure rate >10% | Critical | SMS + Slack |
| External API latency >2s p95 | High | Slack |
| OTP send failure rate >5% | High | Slack |
| Rate limit triggered >50 times/hour | Medium | Slack (daily digest) |

---

## 7. Audit Logging (Already Implemented)

The `AdminAuditLog` model in PostgreSQL logs all admin actions:

```prisma
model AdminAuditLog {
  id         String   @id @default(cuid())
  adminId    String
  action     String   // e.g., "UPDATE_ORDER_STATUS"
  entityType String   // e.g., "order"
  entityId   String
  before     Json     // Previous state (PII redacted)
  after      Json     // New state (PII redacted)
  ipAddress  String
  createdAt  DateTime @default(now())
}
```

This is the **only observability currently implemented**. It captures admin actions with PII redaction.

---

## 8. Production Readiness Checklist

- [ ] Add structured logger (`lib/logger.ts`)
- [ ] Replace all `console.*` calls with `logger.*`
- [ ] Add error tracking (Sentry or alternative)
- [ ] Add log aggregation (Better Stack, Axiom, or Datadog)
- [ ] Set up alerting for critical errors
- [ ] Add health check endpoint (`GET /api/health`)
- [ ] Configure `next.config.ts` `removeConsole` for production (currently strips all console output!)
