# Routes & Pages

## Public Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | SSR | Home page with hero carousel, top-rated kitchens, recently joined, menu by time slot (Breakfast/Lunch/Snacks/Dinner), offers, how-it-works |
| `/menu` | Static | Tomorrow's menu grouped by time slot with filters |
| `/menu/[id]` | ISR (1h) | Menu item detail with photos, badges, pricing, add-to-cart |
| `/menu/category/[slug]` | Dynamic | Filtered menu by category (breakfast, lunch, evening-snacks, dinner) |
| `/kitchen/[slug]` | Dynamic | Kitchen detail page with full menu, rating, image, cuisine tags, search/filter items |
| `/search` | Static | Search page with autocomplete and kitchen results |
| `/cart` | Static | Cart with order type selector, coupon input, payment method, Razorpay/COD checkout |
| `/login` | Static | Phone OTP login |
| `/signup` | Static | Registration form |
| `/contact` | Static | Support ticket form |
| `/invite/[token]` | Dynamic | Admin invite acceptance |

## Customer Account Routes

| Route | Type | Description |
|-------|------|-------------|
| `/account/profile` | Static | Edit name/email, manage addresses, referral code, loyalty points |
| `/account/orders` | Static | Order history with status timeline, cancel, rate, cravings popup |
| `/account/orders/[id]/track` | Dynamic | Live delivery tracking with map |

## Legal Routes (Route Group: `(policy)`)

| Route | Description |
|-------|-------------|
| `/terms-of-use` | Terms of Use (MDX) |
| `/privacy-policy` | Privacy Policy (MDX) |

## Kitchen Partner Routes

| Route | Type | Description |
|-------|------|-------------|
| `/kitchen` | Static | Marketing landing page |
| `/kitchen/login` | Static | OTP login (role: kitchen) |
| `/kitchen/signup` | Static | Signup form |
| `/kitchen/dashboard` | Static | Dashboard with revenue/orders/rating stats + charts |
| `/kitchen/dashboard/menu` | Static | CRUD menu items with Cloudinary image upload |
| `/kitchen/dashboard/orders` | Static | Incoming orders with status updates |
| `/kitchen/dashboard/payments` | Static | Bank details + payout history |
| `/kitchen/dashboard/profile` | Static | Edit profile, address with map, KYC/bank status |

## Delivery Partner Routes

| Route | Type | Description |
|-------|------|-------------|
| `/delivery-partner/login` | Static | OTP login (role: delivery-partner) |
| `/delivery-partner/signup` | Static | Signup form |
| `/delivery-partner/dashboard` | Static | Assigned deliveries, COD confirm, live tracking |
| `/delivery-partner/dashboard/profile` | Static | Edit profile |
| `/delivery-partner/dashboard/bank-details` | Static | Bank/UPI/GPay/PhonePe details |

## Admin Routes

| Route | Type | Description |
|-------|------|-------------|
| `/admin` | Static | Dashboard with stats + charts + recent orders |
| `/admin/orders` | Static | Manage all orders, assign delivery partners |
| `/admin/menu` | Static | CRUD all menu items across kitchens |
| `/admin/kitchens` | Static | Approve/reject/suspend kitchen partners |
| `/admin/delivery` | Static | Approve/reject/suspend delivery partners |
| `/admin/customers` | Static | Search/ban/unban customers |
| `/admin/payments` | Static | COD payment settlement |
| `/admin/coupons` | Static | CRUD discount coupons |
| `/admin/payment-offers` | Static | CRUD payment method offers |
| `/admin/cms` | Static | Manage categories |
| `/admin/support` | Static | Support tickets with replies |
| `/admin/invite` | Static | Manage admin invites and permissions |
| `/admin/2fa` | Static | Two-factor authentication challenge |
| `/admin/2fa-setup` | Static | Enable/disable 2FA, show backup codes |
| `/admin/cash-reconciliation` | Dynamic | COD cash reconciliation with variance tracking |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...all]` | All | Better-Auth endpoints |
| `/api/auth/twilio/send` | POST | Send OTP SMS |
| `/api/auth/twilio/verify` | POST | Verify OTP |
| `/api/auth/razorpay/webhook` | POST | Razorpay payment webhook |
| `/api/account/profile` | GET/PUT | User profile |
| `/api/payment/create-order` | POST | Create Razorpay order |
| `/api/payment/verify` | POST | Verify payment signature |
| `/api/payment/fail` | POST | Handle payment failure |
| `/api/payment/cod-eligibility` | GET | Check COD eligibility |
| `/api/payment/confirm-cod` | POST | Confirm COD order |
| `/api/payment-offers` | GET | Active payment offers |
| `/api/coupon/validate` | POST | Validate coupon |
| `/api/coupon/offers` | POST | Available coupon offers |
| `/api/menu/tomorrow` | GET | Tomorrow's menu with filters |
| `/api/menu/search` | GET | Search menu items |
| `/api/wishlist` | GET/POST | Manage wishlist |
| `/api/support` | POST | Submit support ticket |
| `/api/loyalty/points` | GET | User loyalty points |
| `/api/cravings-banner` | GET | Cravings banner data |
| `/api/push/subscribe` | POST | Subscribe to push notifications |
| `/api/push/vapid-public-key` | GET | VAPID public key |
| `/api/ably-token` | GET | Ably auth token |
| `/api/geocode/search` | GET | Address to coordinates |
| `/api/geocode/reverse` | GET | Coordinates to address |
| `/api/route/road-route` | GET | Road route between points |
| `/api/cloudinary/sign` | POST | Cloudinary upload signature |
| `/api/cloudinary/delete` | POST | Delete Cloudinary asset |
| `/api/kitchen/stock` | POST | Update item stock |
| `/api/kitchen/earnings` | GET | Kitchen earnings data |
| `/api/delivery/order-status` | POST | Update delivery status |
| `/api/delivery/online` | POST | Toggle online/offline |
| `/api/delivery/confirm-cod-delivery` | POST | Confirm COD delivery |
| `/api/rider/location` | POST/GET | Rider GPS location |
| `/api/admin/*` | Various | Admin operations |
| `/api/cron/*` | POST | Cron job endpoints |
| `/api/jobs/*` | POST | Background job endpoints |
