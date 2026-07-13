# Database Schema (Prisma)

**Provider**: PostgreSQL  
**ORM**: Prisma v7  
**Schema**: `prisma/schema.prisma` (1179 lines)

## Domain Models

### Identity & Access
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `User` | id, phone, email, name, role, banned, loyaltyPoints, twoFactorEnabled, codEligible | Core user account |
| `Session` | id, userId, expiresAt, impersonatedBy | Auth sessions with admin impersonation |
| `Account` | id, userId, providerId, accountId | OAuth/linked accounts |
| `OtpCode` | id, identifier, code, expiresAt, attempts | OTP with rate limiting |
| `TwoFactor` | id, userId, secret, backupCodes | TOTP 2FA |
| `Role` / `UserRole` | id, name (enum), userId | Role-based access control |

### Kitchen Partner
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `KitchenPartner` | id, userId, status (enum), avgRating | Core kitchen profile with status workflow |
| `KitchenAlias` | id, displayName, sequenceNumber | Public kitchen display name |
| `KitchenPartnerKyc` | id, panNumber, bankAccount, ifsc, upiId | KYC + bank/payout details |
| `KitchenAddress` | id, addressLine, lat, lng, pincode | Geolocated kitchen address |
| `Menu` | id, kitchenPartnerId, isActive | Menu grouping |
| `MenuItem` | id, menuId, name, price, compareAtPrice, foodType (VEG/NONVEG), timeSlot (MORNING/LUNCH/EVENINGSNACKS/DINNER), dailyStock | Individual item |
| `MenuItemPhoto` | id, menuItemId, imageUrl, sortOrder | Cloudinary images |
| `MenuItemDailyStock` | id, menuItemId, date, stock | Per-date batch stock |
| `MenuItemFeedback` | id, menuItemId, userId, isThumbsUp, tags | Per-item feedback |

### Delivery Partner
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `DeliveryPartner` | id, userId, status, isOnline, cashInHand, codEligible | Core delivery profile |
| `DeliveryPartnerKyc` | id, bankAccount, ifsc, upiId, gpayNumber, phonepeNumber | KYC + payment details |
| `DeliveryLocation` | id, deliveryPartnerId, orderId, lat, lng, timestamp | Real-time GPS tracking |
| `DeliveryAssignment` | id, orderId, deliveryPartnerId, status, assignedAt | Order-to-delivery assignment |

### Commerce
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Order` | id, userId, orderType, status (enum), deliveryStatus, totalAmount, deliveryOtp, codExpectedAmount, codEnteredAmount | Core order with full lifecycle |
| `OrderItem` | id, orderId, menuItemId, kitchenPartnerId, price, quantity, packagingFee, status | Per-item with kitchen attribution |
| `OrderStatusHistory` | id, orderId, fromStatus, toStatus, changedBy | Audit trail |
| `Payment` | id, orderId, provider (RAZORPAY/COD), status, razorpayOrderId, amount | Payment records |
| `Refund` | id, paymentId, amount, reason, status | Full/partial refunds |
| `Review` | id, orderId, kitchenPartnerId, rating (1-5), tasteRating, packagingRating, portionSizeRating | Multi-dimension kitchen review |
| `DeliveryReview` | id, orderId, deliveryPartnerId, speedRating, behaviorRating, safetyRating | Delivery experience rating |

### Offers & Coupons
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Coupon` | code, discountType (FLAT/PERCENTAGE), discountValue, minOrderValue, maxUsage, validFrom, validTo | Discount coupons |
| `CouponRedemption` | id, couponId, userId, orderId | Coupon usage tracking |
| `PaymentOffer` | id, offerType (UPI/WALLET/CARDS/NETBANKING/ALL), discountValue, maxDiscount | Payment method offers |

### Payouts & Reconciliation
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `KitchenPayout` | id, orderItemId, grossAmount, commissionAmount, netAmount, status | Per-order kitchen payout |
| `DeliveryPartnerPayout` | id, deliveryAssignmentId, baseAmount, bonusAmount, status | Per-delivery payout |
| `CashRemittance` | id, deliveryPartnerId, amount, method, remittedAt | Cash collection tracking |
| `CodVariance` | id, deliveryAssignmentId, expectedAmount, enteredAmount, varianceAmount, resolvedAt | Discrepancy tracking |

### Support
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `SupportTicket` | id, userId, subject, description, priority, status | Customer support |
| `TicketMessage` | id, ticketId, senderId, message | Ticket conversations |

### Engagement
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Referral` | id, referrerId, refereeId, rewardGiven | Referral tracking |
| `LoyaltyPoints` | id, userId, totalPoints, tier | Points + tier system |
| `LoyaltyTransaction` | id, loyaltyPointsId, points, type, description | Point history |
| `WishlistItem` | id, userId, menuItemId | Saved items |
| `PushSubscription` | id, userId, endpoint, keys | Web push subscriptions |

### Admin
| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `AdminProfile` | id, userId, permissions (bitfield) | Admin permissions |
| `AdminInvite` | id, token, permissions, expiresAt, usedAt | Time-limited invites |
| `AdminAuditLog` | id, adminId, action, targetType, targetId, details | Full audit trail |

## Enums

| Enum | Values |
|------|--------|
| `RoleName` | CUSTOMER, KITCHENPARTNER, DELIVERYPARTNER, ADMIN, SUPPORTAGENT |
| `PartnerStatus` | PENDINGAPPROVAL, APPROVED, REJECTED, ACTIVE, SUSPENDED |
| `FoodType` | VEG, NONVEG |
| `TimeSlot` | MORNING, LUNCH, EVENINGSNACKS, DINNER |
| `OrderStatus` | CONFIRMED, PREPARING, READYFORPICKUP, COMPLETED, CANCELLED, REFUNDED |
| `DeliveryStatus` | ASSIGNED, PICKEDUP, OUTFORDELIVERY, DELIVERED, FAILED |
| `PaymentStatus` | PENDING, SUCCESS, FAILED, REFUNDED |
| `DiscountType` | FLAT, PERCENTAGE |
| `CouponScope` | PLATFORM, KITCHEN_SPECIFIC |

## Key Indexes
- `Order` - userId, status, createdAt
- `OrderItem` - kitchenPartnerId, status
- `Review` - kitchenPartnerId
- `DeliveryLocation` - deliveryPartnerId, timestamp
- `MenuItemDailyStock` - menuItemId, date (unique)
