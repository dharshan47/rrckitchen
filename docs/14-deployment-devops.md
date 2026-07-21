# Deployment & DevOps Architecture

> **Status:** Active
> **Last updated:** 2026-07-21
> **Cross-refs:** [System Architecture](01-system-architecture.md), [Observability](12-observability.md), [Testing](13-testing-quality.md)

---

## 1. CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        DEV["Developer pushes<br/>to feature branch"]
    end

    subgraph "CI (GitHub Actions)"
        LINT["Lint + TypeScript"]
        UNIT["Unit Tests"]
        INT["Integration Tests"]
        BUILD["Build Check"]
        AUDIT["Security Audit"]
        BUNDLE["Bundle Analysis"]
    end

    subgraph "Preview"
        PREV["Vercel Preview<br/>Deployment"]
        E2E["E2E Tests<br/>(Playwright)"]
        VISUAL["Visual Regression<br/>(Chromatic)"]
    end

    subgraph "Production"
        APPROVE["Manual Approval"]
        DEPLOY["Vercel Production<br/>Deployment"]
        POST["Post-Deploy<br/>Health Checks"]
    end

    DEV --> LINT
    LINT --> UNIT
    UNIT --> INT
    INT --> BUILD
    BUILD --> AUDIT
    AUDIT --> BUNDLE
    BUNDLE --> PREV
    PREV --> E2E
    PREV --> VISUAL
    E2E --> APPROVE
    VISUAL --> APPROVE
    APPROVE --> DEPLOY
    DEPLOY --> POST
```

---

## 2. Environment Strategy

| Environment | URL | Purpose | Database | Data |
|-------------|-----|---------|----------|------|
| **Development** | `localhost:3000` | Local development | Local PostgreSQL | Fake data (factories) |
| **Preview** | `{branch}.rrc-kitchen.vercel.app` | Feature branch testing | Shared staging DB | Anonymized production |
| **Staging** | `staging.rrc-kitchen.vercel.app` | Pre-release validation | Shared staging DB | Weekly prod sync |
| **Production** | `rrc-kitchen.vercel.app` | Live platform | Production DB | Real data |

### Environment Variables

```bash
# Required in all environments
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
ABLY_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
LOGTAIL_SOURCE_TOKEN=

# Production only
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
SENTRY_AUTH_TOKEN=
```

---

## 3. Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "regions": ["bom1", "sin1"], // Mumbai + Singapore for India users
  "functions": {
    "api/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-sessions",
      "schedule": "0 3 * * *" // Daily at 3 AM IST
    },
    {
      "path": "/api/cron/cleanup-abandoned-carts",
      "schedule": "0 4 * * *" // Daily at 4 AM IST
    },
    {
      "path": "/api/cron/daily-reconciliation",
      "schedule": "0 23 * * *" // Daily at 11 PM IST (end of business)
    },
    {
      "path": "/api/cron/health-check",
      "schedule": "*/5 * * * *" // Every 5 minutes
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ]
}
```

---

## 4. Database Strategy

### Single Database with DATABASE_URL per environment

```bash
# Production
DATABASE_URL="postgres://user:pass@pooled.db.prisma.io:5432/production"

# Staging
DATABASE_URL="postgres://user:pass@pooled.db.prisma.io:5432/staging"

# Development
DATABASE_URL="postgres://user:pass@pooled.db.prisma.io:5432/development"
```

Prisma Data Proxy handles connection pooling. Each environment uses a separate database instance.

### Migration Strategy

```bash
# Production migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### Branching Rules

| Action | Database Strategy |
|--------|-------------------|
| PR opened | Uses staging DB with test data |
| PR merged | Run migrations on staging, verify, then production |
| Hotfix | Same flow — migration on staging first, then production |

---

## 5. Rollback Runbook

### 5.1 Vercel Rollback

```
1. IDENTIFY: Version to rollback to (Vercel dashboard → Deployments)
2. VERIFY: Last known good deployment (check logs, health checks)
3. EXECUTE: Click "⋮" → "Promote to Production" on previous deployment
4. MONITOR: Health checks for 10 minutes after rollback
5. COMMUNICATE: Update #monitoring Slack channel
```

### 5.2 Database Rollback

```bash
# 1. Identify migration to revert
npx prisma migrate status

# 2. Create down migration (write manually if auto not possible)
npx prisma migrate dev --create-only --name revert_bad_migration

# 3. Generate SQL for revert
npx prisma migrate diff --from-schema-datamodel schema_before.prisma \
  --to-schema-datamodel schema.prisma \
  --script > revert.sql

# 4. Execute revert
psql $DATABASE_URL -f revert.sql

# 5. Mark migration as resolved
npx prisma migrate resolve --rolled-back <migration_name>
```

### 5.3 Rollback vs Fix Forward

```mermaid
flowchart TD
    INCIDENT["Production Incident"] --> DECISION{"Can we fix forward<br/>in <30 minutes?"}
    DECISION -->|"Yes"| HOTFIX["Create hotfix PR<br/>(bypass CI? No, run fast CI)"]
    DECISION -->|"No"| ROLLBACK["Revert deployment<br/>via Vercel dashboard"]
    HOTFIX --> DEPLOY["Deploy hotfix"]
    ROLLBACK --> STABLE["Stable version live"]
    DEPLOY --> MONITOR["Monitor for 10 min"]
    STABLE --> POSTMORTEM["Post-mortem<br/>within 24 hours"]
    MONITOR --> POSTMORTEM
```

---

## 6. Cron Jobs

| Job | Schedule | Description | Idempotent? |
|-----|----------|-------------|-------------|
| `cleanup-expired-sessions` | Daily 3 AM IST | Delete sessions past expiry + 30 days | Yes |
| `cleanup-abandoned-carts` | Daily 4 AM IST | Delete cart items older than 7 days | Yes |
| `daily-reconciliation` | Daily 11 PM IST | Reconcile COD collections vs orders | Yes |
| `health-check` | Every 5 min | Health check endpoint → alert if unhealthy | — |

```typescript
// app/api/cron/cleanup-expired-sessions/route.ts
export async function GET() {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: thirtyDaysAgo },
    },
  });

  logger.info('Cleaned up expired sessions', { deletedCount: result.count });
  return Response.json({ deletedCount: result.count });
}
```

---

## 7. Docker Configuration

```dockerfile
# Dockerfile (for local dev consistency)
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build
FROM base AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
```

---

## 8. Disaster Recovery Plan

### 8.1 RTO & RPO

| Metric | Target | Measurement |
|--------|--------|-------------|
| **RTO (Recovery Time Objective)** | <1 hour | Time from incident to system available |
| **RPO (Recovery Point Objective)** | <5 minutes | Maximum data loss on failure |

### 8.2 Failure Scenarios

| Scenario | Impact | Recovery Steps | RTO |
|----------|--------|----------------|-----|
| **Vercel region down** | Users in affected region cannot access | DNS failover to another region | 5 min (automatic) |
| **Database failure** | Full platform outage | Restore from latest backup (Prisma/PostgreSQL) | 30 min |
| **Redis outage** | Rate limiting bypass, cache degraded | Auto-degradation to DB-only | 5 min (automatic) |
| **Ably outage** | No real-time updates | Fallback to polling (Ably fallback transports) | 1 min (automatic) |
| **Razorpay outage** | Online payments fail | Enable COD-only mode via feature flag | 15 min |
| **Twilio outage** | OTP delivery fails | Fallback to app-based TOTP | 15 min |
| **Cloudinary outage** | Images not loading | Show placeholder images | Automatic |
| **Full platform failure** | Complete outage | Vercel rollback + DB restore from backup | 1 hour |

### 8.3 Backup Strategy

| Data | Backup Frequency | Retention | Method |
|------|-----------------|-----------|--------|
| PostgreSQL | Continuous | 7 days (point-in-time) | Provider automatic backups |
| PostgreSQL snapshots | Daily | 30 days | Provider snapshots (e.g., Neon, AWS RDS) |
| Redis data | Not persisted | — | Cache rebuilt from DB |
| Cloudinary images | On upload | Forever | Cloudinary backup |
| Code (git) | Every commit | Forever | GitHub |
| Environment variables | On change | Forever | Vercel + 1Password |
| Admin audit logs | Real-time | 3 years | PostgreSQL |
