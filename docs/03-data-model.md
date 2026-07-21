# Data Model & Storage Architecture

> **Status:** Active
> **Last updated:** 2026-07-21
> **Cross-refs:** [API Design](04-api-design.md), [System Architecture](01-system-architecture.md), [Architecture Decisions (Prisma)](02-architecture-decisions.md#adr-006-prisma-as-orm)

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string phone UK
        string email UK
        string name
        string role "customer | kitchen | delivery | admin"
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "Soft delete"
    }

    Session {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
        json metadata "IP, user agent, geo"
    }

    KitchenPartner {
        string id PK
        string userId FK, UK
        string alias UK
        string kitchenName
        string phone UK
        string panNumber UK
        string bankAccount
        string ifscCode
        string upiId
        float commissionRate "e.g. 0.15 = 15%"
        boolean isApproved
        boolean isActive
        json address "lat, lng, street, city, pincode"
        json operatingHours "day-wise open/close"
        datetime createdAt
    }

    KitchenAlias {
        string id PK
        string kitchenPartnerId FK
        string slug UK
        string name
        string description
        string[] photoUrls
        float avgRating
        int totalReviews
        boolean isActive
        datetime createdAt
    }

    MenuItem {
        string id PK
        string kitchenAliasId FK
        string name
        string description
        float price
        float discountedPrice
        string category
        string timeSlot "breakfast | lunch | dinner | all_day"
        boolean isVeg
        boolean isAvailable
        string[] photoUrls
        int preparationTime "in minutes"
        json nutritionalInfo "calories, protein, etc."
        datetime createdAt
        datetime updatedAt
    }

    TimeSlot {
        string id PK
        string kitchenAliasId FK
        string name "breakfast | lunch | dinner"
        string displayName "Morning | Afternoon | Evening"
        time startTime "HH:mm"
        time endTime "HH:mm"
        boolean isActive
        int sortOrder
    }

    Photo {
        string id PK
        string menuItemId FK
        string url
        string publicId "Cloudinary ID"
        boolean isPrimary
        int sortOrder
        datetime createdAt
    }

    Order {
        string id PK
        string userId FK
        string kitchenAliasId FK
        string orderType "prebook | instant"
        string status "pending | confirmed | preparing | ready | out_for_delivery | delivered | cancelled"
        float subtotal
        float deliveryFee
        float discountAmount
        float taxAmount
        float total
        string paymentMethod "online | cod"
        string paymentStatus "pending | paid | failed | refunded"
        string couponCode
        json deliveryAddress
        datetime scheduledAt "for prebook"
        datetime confirmedAt
        datetime deliveredAt
        datetime createdAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string menuItemId FK
        string itemName "snapshot at order time"
        float itemPrice "snapshot at order time"
        int quantity
        float subtotal
    }

    OrderTracking {
        string id PK
        string orderId FK
        string status
        string location "lat,lng for delivery tracking"
        string updatedBy "user | kitchen | delivery | system"
        datetime createdAt
    }

    OrderEvent {
        string id PK
        string orderId FK
        string eventType "status_change | payment_update | location_update"
        json payload
        datetime createdAt
    }

    DeliveryAssignment {
        string id PK
        string orderId FK, UK
        string deliveryPartnerId FK
        string status "assigned | accepted | picked_up | delivered | failed"
        datetime assignedAt
        datetime acceptedAt
        datetime deliveredAt
    }

    DeliveryPartner {
        string id PK
        string userId FK, UK
        string phone UK
        boolean isOnline
        json currentLocation "lat, lng"
        float rating
        int totalDeliveries
        bool isVerified
        string bankAccount
        string ifscCode
        string upiId
        datetime createdAt
    }

    Payment {
        string id PK
        string orderId FK
        float amount
        string method "online | cod"
        string status "initiated | success | failed | refunded"
        string razorpayOrderId UK
        string razorpayPaymentId UK
        string razorpaySignature
        json webhookResponse "raw webhook data for audit"
        datetime createdAt
        datetime refundedAt
    }

    Refund {
        string id PK
        string paymentId FK
        float amount
        string reason
        string status "initiated | processed | failed"
        string razorpayRefundId
        datetime createdAt
    }

    Review {
        string id PK
        string orderId FK, UK
        string userId FK
        string kitchenAliasId FK
        float rating "1-5"
        string comment
        json photos
        datetime createdAt
    }

    Wishlist {
        string id PK
        string userId FK
        string menuItemId FK
        datetime createdAt
    }

    Address {
        string id PK
        string userId FK
        string label "Home | Work | Other"
        string street
        string city
        string pincode
        float lat
        float lng
        bool isDefault
        datetime createdAt
    }

    Coupon {
        string id PK
        string code UK
        string type "percentage | fixed"
        float value "10 = 10% or Rs.10"
        float minOrderValue
        float maxDiscount "max cap for percentage"
        int maxUses
        int currentUses
        datetime validFrom
        datetime validUntil
        bool isActive
        datetime createdAt
    }

    KitchenDailyStock {
        string id PK
        string menuItemId FK
        date date
        int totalQty
        int bookedQty
        int availableQty
        datetime createdAt
        datetime updatedAt
    }

    CartItem {
        string id PK
        string userId FK
        string menuItemId FK
        int quantity
        datetime createdAt
        datetime updatedAt
    }

    AdminProfile {
        string id PK
        string userId FK, UK
        string email UK
        string passwordHash
        bool isSuperAdmin
        int permissions "bitfield"
        datetime createdAt
    }

    AdminInvite {
        string id PK
        string email
        string token UK
        int permissions "bitfield"
        string invitedByUserId FK
        datetime expiresAt
        bool isAccepted
        datetime createdAt
    }

    AdminAuditLog {
        string id PK
        string adminId FK
        string action
        string entityType "order | user | kitchen | coupon"
        string entityId
        json before "previous state"
        json after "new state"
        string ipAddress
        datetime createdAt
    }

    PushSubscription {
        string id PK
        string userId FK
        string endpoint UK
        json keys "p256dh, auth"
        datetime createdAt
    }

    CodCollection {
        string id PK
        string deliveryPartnerId FK
        date collectionDate
        float totalCollected
        float totalRemitted
        float variance
        datetime createdAt
    }

    CodRemittance {
        string id PK
        string deliveryPartnerId FK
        string orderId FK
        float amount
        string status "pending | remitted | reconciled"
        datetime createdAt
        datetime reconciledAt
    }

    CodVariance {
        string id PK
        string codCollectionId FK
        float expectedAmount
        float actualAmount
        float difference
        string reason "short | excess | unaccounted"
        string resolution "pending | adjusted | written_off"
        datetime createdAt
    }

    KitchenPayout {
        string id PK
        string kitchenPartnerId FK
        float amount
        string status "pending | processing | completed | failed"
        string bankReference
        string periodStart
        string periodEnd
        datetime createdAt
        datetime processedAt
    }

    OrderStatusConfig {
        string id PK
        string name "confirmed"
        int sortOrder
        string color
        string icon
        bool isActive
    }

    Notification {
        string id PK
        string userId FK
        string title
        string body
        string type "order | promo | system"
        json data "deep link payload"
        bool isRead
        datetime createdAt
    }

    User ||--o{ Order : places
    User ||--o{ Address : has
    User ||--o{ Review : writes
    User ||--o{ Wishlist : has
    User ||--o{ PushSubscription : has
    User ||--o{ Session : has
    User ||--o{ Notification : receives
    User ||--o{ CartItem : has
    User || o{ AdminProfile : is
    User ||--o{ KitchenPartner : owns
    User ||--o{ DeliveryPartner : is

    KitchenPartner ||--o{ KitchenAlias : manages
    KitchenPartner ||--o{ Order : fulfills
    KitchenPartner ||--o{ KitchenPayout : receives

    KitchenAlias ||--o{ MenuItem : contains
    KitchenAlias ||--o{ TimeSlot : configures
    KitchenAlias ||--o{ Review : receives
    KitchenAlias ||--o{ Order : contains

    MenuItem ||--o{ OrderItem : referenced_in
    MenuItem ||--o{ Photo : has
    MenuItem ||--o{ KitchenDailyStock : tracks
    MenuItem ||--o{ Wishlist : appears_in
    MenuItem ||--o{ CartItem : references

    Order ||--o{ OrderItem : contains
    Order ||--o{ OrderTracking : tracks
    Order ||--o{ OrderEvent : logs
    Order ||--o{ Payment : has
    Order ||--o{ Review : results_in
    Order ||--o{ DeliveryAssignment : assigned_to

    DeliveryPartner ||--o{ DeliveryAssignment : performs
    DeliveryPartner ||--o{ CodCollection : remits

    Payment ||--o{ Refund : has_refunds
    CodCollection ||--o{ CodVariance : may_have
    CodRemittance ||--o{ CodCollection : reconciles

    AdminProfile ||--o{ AdminInvite : creates
    AdminProfile ||--o{ AdminAuditLog : logs
```

---

## 2. Index Strategy

### 2.1 Primary Indexes (auto-generated by Prisma)
All `id` fields have a primary B-tree index.

### 2.2 Secondary Indexes

| Table | Index | Type | Purpose | Query Pattern |
|-------|-------|------|---------|---------------|
| `User` | `idx_user_phone` | Unique | Phone OTP lookup | `findUnique({ where: { phone } })` |
| `User` | `idx_user_email` | Unique | Admin login | `findUnique({ where: { email } })` |
| `User` | `idx_user_role` | B-tree | Role-based listing | `findMany({ where: { role } })` |
| `Session` | `idx_session_token` | Unique | Session validation | `findUnique({ where: { token } })` |
| `Session` | `idx_session_userId` | B-tree | User sessions | `findMany({ where: { userId } })` |
| `Session` | `idx_session_expiresAt` | B-tree | Expired cleanup | `deleteMany({ where: { expiresAt: { lt: now } } })` |
| `KitchenPartner` | `idx_kp_userId` | Unique | User->Kitchen join | `findUnique({ where: { userId } })` |
| `KitchenPartner` | `idx_kp_alias` | Unique | Slug lookup | `findUnique({ where: { alias } })` |
| `KitchenAlias` | `idx_ka_slug` | Unique | URL routing | `findUnique({ where: { slug } })` |
| `KitchenAlias` | `idx_ka_isActive` | B-tree | Active kitchens filter | `findMany({ where: { isActive } })` |
| `MenuItem` | `idx_mi_kitchenAliasId` | B-tree | Kitchen menu items | `findMany({ where: { kitchenAliasId } })` |
| `MenuItem` | `idx_mi_timeSlot` | B-tree | Time-slot grouping | `findMany({ where: { timeSlot } })` |
| `MenuItem` | `idx_mi_isAvailable` | B-tree | Available items filter | `findMany({ where: { isAvailable } })` |
| `MenuItem` | `idx_mi_kitchen_timeSlot` | Composite | Kitchen + time-slot | `findMany({ where: { kitchenAliasId, timeSlot } })` |
| `MenuItem` | `idx_mi_category` | B-tree | Category filtering | `findMany({ where: { category } })` |
| `TimeSlot` | `idx_ts_kitchenId` | B-tree | Kitchen time slots | `findMany({ where: { kitchenAliasId } }, orderBy: sortOrder)` |
| `Order` | `idx_order_userId` | B-tree | User order history | `findMany({ where: { userId } })` |
| `Order` | `idx_order_kitchenAliasId` | B-tree | Kitchen orders | `findMany({ where: { kitchenAliasId } })` |
| `Order` | `idx_order_status` | B-tree | Status-based queries | `findMany({ where: { status } })` |
| `Order` | `idx_order_kitchen_status` | Composite | Kitchen dashboard | `findMany({ where: { kitchenAliasId, status } })` |
| `Order` | `idx_order_user_status` | Composite | User order filtering | `findMany({ where: { userId, status } })` |
| `Order` | `idx_order_createdAt` | B-tree DESC | Recent orders | `findMany({ orderBy: { createdAt: 'desc' } })` |
| `OrderItem` | `idx_oi_orderId` | B-tree | Order items | `findMany({ where: { orderId } })` |
| `OrderTracking` | `idx_ot_orderId` | B-tree | Tracking history | `findMany({ where: { orderId } })` |
| `OrderEvent` | `idx_oe_orderId` | B-tree | Event log | `findMany({ where: { orderId } })` |
| `DeliveryAssignment` | `idx_da_orderId` | Unique | Assignment lookup | `findUnique({ where: { orderId } })` |
| `DeliveryAssignment` | `idx_da_deliveryPartnerId` | B-tree | Partner assignments | `findMany({ where: { deliveryPartnerId } })` |
| `DeliveryAssignment` | `idx_da_status` | B-tree | Active deliveries | `findMany({ where: { status: 'accepted' } })` |
| `Review` | `idx_rev_kitchenAliasId` | B-tree | Kitchen reviews | `findMany({ where: { kitchenAliasId } })` |
| `Review` | `idx_rev_userId` | B-tree | User reviews | `findMany({ where: { userId } })` |
| `Review` | `idx_rev_orderId` | Unique | One review per order | `findUnique({ where: { orderId } })` |
| `Review` | `idx_rev_kitchen_rating` | Composite | Avg rating calc | `aggregate({ where: { kitchenAliasId }, _avg: { rating } })` |
| `Wishlist` | `idx_wl_userId` | B-tree | User wishlist | `findMany({ where: { userId } })` |
| `Wishlist` | `idx_wl_user_menuItem` | Composite Unique | Prevent duplicates | `findUnique({ where: { userId_menuItemId } })` |
| `KitchenDailyStock` | `idx_kds_menuItem_date` | Composite Unique | Daily stock lookup | `findUnique({ where: { menuItemId_date } })` |
| `KitchenDailyStock` | `idx_kds_date` | B-tree | Date-based queries | `findMany({ where: { date } })` |
| `Coupon` | `idx_coupon_code` | Unique | Coupon validation | `findUnique({ where: { code } })` |
| `Coupon` | `idx_coupon_validUntil` | B-tree | Expired coupons | `findMany({ where: { validUntil: { lt: now } } })` |
| `Payment` | `idx_pay_orderId` | B-tree | Payment lookup | `findMany({ where: { orderId } })` |
| `Payment` | `idx_pay_razorpayOrderId` | Unique | Webhook processing | `findUnique({ where: { razorpayOrderId } })` |
| `CartItem` | `idx_ci_userId` | B-tree | User cart | `findMany({ where: { userId } })` |
| `CartItem` | `idx_ci_user_menuItem` | Composite Unique | One cart entry per item | `findUnique({ where: { userId_menuItemId } })` |

### 2.3 Full-Text Search

For menu item search across kitchens, PostgreSQL `tsvector` is used:

```sql
CREATE INDEX idx_menu_item_search ON "MenuItem" USING GIN (
  to_tsvector('english', name || ' ' || coalesce(description, ''))
);
```

Query pattern:
```sql
SELECT * FROM "MenuItem"
WHERE to_tsvector('english', name || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', $searchTerm)
  AND "isAvailable" = true
LIMIT 20;
```

---

## 3. Migration Strategy

### 3.1 Prisma Migrate

All schema changes use `prisma migrate`:

```bash
# Development: create and apply migration
npx prisma migrate dev --name add_order_tracking_table

# Staging/Production: apply pending migrations
npx prisma migrate deploy
```

### 3.2 Migration Guidelines

| Scenario | Approach | Risk Level |
|----------|----------|------------|
| New table | Add model → `prisma migrate dev` → verify in staging | Low |
| New optional column | Add field (nullable) → deploy → populate data → make required | Low |
| New required column | Add with default → deploy → remove default | Medium |
| Rename column | Add new column → dual-write → backfill → deploy read path → remove old | High |
| Rename table | Create new table → dual-write → backfill → deploy → drop old | High |
| Add index | `@@index` in schema → `prisma migrate dev` | Low |
| Remove index | Remove `@@index` → `prisma migrate dev` | Low |
| Drop table | DO NOT DROP until verified no references after 1 week | High |

### 3.3 Zero-Downtime Deployments

For production:
1. Run `prisma migrate deploy` BEFORE deploying new code
2. New columns must be nullable (or have defaults) to work with old code
3. Remove old columns after all pods run new code

---

## 4. Query Patterns & N+1 Prevention

### 4.1 Critical Query: Kitchen Detail Page

```typescript
// ❌ N+1 Pattern (Avoid)
const kitchen = await prisma.kitchenPartner.findUnique({ where: { alias: slug } });
const aliases = await prisma.kitchenAlias.findMany({ where: { kitchenPartnerId: kitchen.id } });
// For each alias, fetch menu items separately!

// ✅ Optimal Pattern
const kitchenDetail = await prisma.kitchenAlias.findUnique({
  where: { slug },
  include: {
    kitchenPartner: {
      include: {
        payouts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    },
    menuItems: {
      where: { isAvailable: true },
      include: { photos: { take: 1 } },
      orderBy: { createdAt: 'desc' },
    },
    timeSlots: { orderBy: { sortOrder: 'asc' } },
    reviews: {
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    },
    _count: { select: { reviews: true, menuItems: true } },
  },
});
```

### 4.2 N+1 Detection

Use Prisma's query logging in development:

```bash
DATABASE_URL=... npx prisma generate --watch
# Or enable logging in dev:
```

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

Additionally, ESLint rule `@tanstack/query/no-unnecessary-includes` prevents over-fetching.

### 4.3 Pagination Pattern

```typescript
async function getOrders(userId: string, cursor?: string, limit = 20) {
  return prisma.order.findMany({
    where: { userId },
    take: limit + 1, // Fetch one extra to check if next page exists
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: true,
      kitchenAlias: { select: { name: true, slug: true } },
    },
  });
}
// Client: if results.length > limit, next cursor = results[limit - 1].id
```

### 4.4 Batch Operations

```typescript
// Bulk stock update
await prisma.$transaction(
  stockUpdates.map(({ id, qty }) =>
    prisma.kitchenDailyStock.update({
      where: { id },
      data: { availableQty: { decrement: qty } },
    })
  )
);
```

---

## 5. Redis Cache Strategy

| Cache Key | TTL | Purpose | Invalidation Trigger |
|-----------|-----|---------|---------------------|
| `kitchen:{slug}:detail` | 60s | Kitchen detail page | Menu update, stock change |
| `menu:{kitchenId}:items` | 30s | Menu items list | Menu CRUD |
| `user:{id}:profile` | 300s | User profile | Profile update |
| `otp:cooldown:{phone}` | 60s | OTP rate limiting | Auto-expire |
| `otp:ip:{ip}` | 3600s | IP rate limiting | Auto-expire |
| `coupon:{code}` | 120s | Coupon validation | Coupon update |
| `rating:{kitchenId}` | 300s | Avg rating cache | New review |
| `search:results:{query}` | 60s | Search results | Menu change |

---

## 6. Data Retention & Cleanup

| Data | Retention | Cleanup Strategy |
|------|-----------|-----------------|
| Soft-deleted users | 90 days | Hard delete after 90d via cron |
| Order tracking history | 1 year | Archive to cold storage |
| Session records | 30 days post-expiry | Daily cron `deleteMany expiresAt < now - 30d` |
| Admin audit logs | 3 years | Keep indefinitely per compliance |
| Payment records | 7 years (tax compliance) | Keep indefinitely |
| OTP logs | 24 hours | Auto-generated logs with TTL index |
| Cart items | 7 days | Cron: delete `CartItem` where `updatedAt < 7d ago` |
| Push subscriptions | On unsubscribe | Delete when push fails with `410 Gone` |
