# Real-time System (Ably)

## Why Ably instead of WebSockets/Socket.IO?

**Ably** is a managed real-time platform — we don't need to operate WebSocket servers, handle reconnection logic, or scale horizontally. It provides:
- Global edge network (low latency)
- Automatic reconnection with message recovery
- Channel-level permissions (capabilities)
- Server-side publishing via REST API

---

## Architecture

```
Kitchen/Server publishes event
        ↓
    Ably channel (e.g., "order:abc123")
        ↓
Customer subscribed to channel receives event
        ↓
    UI updates reactively
```

## Channel Types

| Channel Pattern | Who Publishes | Who Subscribes | Events |
|----------------|---------------|----------------|--------|
| `order:{orderId}` | Server, Kitchen | Customer | `order:status`, `order:cravings`, `delivery:status`, `order:confirmation-code`, `delivery:location` |
| `kitchen:{kitchenId}` | Server | Kitchen Partner | `queue:new-order`, `order:ready` |
| `deliveryPartner:{id}` | Server | Delivery Partner | New assignment notifications |
| `user:{userId}` | Server | User | General notifications |

## Client SDK (`lib/ably/client.ts`)

**Why a singleton?** Only one WebSocket connection per page — creating multiple would waste resources and could hit connection limits. The singleton lazily creates the Ably client on first use.

**Why token authentication?** We use `authUrl` (`/api/ably-token`) instead of exposing the API key to the client. The server generates short-lived tokens with channel-scoped permissions — a user can only subscribe to channels they're authorized for. This is more secure than embedding the API key in the client code.

**Why destroyAblyClient?** Called on logout to close the WebSocket and release resources.

## Server SDK (`lib/ably/server.ts`)

**Why REST not Realtime?** Server-side publishing doesn't need a persistent WebSocket — the REST API (Ably.Rest) is sufficient and simpler. The full API key is stored in `ABLY_API_KEY` environment variable, never exposed to the client.

### How server publishes events

```typescript
const ably = getAblyRest();
await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "COMPLETED" });
```

This happens in:
- `updateOrderStatus` — kitchen changes order status (CONFIRMED → PREPARING → READYFORPICKUP)
- `confirmCodDelivery` — delivery partner confirms COD delivery
- `confirmPayment` — payment verified, order starts PREPARING, cravings popup sent, kitchen notified of new order
- `refundOrderItem` — item marked unavailable, refund initiated

## Token Authentication (`app/api/ably-token/route.ts`)

**Why custom token endpoint?** We need to verify the user's session AND check their authorization for each channel before issuing a token.

**How authorization works:**
1. User must have a valid session (checked via Better-Auth)
2. For `order:{id}` — only the customer who placed the order, the assigned delivery partner, or the kitchen partner can subscribe
3. For `kitchen:{id}` — only that kitchen partner
4. For `deliveryPartner:{id}` — only that delivery partner
5. Default fallback: subscribe to `user:{userId}` (personal notification channel)

The token's `capability` object defines exactly which channels the client can access and what operations are allowed (subscribe only — clients never publish directly).

## Subscription Hooks (`hooks/useAblySubscribe.ts`)

**Why ref-based callback?** The callback reference changes on every render if defined inline. Wrapping it in a ref (`callbackRef.current = onMessage`) means the Ably subscription handler always calls the latest callback without re-subscribing on every render.

**Why cleanup on deps change?** When `channelName` or `enabled` changes, we must unsubscribe from the old channel and subscribe to the new one. The `useEffect` return function handles this cleanup.

## Events Reference

| Event Name | Published When | Payload |
|------------|---------------|---------|
| `order:status` | Order status changes | `{ status: "PREPARING" \| "COMPLETED" }` |
| `order:confirmation-code` | OTP generated | `{ code: "1234" }` |
| `order:cravings` | Payment confirmed | `{ items: [...], message: "..." }` |
| `order:item-unavailable` | Item refunded | `{ orderItemId, itemName, refundAmount, reason }` |
| `order:refund` | Full refund processed | `{ reason, amount }` |
| `delivery:status` | Delivery status changes | `{ status, cashCollected }` |
| `delivery:location` | Delivery partner location | `{ latitude, longitude }` |
| `queue:new-order` | New order for kitchen | `{ orderId, items: [...] }` |
| `queue:status` | Order status for kitchen queue | `{ orderId, status }` |
| `order:ready` | Order ready for pickup | `{ orderId }` |
