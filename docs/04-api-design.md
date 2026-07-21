# API Design & Contracts

> **Status:** Active
> **Last updated:** 2026-07-21
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

### 2.2 Order Operations

#### `createRazorpayOrder(amount: number)`

```typescript
// Input
{
  amount: number;  // in paise (₹100 = 10000)
}

// Output
{
  razorpayOrderId: string;
  amount: number;
  currency: "INR";
  key: string;  // Razorpay API key ID
}

// Error
{ code: "AMOUNT_MISMATCH" | "ORDER_CREATION_FAILED" }
```

#### `verifyPayment(payload: RazorpayPaymentPayload)`

```typescript
// Input
{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Output
{
  success: true;
  orderId: string;
  status: "confirmed";
}
```

#### `checkCodEligibility(orderAmount: number)`

| Condition | Eligible? |
|-----------|-----------|
| Amount ≤ ₹2000 | Yes |
| Amount > ₹2000 | No |
| User has 3+ failed COD deliveries | No (24h cooldown) |

#### `placeOrder(data: OrderInput)`

```typescript
// Input
{
  addressId: string;
  orderType: "prebook" | "instant";
  scheduledAt?: string;  // ISO date (required for prebook)
  couponCode?: string;
  paymentMethod: "online" | "cod";
  notes?: string;
}
```

### 2.3 Kitchen Operations

#### `getKitchenDetail(slug: string)`

Returns full kitchen detail page payload:
- Kitchen profile (name, description, rating, review count)
- Menu items grouped by time slot with photos
- Operating hours
- Reviews (first 10)
- Available stock for today

#### `updateMenuItem(data: MenuItemInput)`

```typescript
// Input
{
  id: string;
  name?: string;
  description?: string;
  price?: number;
  discountedPrice?: number;
  isAvailable?: boolean;
  timeSlot?: "breakfast" | "lunch" | "dinner" | "all_day";
  isVeg?: boolean;
  preparationTime?: number;
}

// Output
{ success: true; menuItem: MenuItem }
```

#### `manageStock(data: StockInput[])`

```typescript
// Input — batch update
[
  { menuItemId: string; date: string; totalQty: number },
  { menuItemId: string; date: string; totalQty: number },
]
```

### 2.4 User Operations

| Action | Input | Output |
|--------|-------|--------|
| `getProfile()` | None | `User` with addresses, preferences |
| `updateProfile(data)` | `{ name?, email?, photo? }` | Updated `User` |
| `getAddresses()` | None | `Address[]` |
| `addAddress(data)` | Address fields | Created `Address` |
| `deleteAddress(id)` | `string` | `{ success: true }` |
| `getOrderHistory()` | None | `Order[]` with items + tracking |
| `getWishlist()` | None | `MenuItem[]` |
| `toggleWishlist(itemId)` | `string` | `{ isWishlisted: boolean }` |

### 2.5 Auth Operations

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
POST /api/payment/webhook
```

Called by Razorpay for async payment status updates.

**Headers:**
```
x-razorpay-signature: <HMAC-SHA256 signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxxxxx",
        "order_id": "order_xxxxxxxx",
        "status": "captured",
        "amount": 10000,
        "currency": "INR",
        "method": "upi",
        "created_at": 1700000000
      }
    }
  }
}
```

**Events Handled:**
| Event | Action |
|-------|--------|
| `payment.captured` | Mark payment as success, confirm order |
| `payment.failed` | Mark payment as failed, update order status |
| `payment.refunded` | Create refund record, update order |

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

### 3.2 Image Upload

```
POST /api/upload/photo
```

**Content-Type:** `multipart/form-data`

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| `file` | File (image) | Yes |
| `folder` | string | No (default: `menu-items`) |

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../image/upload/v1/menu-items/abc123.jpg",
  "publicId": "menu-items/abc123",
  "width": 800,
  "height": 600,
  "format": "webp"
}
```

**Validation:**
- Max file size: 5MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
- Max dimensions: 4096x4096

### 3.3 Ably Token Authentication

```
POST /api/ably/auth
```

**Auth:** Requires valid session cookie

**Response:**
```json
{
  "token": "<Ably JWT token>",
  "keyName": "<Ably API key name>",
  "ttl": 3600
}
```

**Token Capabilities:**
| Channel Pattern | Capabilities |
|----------------|-------------|
| `order:{userId}` | Subscribe |
| `kitchen:{kitchenId}` | Subscribe |
| `delivery:{deliveryId}` | Subscribe + Publish |
| `presence:*` | Subscribe |

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
