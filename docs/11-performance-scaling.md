# Performance & Scaling Architecture

> **Status:** Active
> **Last updated:** 2026-07-21
> **Cross-refs:** [System Architecture](01-system-architecture.md), [PWA & Offline](10-pwa-offline.md), [Observability](12-observability.md)

---

## 1. Performance Budgets

| Metric | Budget (Mobile) | Budget (Desktop) | Measurement |
|--------|----------------|-----------------|-------------|
| **TTFB (Time to First Byte)** | <800ms p95 | <400ms p95 | Vercel Analytics |
| **FCP (First Contentful Paint)** | <1.5s | <1.0s | Lighthouse |
| **LCP (Largest Contentful Paint)** | <2.5s | <2.0s | Lighthouse |
| **TBT (Total Blocking Time)** | <200ms | <100ms | Lighthouse |
| **CLS (Cumulative Layout Shift)** | <0.1 | <0.1 | Lighthouse |
| **SI (Speed Index)** | <3.5s | <2.5s | Lighthouse |
| **Bundle size (JS gzipped)** | <150KB initial | <150KB initial | Next.js bundle analyzer |
| **Bundle size (CSS gzipped)** | <15KB initial | <15KB initial | Next.js bundle analyzer |
| **Image weight per page** | <500KB | <1MB | Lighthouse |
| **API response time** | <200ms p95 | <200ms p95 | Vercel Analytics |
| **Ably message latency** | <100ms p95 | <100ms p95 | Ably dashboard |
| **First Input Delay** | <100ms | <50ms | Web Vitals library |

---

## 2. Caching Architecture

```mermaid
graph TB
    subgraph "CDN Layer (Vercel Edge)"
        EC["Edge Cache<br/>Static assets: 30d<br/>HTML (ISR): stale-while-revalidate"]
    end

    subgraph "Next.js Layer"
        RSC["React Server Components<br/>No JS for static content"]
        ISR["Incremental Static Regeneration<br/>Kitchen pages: revalidate 60s"]
        SW["Service Worker<br/>Cache-first: static<br/>Network-first: pages"]
    end

    subgraph "Application Cache"
        RC["Redis (Upstash)<br/>Kitchen detail: 60s TTL<br/>Menu items: 30s TTL<br/>User profile: 300s TTL<br/>OTP rate limits: 60s TTL"]
        TQ["TanStack Query Cache<br/>Menu data: staleTime 30s<br/>Wishlist: staleTime 30s<br/>Profile: staleTime Infinity"]
    end

    subgraph "Database Layer"
        PG["PostgreSQL<br/>Prisma Data Proxy pool"]
    end

    subgraph "External CDN"
        CI["Cloudinary CDN<br/>f_auto + q_auto<br/>Responsive breakpoints"]
    end

    User["Client Browser"] --> EC
    EC --> RSC
    EC --> ISR
    SW --> EC
    RSC --> RC
    RSC --> TQ
    RC --> PG
    TQ --> RC
    User --> CI
    User --> SW
```

---

## 3. Caching Strategy Details

| Layer | Type | Key | TTL | Invalidation |
|-------|------|-----|-----|--------------|
| **CDN** | Static assets | File hash in URL | 30 days | URL change on rebuild |
| **CDN** | HTML (ISR) | Kitchen slug | 60s SWR | `revalidatePath()` on menu change |
| **Redis** | Kitchen detail | `kitchen:{slug}:detail` | 60s | Manual invalidation on menu update |
| **Redis** | Menu items | `menu:{aliasId}:items` | 30s | Manual invalidation on item CRUD |
| **Redis** | User profile | `user:{id}:profile` | 300s | Manual invalidation on profile update |
| **Redis** | Coupon | `coupon:{code}` | 120s | Manual invalidation on coupon edit |
| **Redis** | Avg rating | `rating:{aliasId}` | 300s | Manual invalidation on new review |
| **TanStack** | Menu data | Query key object | 30s stale | `invalidateQueries()` on mutation |
| **TanStack** | Wishlist | `['wishlist']` | 30s stale | `invalidateQueries()` on toggle |
| **TanStack** | Profile | `['profile']` | Infinity | `invalidateQueries()` on update |
| **TanStack** | Orders | `['orders']` | 0 (always fresh) | Manual refetch |
| **SW (Cache)** | JS/CSS | URL | 30 days | SW update on build |
| **SW (Cache)** | HTML | Page URL | 24h | Network-first always tries network |
| **Cloudinary** | Images | Public ID | 30 days | Purge on Cloudinary dashboard |

---

## 4. Image Optimization Strategy

```typescript
// Cloudinary transformation parameters
const IMAGE_TRANSFORMS = {
  menuCard: 'w_320,h_240,c_fill,f_auto,q_auto',           // 320×240 thumbnail
  menuCard2x: 'w_640,h_480,c_fill,f_auto,q_auto',         // Retina
  hero: 'w_768,h_432,c_fill,f_auto,q_auto',               // Hero banner
  kitchenLogo: 'w_96,h_96,c_fill,f_auto,q_auto',          // Kitchen avatar
  reviewPhoto: 'w_400,h_400,c_fill,f_auto,q_auto',        // Review image
  ogImage: 'w_1200,h_630,c_fill,f_auto,q_auto',           // Open Graph
};
```

### Image Loading Strategy

| Type | Loading | Sizes | Priority |
|------|---------|-------|----------|
| Hero kitchen image | `eager` | `(max-width: 768px) 100vw, 768px` | High |
| Menu card thumbnail | `lazy` | `(max-width: 768px) 50vw, 320px` | Low |
| Kitchen logo | `eager` | `96px` | High |
| Gallery photos | `lazy` | `(max-width: 768px) 100vw, 400px` | Low |
| OG image (meta) | `eager` | `1200px` | High |

---

## 5. Bundle Optimization

### Current Bundle Breakdown

```mermaid
pie title Initial JS Bundle (~140KB gzipped)
    "React + Next.js" : 45
    "TanStack Query" : 15
    "Zustand + middleware" : 5
    "Razorpay Checkout" : 8
    "Ably SDK" : 12
    "React Hook Form + Zod" : 10
    "Radix UI Primitives" : 15
    "Application code" : 30
    "Lucide Icons" : 5
```

### Optimization Techniques

| Technique | Applied | Savings | Implementation |
|-----------|---------|---------|----------------|
| **Server Components** | ✓ | ~40KB | Kitchen detail, menu list, static pages — zero JS on initial load |
| **Streaming SSR** | ✓ | ~200ms faster TTFB | `loading.tsx` for Suspense boundaries |
| **Dynamic imports** | ✓ | ~25KB | Checkout modal, admin panel, maps, charts |
| `next/dynamic` | ✓ | ~15KB | CravingsPopup, AddressModal, PhotoGallery |
| **Tree shaking** | ✓ | — | ES modules, side-effect-free imports |
| **Code splitting** | ✓ | — | Automatic page-level code splitting (Next.js) |
| **Font subsetting** | ✓ | ~50KB | `next/font` with subset configuration |
| **Icon tree-shaking** | ✓ | ~20KB | Named imports from Lucide (`import { Heart } from 'lucide-react'`) |
| **SWC minification** | ✓ | — | Next.js default (SWC, not Babel) |
| **CSS purging** | ✓ | — | Tailwind JIT removes unused CSS |

---

## 6. Database Performance

### Query Optimization

```typescript
// ❌ N+1: Fetch kitchen, then menu items in loop
const kitchen = await prisma.kitchenAlias.findUnique({ where: { slug } });
const menuItems = await prisma.menuItem.findMany({
  where: { kitchenAliasId: kitchen.id },
});

// ✅ Optimized: Single query with includes
const kitchenWithMenu = await prisma.kitchenAlias.findUnique({
  where: { slug },
  include: {
    menuItems: {
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      include: { photos: { take: 1, orderBy: { sortOrder: 'asc' } } },
    },
    timeSlots: { orderBy: { sortOrder: 'asc' } },
    _count: { select: { reviews: true, menuItems: true } },
  },
});

// ✅ Batch stock query
const stockItems = await prisma.kitchenDailyStock.findMany({
  where: {
    menuItemId: { in: menuItemIds },
    date: today,
  },
});
// Convert to Map for O(1) lookup
const stockMap = new Map(stockItems.map(s => [s.menuItemId, s]));
```

### Connection Pool

| Configuration | Value | Rationale |
|--------------|-------|-----------|
| Pooler | Prisma Data Proxy | Serverless, auto-scaling |
| Min connections | 1 | Serverless — no persistent pool |
| Max connections | 10 | 10 concurrent queries max |
| Idle timeout | 60s | Free up connections during idle |
| Statement limit | 5000 per connection | Prepared statement leak prevention |
| Pool timeout | 10s | Fail fast if no connection available |

### Query Performance Targets

| Query | Target | Current p95 | Index Used |
|-------|--------|-------------|------------|
| Kitchen detail page | <50ms | ~35ms | `idx_ka_slug` (unique) |
| Menu items by kitchen | <30ms | ~15ms | `idx_mi_kitchenAliasId` |
| Order history (user) | <100ms | ~45ms | `idx_order_userId` |
| Kitchen dashboard orders | <100ms | ~60ms | `idx_order_kitchen_status` |
| Search menu items | <200ms | ~120ms | `idx_menu_item_search` (GIN) |
| Review aggregation | <50ms | ~20ms | `idx_rev_kitchenAliasId` |
| Stock availability | <30ms | ~10ms | `idx_kds_menuItem_date` |
| Coupon validation | <20ms | ~5ms | `idx_coupon_code` (unique) |

---

## 7. Scaling Plan

### Current Scale Assumptions

| Metric | Current | 6-Month Target | 12-Month Target |
|--------|---------|----------------|-----------------|
| Daily active users | 1,000 | 10,000 | 50,000 |
| Concurrent users (peak) | 200 | 2,000 | 10,000 |
| Orders per day | 100 | 1,000 | 5,000 |
| Menu items | 500 | 5,000 | 25,000 |
| Kitchens | 20 | 200 | 1,000 |
| Storage (DB) | 2GB | 20GB | 100GB |
| API requests/day | 10K | 100K | 500K |

### Bottleneck Analysis

```mermaid
graph LR
    subgraph "Current Bottlenecks"
        B1["PostgreSQL query load<br/>~200 QPS peak"]
        B2["Redis cache misses<br/>~10% miss rate"]
        B3["Vercel function cold starts<br/>~500ms first request"]
        B4["Image transformation latency<br/>~300ms first load"]
    end

    subgraph "Scaling Actions"
        S1["Add read replicas<br/>at 500 QPS"]
        S2["Increase Redis TTL<br/>optimize cache layer"]
        S3["Use ISR + Edge Functions<br/>reduce cold starts"]
        S4["Pre-generate image variants<br/>use Cloudinary fetch"]
    end

    B1 --> S1
    B2 --> S2
    B3 --> S3
    B4 --> S4
```

### Vertical vs Horizontal Scaling

| Component | Current | Vertical | Horizontal |
|-----------|---------|----------|------------|
| **Vercel** | Serverless (auto) | N/A | Automatic (edge network) |
| **PostgreSQL DB** | 1 CPU, 4GB RAM | 4 CPU, 16GB RAM | Read replicas |
| **Redis** | 256MB | 1GB | Global replication |
| **Cloudinary** | Free tier | Growth plan | Enterprise plan |
| **Ably** | Free (250K msg/mo) | Pro ($49/mo) | Enterprise ($399/mo) |
| **Razorpay** | Standard | Standard | Custom enterprise |

### Scaling Trigger Points

| Trigger | Action | Lead Time |
|---------|--------|-----------|
| DB CPU >80% for 5min | Upgrade database plan | 1 hour |
| Redis miss rate >20% | Re-evaluate cache strategy | 1 day |
| Vercel function errors >1% | Check for cold start issue | Immediate |
| API response p95 >500ms | Profile + optimize queries | 1 day |
| Ably message limit >80% | Upgrade plan | 1 week |
| Static asset storage >5GB | Enable CDN purging | 1 day |
| Push notification failure >10% | Re-register subscriptions | 1 hour |

---

## 8. Frontend Performance Checklist

- [x] `next/image` with Cloudinary for all images
- [x] Font subsetting via `next/font`
- [x] RSC for data fetching (no client waterfalls)
- [x] Streaming SSR with Suspense boundaries
- [x] Dynamic imports for heavy third-party components
- [x] `preload` critical resources (fonts, hero image)
- [x] `preconnect` to Cloudinary, Ably, Razorpay
- [x] Bundle analyzer in CI (fails if >150KB)
- [x] No render-blocking CSS (Tailwind JIT)
- [x] `loading="lazy"` for below-the-fold images
- [x] `will-change` only on animated elements
- [x] Debounced search input (300ms)
- [x] Virtual scrolling for large lists (50+ items)
- [x] Memoized selectors for cart totals
- [x] Optimistic UI for cart and wishlist
- [x] Service worker caching for repeat visits
