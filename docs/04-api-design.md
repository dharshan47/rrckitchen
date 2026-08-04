# API Design & Contracts

> **Status:** Active
> **Last updated:** 2026-08-05
> **Cross-refs:** [Data Model](03-data-model.md), [System Architecture](01-system-architecture.md), [Payment Architecture](08-payment-system.md)

---

## 1. API Philosophy

| Principle | Rationale |
|-----------|-----------|
| **Server Actions first** | Type-safe, colocated, no serialization boilerplate |
| **API Routes for external consumers** | Payment webhooks, file upload, Ably auth tokens |
| **Single responsibility** | Each action/route does exactly one thing |
| **Validation at boundary** | All input validated via Zod; no trust in client data |
| **Consistent error shape** | Every error response has `{ code, message, details? }` |
| **Rate limited** | All public endpoints rate-limited via Upstash Redis |

---

## 2. Server Actions (Type-Safe Operations)

### 2.1 Cart Operations

#### `addToCart(itemId: string, quantity: number)`

```typescript
// Input (Server Action — called directly, no serialization)
{
  itemId: string;    // MenuItem.id
  quantity: number;  // 1-99
}

// Validation (Zod)
const schema = z.object({
  itemId: z.string().ulid(),
  quantity: z.number().int().min(1).max(99),
});

// Output
{
  success: true;
  cartItem: {
    id: string;
    menuItemId: string;
    quantity: number;
  };
}

// Error cases
{
  success: false;
  code: "ITEM_NOT_FOUND" | "ITEM_UNAVAILABLE" | "STOCK_EXCEEDED" | "RATE_LIMITED";
  message: string;
}
```

#### `updateCartItemQuantity(itemId: string, quantity: number)`

| Field | Type | Rules |
|-------|------|-------|
| `itemId` | string (ULID) | Must exist in user's cart |
| `quantity` | number | 0 = remove item, 1-99 = update |

#### `getCart()` / `clearCart()`

No input required. Returns full cart state with item details (name, price, photo, kitchen info).

### 2.2 Order & Payment Operations

#### `createPaymentOrder` (via `POST /api/payment/create-order`)

```typescript
// Server-side (actions/payments/payment.ts)
{
  userId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
  idempotencyKey: string;      // Client-generated, unique per attempt
  couponCode?: string;
  serviceDateType: "TODAY" | "TOMORROW";
}

// Output
{
  razorpayOrderId: string;
  amount: number;        // in paise (₹100 = 10000)
  currency: "INR";
  keyId: string;         // NEXT_PUBLIC_RAZORPAY_KEY_ID
  orderId: string;       // Internal order id (status CONFIRMED on creation)
}
```

Creates Order + OrderItems + Payment (PENDING) in a transaction, applies coupon discount, allocates `publicCode` (`ORD-…`), and busts the menu cache.

#### `POST /api/payment/verify`

```typescript
// Input — Razorpay handler payload
{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Output
{
  success: true;
  orderId: string;
  status: "PREPARING";
}
```

Verifies the HMAC-SHA256 signature, marks Payment SUCCESS, moves Order → PREPARING, creates the kitchen payout, awards loyalty points, and publishes Ably events (`order:status`, `kitchen:{id}` `queue:new-order`, `order:cravings`).

#### `POST /api/payment/fail`

Marks the payment FAILED and the order CANCELLED (called when the Razorpay modal is dismissed or payment fails).

#### UPI Smart Collect (backend-ready, no UI wired)

| Route | Purpose |
|-------|---------|
| `POST /api/payment/upi-collect/create` | Creates a Razorpay Virtual Account/VPA for the order (30-min expiry), idempotent via `UpiCollectRequest` |
| `GET /api/payment/upi-collect/status?orderId=` | Polls the VPA for captured payments; on capture calls `confirmPayment(..., "upi")` |

Client hook `hooks/useUpiCollect.ts` implements create + 4s auto-polling (statuses `IDLE/CREATING/PENDING/PAID/EXPIRED/FAILED/ERROR`) but is not yet connected to any component.

### 2.3 Kitchen Operations

#### `getKitchenDetail(slug)` / `getKitchenDetailLive(slug)`

Returns full kitchen detail page payload (via `lib/kitchen-detail.ts`):
- Kitchen profile (display name, description, rating, review count, prep time)
- Menu items grouped by time slot with photos (bestseller logic by order count)
- Operating hours, time-on-platform, total orders delivered, pure-veg indicator
- Reviews (first 10) and item reviews

#### `updateMenuItem(data: MenuItemInput)` / `saveAdminMenuItem(data)`

```typescript
// Input (actions/admin/admin-menu-cms.ts — full menu editor)
{
  id: string;
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  isAvailable?: boolean;
  foodType?: "VEG" | "NONVEG";
  timeSlot?: "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";
  bestseller?: boolean;
  highlights?: string[];
  photos?: string[];       // Cloudinary URLs
  // ...CMS fields: aboutTitle, serves, portionSize, allergens, metaTitle...
}

// Output
{ success: true; menuItem: MenuItem }
```

Also: `toggleAdminMenuItemAvailability(id, isAvailable)`, `createAdminMenuItem(data)` (allocates `publicCode` `M-…`). Admin actions require `MANAGE_CATALOG`.

### 2.4 Catalog Operations (public)

| Action | Purpose |
|--------|---------|
| `getCategoryPageBundle(slug)` | Full category page payload — CMS content + up to 100 kitchens + computed facets (mealTypes, foodTypes, deliveryTimes, ratings, cuisines) |
| `getCravingsRecommendations(triggerItemIds)` | Resolve highest-priority active cravings rule for the given cart items |
| `getMenuItemReviews(menuItemId, cursor, limit)` | Cursor-paginated menu item reviews |
| `getKitchenReviews(kitchenId)` | Last 50 kitchen reviews incl. taste/packaging/portion ratings |
| `getKitchenData()` / `getHomePageData()` | Home page payload (cached 30–60s via `lib/server-cache.ts` + `'use cache'`) |
| `submitContactForm(input)` | Public contact form → `ContactMessage` |
| `getKitchenTestimonials()` | Top-6 rated kitchens for `/home-chefs` and `/kitchen` landing |

### 2.5 User Operations

| Action | Input | Output |
|--------|-------|--------|
| `getProfile()` | None | `User` with addresses, preferences |
| `updateProfile(data)` | `{ name?, email?, photo? }` | Updated `User` |
| `getAddresses()` | None | `Address[]` |
| `addAddress(data)` | Address fields | Created `Address` |
| `deleteAddress(id)` | `string` | `{ success: true }` |
| `getUserOrders()` | None | Last 20 orders with items + tracking |
| `getRecommendedKitchens()` | None | Top-rated kitchens (favourites page) |
| `toggleWishlist(itemId)` | `string` | `{ isWishlisted: boolean }` |

### 2.6 Auth Operations

| Action | Input | Output |
|--------|-------|--------|
| `sendOtp(phone)` | `{ phone: string }` | `{ success: true, retryAfter: 60 }` |
| `verifyOtp(phone, otp)` | `{ phone, otp }` | `{ session, isNewUser }` |
| `completeProfile(data)` | Profile fields | `{ user, session }` |
| `adminLogin(email, password)` | Credentials | `{ session, requires2FA: boolean }` |
| `verifyTotp(code)` | `{ code: string }` | `{ session }` |
| `logout()` | None | `{ success: true }` |

---

## 3. API Routes (REST Endpoints)

### 3.1 Payment Webhooks

```
POST /api/auth/razorpay/webhook
```

Called by Razorpay for async payment status updates.

**Headers:**
```
x-razorpay-signature: <HMAC-SHA256 signature>
Content-Type: application/json
```

**Events Handled:**
| Event | Action |
|-------|--------|
| `payment.captured` | Mark payment as success, confirm order |
| `payment.failed` | Mark payment as failed, update order status |
| `refund.processed` | Mark refund PROCESSED, publish `refund:processed` |

**Verification:**
```typescript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');

if (expectedSignature !== signature) {
  return Response.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3.2 Image Upload (Cloudinary)

```
POST /api/cloudinary/sign        — generate signed upload payload
POST /api/cloudinary/delete      — delete image by publicId
```

Uploads themselves are direct-to-Cloudinary from the client (`components/patterns/cloudinary-upload.tsx`) using the signed payload.

### 3.3 Ably Token Authentication

```
POST /api/ably-token
```

**Auth:** Requires valid session cookie.

**Response:**
```json
{
  "tokenRequest": { ... },  // Ably TokenRequest
  "clientId": "user:xyz"
}
```

Token TTL: 15 minutes. The route validates ownership before granting channel capabilities:
| Channel Pattern | Capabilities |
|----------------|-------------|
| `order:{orderId}` | Subscribe (owner) |
| `kitchen:{kitchenId}` | Subscribe |
| `deliveryPartner:{id}` | Subscribe |
| `user:{id}` | Fallback when no specific channel granted |

### 3.4 Other API Routes (Inventory)

| Route | Purpose | Auth |
|-------|---------|------|
| `GET /api/home/testimonials` | Latest 8 reviews with comments (`s-maxage=60`) | Public |
| `GET /api/kitchen/explore` | Infinite-scroll kitchen grid (PAGE_SIZE 15) | Public |
| `GET /api/kitchen/categories` | Kitchen categories | Public |
| `GET /api/kitchen/trending` / `nearby` / `wishlist` / `earnings` | Kitchen discovery & partner data | Public / Session |
| `GET /api/menu/search` | Menu item search | Public |
| `GET /api/menu/tomorrow` | Tomorrow's menu | Public |
| `GET /api/cravings-banner` | Cravings banner content | Public |
| `GET /api/search/content` | Search page CMS content | Public |
| `GET /api/coupon/validate` / `GET /api/coupon/offers` | Coupon + payment offers | Session |
| `POST /api/coupon/...` | Coupon validation | Session |
| `GET/POST /api/loyalty/*` | Loyalty points, history, coupons, redeem | Session |
| `POST /api/referral/code` / `GET /api/referral/stats` | Referral program | Session |
| `GET /api/geocode/search` / `reverse` | Geoapify geocoding | Public |
| `GET /api/route/road-route` | OpenRouteService directions + ETA | Public |
| `POST /api/rider/location` | Delivery partner location heartbeat (Redis `deliveryOrder:{id}:lastLoc`) | Delivery role |
| `POST /api/push/subscribe` / `GET /api/push/vapid-public-key` | Push subscriptions | Session |
| `POST /api/support` / `POST /api/admin/support` | Support tickets | Session / Admin |
| `POST /api/auth/twilio/send` / `verify` | Phone OTP | Public |
| `POST /api/auth/razorpay/webhook` | Razorpay webhooks | Signature-verified |
| `POST /api/account/profile` | Profile update | Session |
| `POST /api/ably-token` | Ably token request | Session |
| `POST /api/cloudinary/sign` / `delete` | Image management | Session |
| `GET /api/cron/process-order-events` | Drain `order-events` Redis stream → order processing | Cron secret |
| `POST /api/jobs/cravings-nudge` / `retry-refund` / `settle-payouts` | Background jobs | Cron secret |
| `GET /api/admin/backfill-slugs` / `POST /api/admin/invite` | Admin utilities | Admin |

---

## 4. Error Taxonomy

### 4.1 Error Codes

| Code | HTTP Status | Meaning | Recovery |
|------|-------------|---------|----------|
| `VALIDATION_ERROR` | 400 | Input validation failed | Fix input per error details |
| `UNAUTHORIZED` | 401 | No valid session | Redirect to login |
| `FORBIDDEN` | 403 | Valid session, insufficient role | Show 403 page |
| `NOT_FOUND` | 404 | Resource not found | Show 404 page |
| `RATE_LIMITED` | 429 | Too many requests | Retry after `Retry-After` header |
| `CONFLICT` | 409 | State conflict (e.g., duplicate) | Refresh and retry |
| `DEPENDENCY_ERROR` | 502 | External service failed | Retry or show error toast |
| `INTERNAL_ERROR` | 500 | Unexpected error | Show generic error page |

### 4.2 Error Response Shape

```typescript
interface ApiError {
  code: ErrorCode;
  message: string;           // Human-readable, user-facing
  details?: Record<string, string[]>;  // Field-level validation errors
  requestId?: string;        // For debugging / correlation
  retryAfter?: number;       // Seconds (for 429)
}
```

### 4.3 Validation Error Example

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": {
    "phone": ["Phone number must be 10 digits"],
    "name": ["Name is required"]
  }
}
```

---

## 5. Rate Limiting

### 5.1 Limits

| Endpoint | Rate Limit | Window | Scope |
|----------|-----------|--------|-------|
| `sendOtp` | 1 request | 60 seconds | Per phone number |
| `sendOtp` | 5 requests | 3600 seconds | Per IP |
| `verifyOtp` | 3 attempts | 300 seconds | Per phone number |
| All auth | 10 requests | 60 seconds | Per IP |
| API webhooks | 100 requests | 60 seconds | Per IP (whitelisted) |
| Server Actions | 30 requests | 60 seconds | Per session |
| Image upload | 10 requests | 300 seconds | Per session |

### 5.2 Implementation

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / windowSeconds)}`;
  
  const [count] = await redis
    .multi()
    .incr(windowKey)
    .expire(windowKey, windowSeconds)
    .exec();
  
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetIn: windowSeconds - (now % windowSeconds),
  };
}
```

---

## 6. Versioning & Deprecation

| Strategy | Detail |
|----------|--------|
| **Server Actions** | No versioning — callers are compile-time checked |
| **API Routes** | URL-based versioning (`/api/v1/payment/webhook`) |
| **Breaking change** | Bump version, maintain old endpoint for 90 days with deprecation header |
| **Deprecation header** | `Sunset: Sat, 18 Oct 2026 23:59:59 GMT` |
| **Internal types** | Break immediately if no external consumer |

---

## 7. API Security

| Measure | Implementation |
|---------|---------------|
| **Webhook HMAC** | Every webhook verified via HMAC-SHA256 signature |
| **CSRF** | SameSite=Strict cookies, CSRF token for form submissions |
| **CORS** | Restricted to production domain (Next.js handles dev auto-CORS) |
| **Rate limiting** | Redis-based, pre-request check |
| **Input validation** | Zod at every action/route boundary |
| **SQL injection** | Prisma parameterized queries (not affected) |
| **XSS** | React's built-in escaping, `dangerouslySetInnerHTML` banned via ESLint |
| **IDOR prevention** | All resource access checked against session user ID/role |
| **Session expiry** | 7 days for customers, 24h for admins (renewed on activity) |
