# Server Actions

All business logic is implemented as **server actions** in `actions/` directory. These are type-safe functions that run on the server and can be called directly from client components.

## Catalog Actions

### `actions/catalog/menu.ts`
```typescript
getMenuItemById(id: string)       // Get single menu item with kitchen, photos, rating
getTomorrowMenu(params)           // Get tomorrow's menu with filters
```
- Fetches menu items with kitchen partner details
- Computes average rating from reviews
- Returns formatted item with photos

### `actions/catalog/home-data.ts`
```typescript
getHomePageData(userId?: string)  // Get home page data
getKitchenDetail(slug: string)    // Get kitchen detail with menu items
```
- Top-rated kitchens (by average review rating)
- Recently joined kitchens
- Recent order kitchens (for logged-in users)
- Kitchen detail with display name, image, rating, cuisine tags, and full menu items grouped by time slot
- Category search also matches menu item names/descriptions

### `actions/catalog/cross-kitchen-search.ts`
```typescript
crossKitchenSearch(query: string) // Search across all kitchens
```
- Searches kitchen names and menu items
- Uses Redis for caching popular searches
- Returns matched kitchens and items

### `actions/catalog/explore.ts`
```typescript
exploreKitchens(category, page, limit)  // Paginated kitchen exploration
getKitchenCategories()                   // Get all cuisine categories
getTrendingKitchens()                    // Get trending/popular kitchens
```

## Cart & Checkout Actions

### `actions/cart-checkout/address.ts`
```typescript
getUserAddresses()                 // Get user's saved addresses
addAddress(data)                   // Add new address
deleteAddress(id)                  // Delete address
```

### `actions/cart-checkout/coupon.ts`
```typescript
validateCoupon(code, cartTotal)    // Validate and calculate discount
```

### `actions/cart-checkout/cod-eligibility.ts`
```typescript
checkCodEligibility(userId)        // Check if user can use COD
```

## Order Actions

### `actions/orders/orders.ts`
```typescript
getUserOrders(options)             // Get user's order history
getOrderTracking(orderId)          // Get order tracking details
cancelOrder(orderId)               // Cancel an order
```

## Payment Actions

### `actions/payments/payment.ts`
```typescript
createRazorpayOrder(amount)        // Create Razorpay payment order
verifyPayment(payload)             // Verify payment signature
```

### `actions/payments/refund.ts`
```typescript
initiateRefund(paymentId, amount)  // Start refund process
```

### `actions/payments/cod-checkout.ts`
```typescript
createCodOrder(orderData)          // Create COD order
```

## Review Actions

### `actions/reviews/review-actions.ts`
```typescript
submitKitchenReview(orderId, rating, ...)    // Submit kitchen rating
```

### `actions/reviews/delivery-review.ts`
```typescript
submitDeliveryReview(orderId, rating, ...)   // Submit delivery rating
```

## Delivery Actions

### `actions/delivery/confirm-cod-delivery.ts`
```typescript
confirmCodDelivery(assignmentId, amountCollected)
```

### `actions/delivery/remit-cash.ts`
```typescript
recordRemittance(deliveryPartnerId, amount, method)
confirmRemittance(remittanceId)
resolveVariance(varianceId, resolution)
```

## Admin Actions

### `actions/admin/dashboard.ts`
```typescript
getAdminDashboardData()            // Admin dashboard stats + charts
getKitchenDashboardData()          // Kitchen dashboard data (address now includes doorNo, area, landmark)
getDeliveryDashboardData()         // Delivery dashboard data
updateKitchenAddress(id, lineOne, lat, lng, pincode, doorNo?, area?, landmark?)  // Update kitchen address
```

### `actions/admin/admin-menu.ts`
```typescript
getAllMenuItems(filters)           // All menu items (admin)
createMenuItem(data)               // Create menu item
updateMenuItem(id, data)           // Update menu item
deleteMenuItem(id)                 // Delete menu item
```

### `actions/admin/admin-partners.ts`
```typescript
getAllKitchens()                   // All kitchen partners
getAllDeliveryPartners()           // All delivery partners
approveKitchen(id)                 // Approve kitchen
rejectKitchen(id, reason)          // Reject kitchen
suspendKitchen(id)                 // Suspend kitchen
```

### `actions/admin/admin-coupons.ts`
```typescript
getAllCoupons()                    // All coupons
createCoupon(data)                 // Create coupon
updateCoupon(id, data)             // Update coupon
deleteCoupon(id)                   // Delete coupon
```

### `actions/admin/admin-cms.ts`
```typescript
getAllCategories()                 // Get all categories with kitchen count
addCategory(data)                  // Create or reactivate a category
toggleCategory(id, isActive)       // Toggle category active status
```

### `actions/admin/invites-actions.ts`
```typescript
createAdminInvite(permissions)     // Create invite link
deactivateAdmin(id)                // Deactivate admin
getAdminInvites()                  // List invites
```

## Notification Actions

### `actions/notifications/cravings-nudge.ts`
```typescript
processCravingsNudge(daysSinceLastOrder)  // Send push nudge to inactive users
getUserCravingBanner()                     // Get cravings banner data
```
