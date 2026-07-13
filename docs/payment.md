# Payment System

## Why Two Methods?

**Razorpay** handles online payments (cards, UPI, NetBanking, Wallet) with full PCI compliance and 3D Secure. **Cash on Delivery** serves users who prefer paying cash or don't have digital payment methods.

---

## Online Payment (Razorpay)

### How it works

1. **User clicks "Place Order"** → Frontend calls `POST /api/payment/create-order`
2. **Server creates a Razorpay order** via the Razorpay SDK — this returns an `order_id`, `amount` (in paise), and `currency`
3. **A `Payment` record is saved** in our database linking the Razorpay `order_id` to our internal user/order
4. **Frontend opens Razorpay Checkout modal** using the client-side key (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) and the order details
5. **User completes payment** in the modal (UPI, card, etc.)
6. **On success**, two things happen:
   - **Client-side**: `POST /api/payment/verify` validates the HMAC signature (Razorpay signs `order_id|payment_id` with the secret key)
   - **Server-side**: Razorpay calls the webhook `POST /api/auth/razorpay/webhook` with `payment.captured` event
7. **`confirmPayment`** updates the order status to `PREPARING`, creates kitchen payout, publishes to Ably channels (customer + kitchen), and triggers the cravings popup

### Why signature verification?

Without verifying the HMAC signature, a malicious user or script could call our verify endpoint with fake payment data. The signature proves the payment was genuinely processed by Razorpay. We also check via webhook for redundancy — the webhook is the authoritative source.

### Webhook events handled

- `payment.captured` — confirms payment, moves order to PREPARING
- `payment.failed` — marks payment as FAILED, cancels order
- `refund.processed` — updates refund status to PROCESSED
- `payout.processed` — updates kitchen/delivery payout status to SETTLED or FAILED

Webhook signature verification uses `RAZORPAY_WEBHOOK_SECRET` (a different secret than the API key, set in Razorpay dashboard) with HMAC-SHA256.

---

## Cash on Delivery

### How it works

1. User selects COD → frontend checks COD eligibility (`GET /api/payment/cod-eligibility`)
2. If eligible, order is placed — `Payment` record created with `CASH_ON_DELIVERY` provider
3. `codAmountExpected` is set to the order total
4. Kitchen prepares the order → delivery partner picks it up
5. **At delivery**: partner opens COD confirmation dialog → enters 4-digit OTP from customer + cash amount collected
6. `POST /api/delivery/confirm-cod-delivery` validates OTP, updates order to COMPLETED, sets `codAmountEntered`
7. Cash is added to the delivery partner's `cashInHand` balance
8. If cash differs from expected, a `CodVariance` record is created for admin review

### Cash Remittance Flow

The delivery partner collects cash from customers → that cash accumulates in their `cashInHand` field. To settle:

1. Admin records a remittance (`CashRemittance` with `PENDING` status) — method is `UPI_TO_PLATFORM`, `BANK_TRANSFER`, or `ADMIN_COLLECTED_CASH`
2. Partner transfers cash to the platform
3. Admin confirms the remittance → `CashRemittance` status becomes `CONFIRMED`, `cashInHand` is decremented

**Auto-offsetting**: If a partner has >₹500 in hand AND has pending payouts, `reconcileOverdueCash()` automatically offsets the cash against the payout amount — reducing what the platform needs to pay.

### COD eligibility

Partners are ineligible if:
- `codEligible` is false (admin toggle)
- `cashInHand` exceeds ₹3000 (prevents accumulating too much cash)

---

## Kitchen Payouts

### How they work

After payment is confirmed, `createKitchenPayout` is called:
1. Groups order items by kitchen partner
2. Calculates per kitchen: `Gross - (Gross × 15% commission) - Coupon share = Net`
3. Creates/updates a `KitchenPayout` record with `PENDING` status
4. Admin can settle via RazorpayX (UPI or bank transfer) — `NORMAL` speed, `queue_if_low_balance: true`

### Why RazorpayX?

RazorpayX handles the actual money transfer to kitchen partners' bank accounts or UPI IDs. It provides a single API for both payout creation and status tracking. The webhook (`payout.processed`) updates our local payout status.

---

## Delivery Partner Payouts

### How they work

`createDeliveryPayout` runs on COD delivery confirmation:
1. Creates/updates a `DeliveryPartnerPayout` with the commission amount (15% of order total)
2. Settlement via RazorpayX — UPI or IMPS based on the partner's KYC
3. Status tracks: `PENDING` → `PROCESSING` → `SETTLED` or `FAILED`

---

## Key Decisions

| Decision | Why |
|----------|-----|
| Amounts in paise (×100) | Razorpay treats all amounts as smallest currency unit — avoids floating-point errors |
| Server-side total calculation | Prevents client tampering with prices |
| Webhook + client verify both run | Client verification gives instant feedback; webhook is the fallback if client fails |
| CODVariance tracking | Cash mismatches happen — recording them with exact amounts enables investigation |
| Commission at 15% | Fixed rate simplifies calculation; could be made configurable per kitchen |
