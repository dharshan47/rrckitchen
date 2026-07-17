# User Roles & Dashboards

## Role Overview

| Role | Portal | Auth Method | Access |
|------|--------|-------------|--------|
| Customer | `/account/*` | Phone OTP | Browse, order, track, review |
| Kitchen Partner | `/kitchen/dashboard/*` | Phone OTP | Manage menu, orders, profile |
| Delivery Partner | `/delivery-partner/dashboard/*` | Phone OTP | Accept deliveries, track, COD |
| Admin | `/admin/*` | Email + 2FA | Full platform management |
| Support Agent | `/admin/*` | Email + 2FA | Limited admin (support only) |

## Customer Flow

```
1. Browse home page (top-rated, by time slot)
2. Search menu items
3. View item details (photos, price, rating)
4. Add to cart (with wishlist)
5. Select order type (Pre-book / Order Now)
6. Apply coupon
7. Choose payment method (Online / COD)
8. Checkout (Razorpay / COD)
9. Track order in real-time
10. Rate kitchen and delivery after delivery
```

## Kitchen Partner Flow

```
1. Sign up / Login
2. Complete KYC (bank details, address)
3. Create menu items (name, price, photos, time slot)
4. Manage daily stock
5. View incoming orders
6. Update order status (Confirm -> Preparing -> Ready for Pickup)
7. View earnings dashboard
8. Request payout
```

## Delivery Partner Flow

```
1. Sign up / Login
2. Complete KYC (bank details, UPI)
3. Go online (toggle availability)
4. Receive delivery assignments
5. Pick up order from kitchen
6. Deliver to customer
7. Collect COD amount (if applicable)
8. Confirm delivery (OTP verification)
9. Remit cash to platform
```

## Admin Flow

```
1. Login with email/password
2. Complete 2FA (TOTP)
3. Dashboard overview (revenue, orders, users)
4. Manage kitchens (approve/reject/suspend)
5. Manage menu items
6. Manage delivery partners
7. Manage customers (ban/unban)
8. Process COD payments
9. Cash reconciliation
10. Create coupons and payment offers
11. Manage support tickets
12. Manage CMS categories (add/toggle categories)
12. Invite new admins (granular permissions)
```
