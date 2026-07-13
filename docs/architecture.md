# Architecture

## Overview

RRC Kitchen follows a **layered architecture** with clear separation of concerns:

```
Browser (PWA)
    |
Next.js App Router (Server Components + Client Components)
    |
Server Actions (actions/) --> Business Logic
    |
Prisma ORM (lib/prisma.ts) --> PostgreSQL
    |
External Services: Razorpay, Twilio, Cloudinary, Ably, Upstash Redis
```

## Key Patterns

### 1. Server Components + Client Components

Next.js 16 App Router allows mixing server and client components:

- **Server Components** (default): Fetch data, render HTML, no JavaScript sent to client
  - `app/page.tsx` - Home page data fetching
  - `app/menu/[id]/page.tsx` - Menu item detail (SSR with ISR)
- **Client Components** (`"use client"`): Interactive UI with hooks, state, effects
  - `components/home/home-client.tsx` - Interactive home page
  - `app/cart/page.tsx` - Cart with checkout flow

### 2. Server Actions

All mutations go through **server actions** in `actions/` directory. These are:
- Type-safe functions that run on the server
- Called directly from client components
- Handle validation, authorization, and database operations

### 3. State Management

Three layers of state:

| State Type | Solution | Example |
|-----------|----------|---------|
| Server state | TanStack Query | Menu items, orders, profile |
| Client state | Zustand | Cart items, filters, UI state |
| Form state | React Hook Form | Signup, checkout forms |

### 4. Authentication Flow

Better-Auth handles authentication with:
- **Phone OTP** via Twilio (primary for all roles)
- **Email/password** (secondary)
- **Admin 2FA** with TOTP + backup codes
- **Session management** with JWT

### 5. Payment Flow

```
User clicks "Place Order"
    |
Create Razorpay Order (server action)
    |
Razorpay Checkout (client-side, opens Razorpay UI)
    |
Payment Success --> Verify signature (server action)
    |
Create Order in DB --> Update Stock --> Show Confirmation
    |
COD: User selects COD --> COD eligibility check --> Order confirmed
```

### 6. Real-time Updates

Ably provides real-time communication:
- **Order tracking**: Kitchen -> Delivery Partner -> Customer
- **Delivery location**: GPS coordinates broadcast every few seconds
- **Cravings nudge**: Real-time upsell suggestions after order

### 7. Caching Strategy

| Layer | Strategy |
|-------|----------|
| React Query | staleTime: 30s (menu), refetchOnWindowFocus: false |
| Next.js ISR | revalidate: 3600 (menu detail pages) |
| Redis | Upstash for rate limiting, session cache |
| Prisma | Connection pooling via pgBouncer-compatible adapter |
