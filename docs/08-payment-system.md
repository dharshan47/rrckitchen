# Payment System Architecture

> **Status:** Active
> **Last updated:** 2026-08-05
> **Cross-refs:** [API Design](04-api-design.md), [Data Model](03-data-model.md), [Architecture Decisions (Razorpay)](02-architecture-decisions.md#adr-012-payment---razorpay--cod)

---

## 1. Payment System Overview

```mermaid
%%{init: {'flowchart': {'curve': 'basis', 'useMaxWidth': true, 'nodeSpacing': 50, 'rankSpacing': 50}}}%%
flowchart TB
    subgraph "Payment Methods"
        Online["Razorpay Checkout"]
        UPI["UPI Smart Collect"]
    end

    subgraph "Online Flow"
        O1["createPaymentOrder (Order + Payment PENDING)"]
        O2["Checkout Modal (UPI/NB/Wallet/Cards)"]
        O3["Payment Verification (HMAC)"]
        O4["Order PREPARING + Payout + Loyalty"]
        O5["Refund Lifecycle"]
    end

    subgraph "UPI Smart Collect Flow"
        U1["Create Virtual Payment Address (VPA)"]
        U2["Customer pays to VPA"]
        U3["Poll VPA payments"]
        U4["confirmPayment on capture"]
    end

    subgraph "Supporting Systems"
        WH["Webhook Handler (/api/auth/razorpay/webhook)"]
        RF["Refund Manager"]
        AUD["Audit Trail"]
        J["Jobs: retry-refund, settle-payouts"]
    end

    Online --> O1
    O1 --> O2
    O2 --> O3
    O3 --> O4
    O4 --> O5

    UPI --> U1
    U1 --> U2
    U2 --> U3
    U3 --> U4

    O3 --> WH
    O5 --> RF
    WH --> AUD
    RF --> AUD
    RF --> J
```

**COD was fully removed (ADR-019).** There is no cash collection, delivery OTP, remittance, or reconciliation engine. All orders are prepaid.

---

## 2. Online Payment Flow

### 2.1 Full Sequence

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend (cart-content)
    participant API as /api/payment/create-order
    participant Razorpay
    participant DB
    participant Ably

    User->>FE: Click "Place Order" (Pay Online)

    FE->>FE: Validate cart (items available, address, config)
    FE->>API: createPaymentOrder({ items, idempotencyKey, couponCode, serviceDateType })
    API->>DB: $transaction — idempotency + slot-cutoff checks
    Note over API: Create Order (CONFIRMED) + OrderItems + Payment (PENDING)<br/>Allocate publicCode ORD-…, bust menu cache
    API->>Razorpay: POST /v1/orders { amount: paise, currency: "INR", receipt }
    Razorpay-->>API: { id: "order_xxxx", amount, status: "created" }
    API-->>FE: { razorpayOrderId, amount, keyId, orderId }

    Note over FE: Open Razorpay Checkout Modal (explicit method order: UPI → Net Banking → Wallets → Cards)
    FE->>Razorpay: Razorpay.checkout.open(options)
    Razorpay->>User: Show payment UI

    User->>Razorpay: Complete payment (UPI / Card / NetBanking / Wallet)

    alt Payment Success
        Razorpay-->>FE: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        FE->>API: POST /api/payment/verify

        API->>API: HMAC_SHA256(expected = order_id + "|" + payment_id)

        alt Signature Valid
            API->>DB: $transaction
            API->>DB: Payment → SUCCESS (store method + paymentMethodDetail)
            API->>DB: Order → PREPARING
            API->>DB: Create KitchenPayout (gross - 15% commission)
            API->>DB: Award loyalty points

            API->>Ably: order:{id} "order:status" + kitchen:{id} "queue:new-order" + "order:cravings"
            API->>Redis: Stream "order-events" type ORDER_CONFIRMED
            API-->>FE: { success: true, orderId, status: "PREPARING" }

            FE->>FE: clearCart()
            FE->>User: Show AddToCartPopup (cravings recommendations)
        else Signature Invalid
            API-->>FE: { success: false, error: "SIGNATURE_MISMATCH" }
        end

    else Payment Failed / Modal Dismissed
        Razorpay-->>FE: { error: { code, description } } | modal dismissed
        FE->>API: POST /api/payment/fail
        API->>DB: Payment → FAILED, Order → CANCELLED
        API-->>FE: { success: false }
        FE->>User: Show error + retry button
    end
```

### 2.2 Razorpay Checkout Options

```typescript
// hooks/useRazorpay.ts — initiateCheckout()
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,                       // Amount in paise
  currency: 'INR',
  name: 'RRC Kitchen',
  description: `Order #${order.orderId}`,
  order_id: order.razorpayOrderId,
  prefill: { contact: user.phone },
  theme: { color: '#EE7005' },
  modal: {
    ondismiss: () => failPayment(orderId),    // POST /api/payment/fail
  },
  handler: (response) => verifyPayment(response), // POST /api/payment/verify
};

// Method order is forced via Razorpay's payment block config:
// UPI → Net Banking → Wallets → Cards (PAYMENT_BLOCKS_CONFIG)
```

### 2.3 Webhook Processing

```mermaid
sequenceDiagram
    participant Razorpay
    participant WH as /api/auth/razorpay/webhook
    participant DB
    participant Ably

    Razorpay->>WH: POST webhook event
    Note over Razorpay,WH: Signed with HMAC-SHA256 (RAZORPAY_WEBHOOK_SECRET)

    WH->>WH: Verify webhook signature
    alt Invalid Signature
        WH-->>Razorpay: 401 Unauthorized
    end

    WH->>WH: Parse event type

    alt payment.captured
        WH->>DB: Find Payment by razorpay_order_id (idempotent)
        WH->>DB: Payment → SUCCESS, Order → PREPARING
        WH->>Ably: order:{orderId} "order:status"
    else payment.failed
        WH->>DB: Payment → FAILED, Order → CANCELLED
    else refund.processed
        WH->>DB: Refund → PROCESSED
        WH->>Ably: order:{orderId} "refund:processed"
    end

    WH->>DB: AdminAuditLog / notification log entry
    WH-->>Razorpay: 200 OK
```

---

## 3. UPI Smart Collect (backend-ready)

Falls back on / complements Razorpay Checkout for UPI-only payment: a per-order Razorpay Virtual Payment Address (VPA) that the customer pays from any UPI app.

### 3.1 Flow

```mermaid
sequenceDiagram
    participant Customer
    participant API as /api/payment/upi-collect/create
    participant Razorpay
    participant DB
    participant Poll as /api/payment/upi-collect/status

    Customer->>API: Create UPI collect request (orderId)
    API->>DB: Payment (provider: UPI_COLLECT, PENDING)
    API->>Razorpay: virtualAccounts.create (VPA, 30-min expiry)
    API->>DB: UpiCollectRequest (vpa, expiresAt)
    API-->>Customer: { vpa, qr, expiresAt }

    Customer->>Customer: Pay via UPI app (scan QR / enter VPA)

    loop Poll every 4s (hooks/useUpiCollect.ts)
        Poll->>Razorpay: virtualAccounts.fetchPayments
        alt Payment captured
            Poll->>DB: confirmPayment(..., "upi", { source: "smart_collect" })
            Poll->>DB: UpiCollectRequest → PAID
            Poll-->>Customer: { status: "PAID" }
        else Expired
            Poll->>DB: UpiCollectRequest → EXPIRED
        end
    end
```

### 3.2 Model

- `UpiCollectRequest`: `orderId` (unique), `paymentId` (unique), `vpa`, `razorpayVpaId`, `status` (`PENDING | PAID | EXPIRED | FAILED`), `expiresAt` (30 min)
- `Payment.provider` distinguishes `RAZORPAY` vs `UPI_COLLECT`
- Helpers in `lib/razorpay.ts`: `createVpa()`, `fetchVpaPayments()`

> **Status note:** server flow, API routes, and the `useUpiCollect` hook are complete and tested, but no UI currently wires the flow — Razorpay Checkout is the active path.

---

## 5. Refund Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initiated: refundOrderItem(orderItemId, reason)
    Initiated --> Processing: Razorpay refund API
    Processing --> Processed: Webhook "refund.processed"
    Processing --> Failed: API error
    Failed --> Initiated: Retry (via /api/jobs/retry-refund, max 3)
    Processed --> [*]
```

Entry points:
- `refundOrderItem(orderItemId, reason)` — per-item refund: orderItem → UNAVAILABLE, order → REFUNDED, payment → PARTIAL_REFUND/REFUNDED, publishes `order:item-unavailable`
- `refundOrder(orderId, reason)` — full-order refund, publishes `order:refund`
- `processWebhookRefund(razorpayRefundId)` — marks PROCESSED on `refund.processed` webhook
- Background retry: `POST /api/jobs/retry-refund`

### Refund Rules

| Scenario | Refund Method | Processing Time | Fee |
|----------|--------------|-----------------|-----|
| Item unavailable / kitchen rejected | Per-item refund to source | 3-5 business days | None |
| Order cancelled before preparation | Full refund to source | 3-5 business days | None |
| Quality complaint (verified) | Partial/Full refund | 3-5 business days | None |
| Duplicate payment | Full refund | 24-48 hours | None |

---

## 6. Payment Security

| Concern | Mitigation |
|---------|------------|
| **Amount tampering** | Amount calculated server-side; Razorpay verifies amount against order |
| **Duplicate payment** | Idempotency via `idempotencyKey` (unique) on Order and Payment |
| **Webhook spoofing** | HMAC-SHA256 verification with `RAZORPAY_WEBHOOK_SECRET` |
| **Refund fraud** | Refund only to original payment source; manual review for >₹1000; large refunds require `AdminApprovalRequest` |
| **PCI DSS scope** | No card data stored; handled entirely by Razorpay (SAQ A eligible) |
| **UPI VPA abuse** | 30-min VPA expiry; idempotent `UpiCollectRequest`; payment matched to the exact order |

---

## 7. Error Handling

### Online Payment Errors

| Error | User Message | Recovery |
|-------|-------------|----------|
| `PAYMENT_CANCELLED` | "Payment cancelled" | Retry checkout |
| `PAYMENT_FAILED` | "Payment failed. Please try again" | Retry; check bank limit |
| `AMOUNT_MISMATCH` | "Order amount changed. Please try again" | Refresh checkout |
| `SIGNATURE_MISMATCH` | "Payment verification failed" | Contact support; order not placed |
| `WEBHOOK_FAILURE` | (Silent - internal) | Admin alert; manual reconciliation |

---

## 8. Accounting Impact

```mermaid
%%{init: {'flowchart': {'curve': 'basis', 'useMaxWidth': true}}}%%
flowchart LR
    subgraph "Per Order (Online)"
        A["Customer pays 100"]
        B["Platform fee: 5"]
        C["Kitchen payout: 95"]
    end

    subgraph "Platform Revenue"
        H["Online: Rs 5 - Razorpay fee"]
    end

    A --> B
    A --> C
    B --> H
```
