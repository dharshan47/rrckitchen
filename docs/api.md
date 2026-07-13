# API Reference

## Authentication

### Better-Auth (catch-all)
```
ALL /api/auth/[...all]
```
Handles sign-in, sign-out, session, and user management via Better-Auth.

### Twilio OTP
```
POST /api/auth/twilio/send
Body: { phone: string }
Response: { success: boolean }

POST /api/auth/twilio/verify
Body: { phone: string, otp: string }
Response: { success: boolean, token?: string }
```

## Account

```
GET /api/account/profile
Response: { id, name, email, phoneNumber }

PUT /api/account/profile
Body: { name?: string, email?: string }
Response: { id, name, email, phoneNumber }
```

## Menu

```
GET /api/menu/tomorrow?q=&foodType=&timeSlot=
Query: q (search), foodType (VEG/NONVEG/ALL), timeSlot (MORNING/LUNCH/EVENINGSNACKS/DINNER/ALL)
Response: MenuItem[]

GET /api/menu/search?q=
Query: q (search term)
Response: { kitchens: Kitchen[], items: MenuItem[] }
```

## Payments

```
POST /api/payment/create-order
Body: { amount, currency, receipt }
Response: { id, amount, currency, key_id }

POST /api/payment/verify
Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId }
Response: { success: boolean, orderId }

POST /api/payment/fail
Body: { orderId }
Response: { success: boolean }

GET /api/payment/cod-eligibility
Response: { eligible: boolean, reason?: string }

POST /api/payment/confirm-cod
Body: { orderId }
Response: { success: boolean, orderId }
```

## Payment Offers

```
GET /api/payment-offers
Response: PaymentOffer[]
```

## Coupons

```
POST /api/coupon/validate
Body: { code, cartTotal }
Response: { valid: boolean, discount?: number, message?: string }

POST /api/coupon/offers
Body: { cartTotal }
Response: { coupons: CouponOffer[] }
```

## Wishlist

```
GET /api/wishlist
Response: WishlistItem[]

POST /api/wishlist
Body: { menuItemId }
Response: { added: boolean, removed: boolean }
```

## Location/Geocoding

```
GET /api/geocode/search?q=
Query: q (address query)
Response: { lat, lng, display_name }[]

GET /api/geocode/reverse?lat=&lon=
Response: { display_name, address }

GET /api/route/road-route?originLat=&originLng=&destLat=&destLng=
Response: { coordinates: [number, number][], distance: number }
```

## Push Notifications

```
GET /api/push/vapid-public-key
Response: { publicKey: string }

POST /api/push/subscribe
Body: { endpoint, keys: { p256dh, auth } }
Response: { success: boolean }
```

## Real-time

```
GET /api/ably-token?clientId=
Response: { token: string }
```

## Admin APIs

```
GET  /api/admin/cod-orders
POST /api/admin/settle-cod
POST /api/admin/record-remittance
POST /api/admin/confirm-remittance
POST /api/admin/resolve-variance
POST /api/admin/toggle-cod-eligibility
POST /api/admin/support (reply/status change)
GET  /api/admin/invite
POST /api/admin/invite (create)
```

## Delivery

```
POST /api/delivery/order-status
Body: { orderId, status }
Response: { success }

POST /api/delivery/online
Body: { isOnline: boolean }
Response: { success }

POST /api/delivery/confirm-cod-delivery
Body: { assignmentId, amountCollected }
Response: { success, variance?: number }

POST /api/rider/location
Body: { orderId, lat, lng }
Response: { success }

GET /api/rider/location?orderId=
Response: { lat, lng, timestamp }
```

## Kitchen

```
POST /api/kitchen/stock
Body: { menuItemId, stock }
Response: { success }

GET /api/kitchen/earnings?startDate=&endDate=
Response: { earnings: number, orders: number }
```

## Support

```
POST /api/support
Body: { subject, description, orderId? }
Response: { success, ticketId }
```

## Cron / Jobs

```
POST /api/cron/process-order-events
POST /api/jobs/settle-payouts
POST /api/jobs/retry-refund
POST /api/jobs/cravings-nudge
```
