# Payment System Architecture

> **Status:** Active
> **Last updated:** 2026-07-21
> **Cross-refs:** [API Design](04-api-design.md), [Data Model](03-data-model.md), [Architecture Decisions (Razorpay)](02-architecture-decisions.md#adr-012-payment---razorpay--cod)

---

## 1. Payment System Overview

```mermaid
graph TB
    subgraph "Payment Methods"
        Online["Online Payment"]
        COD["Cash on Delivery"]
    end

    subgraph "Online Flow"
        O1["Razorpay Order Creation"]
        O2["Checkout Modal (UPI/Card/NB/Wallet)"]
        O3["Payment Verification"]
        O4["Order Confirmation"]
        O5["Refund Lifecycle"]
    end

    subgraph "COD Flow"
        C1["Eligibility Check"]
        C2["Order Placement"]
        C3["Delivery Collection"]
        C4["Partner Remittance"]
        C5["Reconciliation"]
    end

    subgraph "Supporting Systems"
        WH["Webhook Handler"]
        RC["Reconciliation Engine"]
        RF["Refund Manager"]
        AUD["Audit Trail"]
    end

    Online --> O1
    O1 --> O2
    O2 --> O3
    O3 --> O4
    O4 --> O5

    COD --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5

    O3 --> WH
    O5 --> RF
    C5 --> RC
    WH --> AUD
    RC --> AUD
    RF --> AUD
```

---

## 2. Online Payment Flow

### 2.1 Full Sequence

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant Action as Server Actions
    participant Razorpay
    participant DB
    participant Ably

    User->>FE: Click "Place Order" (Pay Online)

    FE->>FE: Validate cart (items available, stock ok)
    FE->>Action: createRazorpayOrder({ amount })
    Action->>DB: Calculate final amount (subtotal - coupon + tax + delivery)
    Note over Action: Amount in paise (₹199 = 19900)
    Action->>Razorpay: POST /v1/orders { amount, currency: "INR", receipt }
    Razorpay-->>Action: { id: "order_xxxx", amount, status: "created" }
    Action->>DB: Create Payment record (status: "initiated")
    Action-->>FE: { razorpayOrderId: "order_xxxx", amount, key_id, orderId }

    Note over FE: Open Razorpay Checkout Modal
    FE->>Razorpay: Razorpay.checkout.open(options)
    Razorpay->>User: Show payment UI

    User->>Razorpay: Complete payment (UPI / Card / NetBanking / Wallet)

    alt Payment Success
        Razorpay-->>FE: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        FE->>Action: verifyPayment({ payment_id, order_id, signature })

        Action->>Action: HMAC_SHA256(expected = body.order_id + "|" + body.payment_id)
        Note over Action: Compare with razorpay_signature

        alt Signature Valid
            Action->>DB: $transaction
            Action->>DB: Create Order (status: "confirmed")
            Action->>DB: Create OrderItems
            Action->>DB: Update Payment (status: "paid")
            Action->>DB: Deduct KitchenDailyStock
            Action->>DB: Delete CartItems
            Action->>DB: Apply coupon usage increment

            Action->>Ably: Publish "order.{orderId}" = { status: "confirmed" }
            Action-->>FE: { success: true, orderId, redirect: "/orders/{id}" }

            FE->>FE: clearCart()
            FE->>User: Show CravingsPopup + redirect
        else Signature Invalid
            Action-->>FE: { success: false, error: "PAYMENT_VERIFICATION_FAILED" }
        end

    else Payment Failed
        Razorpay-->>FE: { error: { code, description } }
        FE->>Action: handleFailedPayment({ order_id, error })
        Action->>DB: Update Payment (status: "failed")
        Action-->>FE: { success: false }
        FE->>User: Show error + retry button
    end
```

### 2.2 Razorpay Checkout Options

```typescript
const options = {
  key: process.env.RAZORPAY_KEY_ID,           // Razorpay API Key ID
  amount: order.amount,                         // Amount in paise
  currency: 'INR',
  name: 'RRC Kitchen',
  description: `Order #${order.orderId}`,
  order_id: order.razorpayOrderId,              // From createRazorpayOrder
  prefill: {
    contact: user.phone,                        // Auto-fill customer phone
  },
  theme: {
    color: '#EE7005',                           // Brand primary color
  },
  modal: {
    ondismiss: () => {
      // Handle modal close without payment
    },
  },
  handler: async (response) => {
    // Handle successful payment
    const result = await verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });
  },
};
```

### 2.3 Webhook Processing

```mermaid
sequenceDiagram
    participant Razorpay
    participant WH as Webhook Handler
    participant DB
    participant Ably
    participant Admin

    Razorpay->>WH: POST /api/payment/webhook
    Note over Razorpay,WH: Signed with HMAC-SHA256

    WH->>WH: Verify webhook signature
    alt Invalid Signature
        WH-->>Razorpay: 401 Unauthorized
    end

    WH->>WH: Parse event type

    alt payment.captured
        WH->>DB: Find Payment by razorpay_order_id
        DB-->>WH: Payment record
        WH->>DB: Update Payment status = "paid"
        WH->>DB: Update Order status = "confirmed"
        WH->>Ably: Publish order.{orderId} { status: "confirmed" }
        alt Order already confirmed (duplicate webhook)
            WH-->>Razorpay: 200 OK (idempotent)
        end
    else payment.failed
        WH->>DB: Update Payment status = "failed"
        WH->>DB: Update Order status = "payment_failed"
    else payment.refunded
        WH->>DB: Create Refund record
        WH->>DB: Update Payment status = "refunded"
    end

    WH->>DB: Create OrderEvent (audit)
    WH-->>Razorpay: 200 OK
```

---

## 3. COD (Cash on Delivery) Flow

### 3.1 Eligibility Logic

```typescript
async function checkCodEligibility(
  userId: string,
  orderAmount: number
): Promise<{ eligible: boolean; reason?: string }> {
  // Rule 1: Amount limit
  if (orderAmount > 200000) { // ₹2000 in paise
    return { eligible: false, reason: "Order exceeds COD limit" };
  }

  // Rule 2: User history
  const recentFailedCod = await prisma.order.count({
    where: {
      userId,
      paymentMethod: 'cod',
      status: 'cancelled',
      createdAt: { gte: subDays(new Date(), 30) },
    },
  });
  if (recentFailedCod >= 3) {
    return { eligible: false, reason: "Too many failed COD deliveries" };
  }

  // Rule 3: Kitchen accepts COD
  const kitchenAcceptsCod = true; // Configurable per kitchen

  return { eligible: true };
}
```

### 3.2 COD Settlement Flow

```mermaid
sequenceDiagram
    participant Customer
    participant Delivery as Delivery Partner
    participant Platform
    participant Kitchen

    Customer->>Platform: Place COD order
    Platform->>Platform: Inventory hold (stock reserved)

    Kitchen->>Platform: Mark "Ready for Pickup"
    Platform->>Delivery: Assign delivery partner

    Delivery->>Customer: Deliver food
    Customer->>Delivery: Pay cash (exact amount)
    Customer->>Delivery: Provide 4-digit OTP (confirmation)
    Delivery->>Platform: Confirm delivery (OTP)

    Platform->>Platform: Mark order "delivered"
    Platform->>Platform: Record COD receivable: ₹amount

    Note over Delivery: End of day: collect all COD cash
    Delivery->>Platform: Remit COD amount
    Platform->>Platform: Record remittance

    alt Full Remittance
        Platform->>Platform: Variance = 0
        Platform->>Delivery: Full settlement
    else Short/Excess
        Platform->>Platform: Log CodVariance
        Platform->>Delivery: Adjust settlement
    end

    Platform->>Kitchen: Payout (amount - commission)
    Note over Platform: Weekly payout cycle
```

---

## 4. Reconciliation Engine

### 4.1 Data Model

```mermaid
erDiagram
    CodCollection {
        string id PK
        string deliveryPartnerId FK
        date collectionDate
        float totalCollected "Cash collected by delivery partner"
        float totalRemitted "Cash remitted to platform"
        float variance "totalCollected - totalRemitted"
    }

    CodRemittance {
        string id PK
        string deliveryPartnerId FK
        string orderId FK
        float amount "COD amount for this order"
        string status "pending | remitted | reconciled"
    }

    CodVariance {
        string id PK
        string codCollectionId FK
        float expectedAmount
        float actualAmount
        float difference
        string reason "short | excess | unaccounted"
        string resolution "pending | adjusted | written_off"
    }
```

### 4.2 Reconciliation Process

```mermaid
graph TD
    A["Delivery Partner submits<br/>daily COD report"] --> B["System matches against<br/>delivered COD orders"]
    B --> C{"Total Collected =<br/>Total Expected?"}

    C -->|"Yes ✓"| D["No variance<br/>Mark reconciled"]
    C -->|"No ✗"| E["Variance detected"]

    E --> F{"Variance amount?"}

    F -->|"≤ ₹50"| G["Auto write-off<br/>(small variance)"]
    F -->|"> ₹50"| H["Flag for admin review"]

    H --> I["Admin investigates"]
    I --> J["Adjustment or<br/>write-off approved"]

    D --> K["Release delivery<br/>partner settlement"]
    G --> K
    J --> K
```

---

## 5. Refund Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initiated: Admin triggers refund
    Initiated --> Processing: Payment verified
    Processing --> Completed: Razorpay processes refund
    Processing --> Failed: Insufficient balance / technical error
    Failed --> Initiated: Retry (max 3 attempts)
    Completed --> [*]

    state Initiated {
        [*] --> Validating: Check payment method
        Validating --> OnlineRefund: Razorpay payment
        Validating --> CODAdjustment: COD order
    }

    state OnlineRefund {
        [*] --> RefundAPI: POST /v1/refunds
        RefundAPI --> Success: Refund initiated
        RefundAPI --> Failure: API error
    }

    state CODAdjustment {
        [*] --> ManualEntry: Adjust in next settlement
        ManualEntry --> Success: Adjusted
    }
```

### Refund Rules

| Scenario | Refund Method | Processing Time | Fee |
|----------|--------------|-----------------|-----|
| Order cancelled before preparation | Full refund to source | 3-5 business days | None |
| Order cancelled during preparation | Partial refund (net of ingredient cost) | 3-5 business days | Platform fee retained |
| Delivery failed (no-show) | Full refund | 3-5 business days | None |
| Quality complaint (verified) | Partial/Full refund | 3-5 business days | None |
| Duplicate payment | Full refund | 24-48 hours | None |

---

## 6. Payment Security

| Concern | Mitigation |
|---------|------------|
| **Amount tampering** | Amount calculated server-side; Razorpay verifies amount against order |
| **Duplicate payment** | Idempotency via `razorpay_order_id` unique constraint |
| **Webhook spoofing** | HMAC-SHA256 verification with `RAZORPAY_WEBHOOK_SECRET` |
| **Refund fraud** | Refund only to original payment source; manual review for >₹1000 |
| **PCI DSS scope** | No card data stored; handled entirely by Razorpay (SAQ A eligible) |
| **OTP delivery bypass** | COD requires delivery OTP verification |

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

### COD Errors

| Error | User Message | Recovery |
|-------|-------------|----------|
| `COD_NOT_ELIGIBLE` | "COD not available for this order" | Pay online or reduce order |
| `COD_FAILED` | "COD order could not be placed" | Try again; pay online |
| `DELIVERY_OTP_INVALID` | "Invalid delivery OTP" | Retry OTP |

---

## 8. Accounting Impact

```mermaid
graph LR
    subgraph "Per Order (Online)"
        A["Customer pays ₹100"]
        B["Platform fee: ₹5<br/>(commission + payment gateway)"]
        C["Kitchen payout: ₹95"]
        D["Razorpay fee: ~2%"]
    end

    subgraph "Per Order (COD)"
        E["Customer pays ₹100 cash"]
        F["Cash handling cost: ₹3<br/>(reconciliation + banking)"]
        G["Kitchen payout: ₹97"]
    end

    subgraph "Platform Revenue"
        H["Online: ₹5 - Razorpay fee"]
        I["COD: ₹3"]
    end

    A --> B
    A --> C
    A --> D
    E --> F
    E --> G
    B --> H
    F --> I
```
