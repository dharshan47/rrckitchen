# How RRC Kitchen Works — Complete System Guide

> Everything from architecture and patterns to client-server data flow, with Mermaid diagrams.

---

## 1. High-Level Architecture

```mermaid
C4Context
  Person(customer, "Customer", "Browses menu, orders food")
  Person(kitchen, "Kitchen Partner", "Manages menu, processes orders")
  Person(delivery, "Delivery Partner", "Delivers orders")
  Person(admin, "Admin", "Manages platform")

  System_Boundary(rrc, "RRC Kitchen Platform") {
    System(frontend, "Next.js Frontend", "React, Tailwind, PWA")
    System(api, "Next.js API Routes", "Server Actions & REST")
    System(realTime, "Ably Real-time", "WebSocket messaging")
    System(payment, "Razorpay", "Payment processing")
  }

  System_Ext(db, "PostgreSQL", "Primary database")
  System_Ext(redis, "Upstash Redis", "Cache & rate limiting")
  System_Ext(cloudinary, "Cloudinary", "Image storage")
  System_Ext(sms, "Twilio", "SMS OTP delivery")
  System_Ext(push, "Web Push API", "Push notifications")

  Rel(customer, frontend, "HTTPS", "Browse & order")
  Rel(kitchen, frontend, "HTTPS", "Manage menu/orders")
  Rel(delivery, frontend, "HTTPS", "Accept deliveries")
  Rel(admin, frontend, "HTTPS", "Manage platform")

  Rel(frontend, api, "Server Actions / API", "")
  Rel(frontend, realTime, "WebSocket", "Real-time updates")
  Rel(api, db, "Prisma ORM", "")
  Rel(api, redis, "Upstash Redis", "")
  Rel(api, cloudinary, "Upload API", "")
  Rel(api, sms, "Twilio API", "")
  Rel(api, push, "Web Push API", "")
  Rel(frontend, payment, "Razorpay Checkout", "Payment modal")
  Rel(api, payment, "Razorpay API", "Order create/verify")
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS v4 | Utility-first styling |
| Database ORM | Prisma | Type-safe database access |
| Database | PostgreSQL | Relational data store |
| Cache | Upstash Redis (Serverless) | Caching, rate limiting |
| Auth | Better-Auth | Phone OTP + Admin 2FA |
| Payments | Razorpay | Online payments |
| Real-time | Ably | WebSocket messaging |
| State (Server) | TanStack React Query v5 | API data caching |
| State (Client) | Zustand v5 | UI state management |
| Forms | React Hook Form v7 | Form handling |
| Images | Cloudinary | Image upload & delivery |
| SMS | Twilio | OTP delivery |
| PWA | Service Worker | Offline, push notifications |

---

## 3. Design Patterns

### 3.1 Server Action Pattern

Business logic lives in **server actions** under `actions/`. Components import and call them directly.

```mermaid
sequenceDiagram
    participant Component as React Component
    participant Action as Server Action (actions/*)
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    Component->>Action: Call action function
    Action->>Prisma: Query/Mutate data
    Prisma->>DB: SQL query
    DB->>Prisma: Result
    Prisma->>Action: Typed result
    Action->>Component: Return data (plain object)
    Note over Component: TanStack Query caches result
```

### 3.2 Repository Pattern

Data access is encapsulated in reusable action functions, not spread across components.

```
actions/
  catalog/       - Menu queries (reads)
  orders/        - Order queries/mutations
  payments/      - Payment processing
  admin/         - Admin operations
  reviews/       - Review submissions
  delivery/      - Delivery operations
  notifications/ - Push notifications
  cart-checkout/ - Cart & checkout
  payouts/       - Settlement
```

### 3.3 State Management Pattern

**Three-layer state architecture:**

```mermaid
graph TD
    subgraph "Layer 1: Server State (TanStack Query)"
        MenuData["Menu Items<br/>(staleTime: 30s)"]
        Wishlist["Wishlist IDs<br/>(staleTime: 30s)"]
        Profile["User Profile<br/>(staleTime: Infinity)"]
        Orders["Orders<br/>(manual refetch)"]
    end

    subgraph "Layer 2: Client State (Zustand)"
        Cart["Cart Store<br/>- Items<br/>- Coupon<br/>- OrderType"]
        MenuUI["Menu Store (persisted)<br/>- Search query<br/>- Filters<br/>- Time slot"]
        AuthUI["Auth Store<br/>- Role<br/>- Phone<br/>- Step"]
    end

    subgraph "Layer 3: Form State (React Hook Form)"
        SignupForm["Signup Form"]
        CheckoutForm["Checkout Form"]
        ProfileForm["Profile Edit"]
    end

    UI["React UI Components"] --> MenuData
    UI --> Wishlist
    UI --> Profile
    UI --> Orders
    UI --> Cart
    UI --> MenuUI
    UI --> AuthUI
```

### 3.4 Optimistic Update Pattern

Cart and wishlist updates are optimistic — the UI changes immediately, then syncs to server.

```mermaid
sequenceDiagram
    participant User as User
    participant UI as React UI
    participant Cache as TanStack Cache
    participant Server as Server Action

    User->>UI: Click "Add to Wishlist"
    UI->>Cache: Optimistically update cache
    Cache->>UI: Re-render with new state
    UI-->>User: Heart icon fills immediately
    
    par Background Sync
        UI->>Server: Call toggleWishlist action
        Server->>Server: Update database
        Server-->>UI: Success/failure
    end

    alt On Success
        UI->>Cache: Invalidate/refetch wishlist
    else On Failure
        UI->>Cache: Rollback optimistic update
        UI->>User: Show error toast
    end
```

### 3.5 Component Composition Pattern

Large pages are composed of small, focused components:

```
Home Page (app/page.tsx)
  ├── HomeHeroCarousel      - Top carousel banner
  ├── TopRatedKitchens      - Horizontal scrollable kitchen cards
  ├── RecentlyJoinedKitchens - New kitchens section
  ├── TimeSlotMenuSections  - Menu grouped by time slot
  │   ├── BreakfastSection  - Scrollable breakfast items
  │   ├── LunchSection      - Scrollable lunch items
  │   ├── SnacksSection     - Scrollable snacks items
  │   └── DinnerSection     - Scrollable dinner items
  └── HomeMobileNav        - Bottom navigation bar
```

---

## 4. Client-Server Data Flow

### 4.1 Home Page Load

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant Next as Next.js Server
    participant Action as Home Data Action
    participant DB as PostgreSQL
    participant Redis as Redis Cache

    Browser->>Next: GET /
    Next->>Action: getHomePageData()
    
    par Parallel Queries
        Action->>DB: Top-rated kitchens (rating DESC)
        Action->>DB: Recently joined kitchens (createdAt DESC)
        Action->>DB: Recent order kitchens (for logged-in user)
    end
    
    DB-->>Action: Result sets
    
    Note over Action: Compute average ratings from Review records
    
    Action-->>Next: Serialized JSON
    Next-->>Browser: RSC Payload + HTML
    Browser->>Browser: Hydrate (TanStack Query ready)
```

### 4.2 Menu Page Load & Filter

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Menu Page
    participant Query as TanStack Query
    participant Action as getTomorrowMenu
    participant DB as PostgreSQL

    User->>UI: Visit /menu
    UI->>Query: useTomorrowMenu({q, foodType, timeSlot})
    Query->>Action: getTomorrowMenu(params)
    Action->>DB: Query MenuItems with filters
    DB-->>Action: Filtered items
    Action->>Action: Compute avgRating per item
    Action-->>Query: Response
    Query-->>UI: Render menu grid (lg:grid-cols-6)
    
    User->>UI: Filter by "VEG" + "LUNCH"
    UI->>Query: Refetch with new params
    Query-->>Action: getTomorrowMenu({foodType:"VEG", timeSlot:"LUNCH"})
    Action->>DB: Filtered query
    DB-->>Action: Results
    Action-->>Query: Filtered items
    Query-->>UI: Re-render filtered grid
```

### 4.3 Cart to Checkout Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Cart as Cart Store (Zustand)
    participant UI as Cart Page
    participant API as Server Actions
    participant Razorpay as Razorpay API

    User->>UI: View cart
    UI->>Cart: selectCartItems, selectCartTotal
    
    User->>UI: Select address
    User->>UI: Select order type (Pre-book / Instant)
    User->>UI: Select payment method
    User->>UI: Apply coupon
    
    alt Online Payment
        User->>UI: Click "Place Order"
        UI->>API: createRazorpayOrder(amount)
        API->>Razorpay: Create payment order
        Razorpay-->>API: order_id, amount
        API-->>UI: Order details
        UI->>Razorpay: Open checkout modal
        User->>Razorpay: Complete payment (UPI/Card/etc)
        Razorpay-->>UI: Payment success
        
        par Verify & Create
            UI->>API: verifyPayment(payload)
            API->>API: Verify signature
            API->>API: Create order in DB
            API->>API: Deduct stock
            API-->>UI: Order confirmation
        end
        
        UI->>UI: Clear cart
        UI->>User: Show CravingsPopup
        
    else Cash on Delivery
        User->>UI: Click "Place Order"
        UI->>API: checkCodEligibility()
        API-->>UI: Eligible
        UI->>API: createCodOrder(data)
        API->>API: Create order in DB
        API-->>UI: Order confirmation
        UI->>User: Show CravingsPopup
    end
```

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Auth UI
    participant Better as Better-Auth
    participant Twilio as Twilio API
    participant DB as PostgreSQL

    User->>UI: Enter phone number
    UI->>Better: Send OTP via Twilio
    Better->>Twilio: Send SMS
    Twilio-->>User: SMS with OTP code
    User->>UI: Enter OTP
    UI->>Better: Verify OTP
    
    alt New User
        Better->>UI: Show signup form (name, email, address)
        User->>UI: Fill profile details
        UI->>Better: Complete signup
        Better->>DB: Create user record
    end
    
    Better->>UI: Create session (JWT cookie)
    UI->>User: Redirect to dashboard
    
    Note over User,DB: On subsequent visits, useSession() checks cookie
```

**Admin auth adds 2FA:**

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant UI as Admin Login
    participant Better as Better-Auth
    participant TOTP as TOTP Plugin

    Admin->>UI: Email + Password
    UI->>Better: Sign in
    Better->>Better: Verify password
    
    Note over Better: 2FA enforced for admins
    
    Better->>UI: TOTP challenge screen
    Admin->>UI: Enter 6-digit TOTP code
    UI->>Better: Verify TOTP
    Better->>TOTP: Validate code
    TOTP-->>Better: Valid
    Better-->>UI: Session with admin role
    UI->>Admin: Redirect to /admin
```

---

## 6. Real-time Order Flow

```mermaid
sequenceDiagram
    participant Customer
    participant Kitchen as Kitchen Partner
    participant Server as Next.js Server
    participant Ably as Ably Real-time
    participant Delivery as Delivery Partner

    Customer->>Server: Place order
    Server->>Server: Create order in DB
    Server->>Ably: Publish "order:status" = "confirmed"
    Ably-->>Kitchen: Receive order notification
    Ably-->>Customer: Receive confirmation

    Kitchen->>Server: Update status to "preparing"
    Server->>Ably: Publish "order:status" = "preparing"
    Ably-->>Customer: "Your order is being prepared"

    Kitchen->>Server: Update status to "ready"
    Server->>Ably: Publish "order:status" = "ready"
    
    Server->>Delivery: Find nearby delivery partner
    Server->>Ably: Publish assignment to delivery
    
    Delivery->>Server: Accept assignment
    Server->>Ably: Publish delivery partner assigned
    Ably-->>Customer: "Delivery partner on the way"

    Delivery->>Server: Update location (every 5s)
    Server->>Ably: Publish "delivery:location"
    Ably-->>Customer: Update map marker

    Server->>Ably: Publish "order:cravings"
    Ably-->>Customer: Show CravingsPopup (real-time upsell)

    Delivery->>Customer: Deliver food
    Delivery->>Server: Confirm delivery (OTP)
    Server->>Ably: Publish "order:status" = "delivered"
    Ably-->>Customer: "Order delivered!"
```

---

## 7. Payment Architecture

```mermaid
graph TD
    User["User checks out"]
    User --> Checkout["Cart Page"]

    Checkout --> Online["Pay Online"]
    Checkout --> COD["Cash on Delivery"]

    Online --> CreateOrder["POST /api/payment/create-order"]
    CreateOrder --> RazorpayOrder["Razorpay: Create Order"]
    RazorpayOrder --> Modal["Razorpay Checkout Modal"]
    
    Modal --> Success["Payment Success"]
    Modal --> Fail["Payment Fail"]
    
    Success --> Verify["POST /api/payment/verify"]
    Verify --> SignatureCheck["Verify signature (HMAC SHA256)"]
    SignatureCheck --> CreateDBOrder["Create order in DB"]
    CreateDBOrder --> DeductStock["Deduct inventory"]
    DeductStock --> ClearCart["Clear cart"]
    ClearCart --> Cravings["Show CravingsPopup"]

    Fail --> HandleFail["POST /api/payment/fail"]
    HandleFail --> AllowRetry["Allow retry"]

    COD --> CodEligibility["GET /api/payment/cod-eligibility"]
    CodEligibility --> Eligible{"Eligible?"}
    Eligible -->|Yes| CreateCOD["POST /api/payment/confirm-cod"]
    Eligible -->|No| ShowCODUnavailable["Show unavailable message"]
    
    CreateCOD --> CreateDBOrder

    subgraph "Webhook (async)"
        RazorpayWebhook["POST /api/auth/razorpay/webhook<br/>(from Razorpay server)"]
        RazorpayWebhook --> WebhookVerify["Verify webhook signature"]
        WebhookVerify --> UpdatePaymentStatus["Update payment status in DB"]
    end
```

---

## 8. Database Schema (Relationships)

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Address : has
    User ||--o{ Review : writes
    User ||--o{ Wishlist : has
    User ||--o{ Notification : receives
    User ||--o{ PushSubscription : has

    KitchenPartner ||--o{ MenuItem : offers
    KitchenPartner ||--o{ Order : fulfills
    KitchenPartner ||--o{ KitchenPayout : receives
    KitchenPartner ||--o{ KitchenDailyStock : manages

    MenuItem ||--o{ OrderItem : contains
    MenuItem ||--o{ Photo : has
    MenuItem ||--o{ KitchenDailyStock : tracks
    MenuItem ||--o{ Wishlist : appears_in

    Order ||--o{ OrderItem : contains
    Order ||--o{ Review : has
    Order ||--o{ OrderTracking : tracks
    Order ||--o{ Payment : has
    Order ||--o{ OrderEvent : logs

    DeliveryPartner ||--o{ DeliveryAssignment : assigned_to
    DeliveryPartner ||--o{ CodRemittance : remits

    DeliveryAssignment ||--o| Order : delivers

    Payment ||--o{ Refund : has

    Coupon ||--o{ Order : applied_to

    AdminProfile ||--|| User : is
    AdminProfile ||--o{ AdminInvite : creates

    CodCollection ||--o{ CodVariance : has_variance
    CodRemittance ||--o{ CodCollection : reconciles
```

---

## 9. Component Tree (Major Routes)

```mermaid
graph TD
    Root["app/layout.tsx<br/>- Providers:<br/>  QueryClient<br/>  Session<br/>  Theme<br/>- SiteHeader<br/>- SiteFooter"]

    Root --> Home["app/page.tsx<br/>Home page (RSC)"]
    Root --> Menu["app/menu/page.tsx<br/>Menu page (RSC)"]
    Root --> Cart["app/cart/page.tsx<br/>Cart page"]
    Root --> Account["app/account/*<br/>Customer area"]
    Root --> Kitchen["app/kitchen/dashboard/*<br/>Kitchen portal"]
    Root --> Delivery["app/delivery-partner/dashboard/*<br/>Delivery portal"]
    Root --> Admin["app/admin/*<br/>Admin panel"]
    Root --> NotFound["app/not-found.tsx<br/>404 page"]

    Home --> Hero["HomeHeroCarousel"]
    Home --> TopK["TopRatedKitchens"]
    Home --> NewK["RecentlyJoinedKitchens"]
    Home --> TimeSlots["TimeSlotMenuSections"]
    TimeSlots --> BF["Breakfast Section"]
    TimeSlots --> Lunch["Lunch Section"]
    TimeSlots --> Snacks["Snacks Section"]
    TimeSlots --> Dinner["Dinner Section"]

    Menu --> MenuContent["MenuContent<br/>(Search + Filters + Grid)"]
    MenuContent --> MenuCard["MenuItemCard<br/>(WishlistButton + AddToCart)"]

    Cart --> CartItems["CartItemList"]
    Cart --> AddressSel["AddressSelector"]
    Cart --> CouponSel["CouponSelector"]
    Cart --> PaymentSel["PaymentMethodSelector"]
    Cart --> OrderTypeSel["OrderTypeSelector"]
    Cart --> Cravings["CravingsPopup"]

    Account --> Profile["Profile page"]
    Account --> Orders["Order history"]
    Account --> Addresses["Saved addresses"]
    Account --> WishlistPg["Wishlist page"]
    Account --> Loyalty["Loyalty points"]
```

---

## 10. PWA & Offline Architecture

```mermaid
graph TD
    subgraph "Browser"
        App["Next.js App"]
        SW["Service Worker (sw.js)"]
        Cache["Cache Storage"]
        IndexedDB["IndexedDB"]
    end

    subgraph "Server"
        NextServer["Next.js Server"]
        API["API Routes"]
    end

    App -->|First visit| NextServer
    NextServer -->|Serve static assets| SW
    SW -->|Cache| Cache
    
    App -->|API calls| API
    API -->|Response| SW
    SW -->|Network-first strategy| Cache
    
    App -->|Offline| SW
    SW -->|Serve cached fallback| Cache
    
    App -->|Install prompt| PWA["beforeinstallprompt event"]
    PWA -->|User accepts| Install["Installed PWA"]
    Install -->|Standalone mode| App

    SW -->|Push event| Push["Push notification"]
    Push -->|User clicks| App
```

---

## 11. Folder Structure

```
src/
  app/                 - Next.js App Router pages
    page.tsx             Home page
    menu/                Menu page + filters
    cart/                Cart + checkout
    account/             Customer profile, orders
    admin/               Admin panel
    kitchen/dashboard/   Kitchen partner portal
    delivery-partner/    Delivery partner portal
    api/                 REST API routes
    not-found.tsx        404 page
    loading.tsx          Loading spinner (delayed 300ms)
    layout.tsx           Root layout (providers, header, footer)

  components/          - React components
    home/                Home page components
    menu/                Menu card, wishlist button
    order/               Order tracking, cravings
    cart/                Cart item, selectors
    location/            Map, address picker
    site/                Header, footer, mobile nav
    ui/                  Button, Input, Badge, etc.
    admin/               Admin-specific components
    patterns/            Install prompt, PWA

  actions/             - Server Actions
    catalog/             Menu queries
    orders/              Order CRUD
    payments/            Payment processing
    admin/               Admin operations
    reviews/             Review submission
    delivery/            Delivery operations
    notifications/       Push nudges
    cart-checkout/       Cart & checkout
    payouts/             Payout settlement

  lib/                 - Utilities
    auth.ts              Better-Auth server config
    auth-client.ts       Better-Auth client hooks
    prisma.ts            Prisma client singleton
    redis.ts             Redis client
    razorpay.ts          Razorpay SDK
    cloudinary.ts        Cloudinary upload
    twilio.ts            Twilio SMS
    ably/                Ably real-time config

  stores/              - Zustand stores
    cartStore.ts         Cart state
    menuStore.ts         Menu filters (persisted)
    authStore.ts         Auth form state

  hooks/               - Custom React hooks
    useTomorrowMenu.ts   Menu data fetching
    useRazorpay.ts       Payment flow
    usePhoneAuth.ts      OTP auth flow
    usePWA.ts            Install prompt
    use-mobile.ts        Mobile detection
    useAblySubscribe.ts  Real-time subscription
    useAblyOrderChannel.ts Order channel

  styles/              - Global styles
    globals.css          Tailwind imports, CSS vars
```

---

## 12. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Server Actions over REST** | Type-safe, no API route boilerplate, colocated with pages |
| **Zustand over Redux** | Minimal boilerplate, no providers needed, good TS support |
| **TanStack Query** | Built-in caching, deduplication, refetch, optimistic updates |
| **Better-Auth** | Phone OTP out of the box, admin 2FA, session management |
| **Prisma** | Type-safe queries, migrations, good relation handling |
| **Time-slot menu grouping** | Matches real kitchen workflows (breakfast/lunch/dinner) |
| **PWA without splash screen** | Instant loading feel, no white screen flash |
| **Ably for real-time** | Managed WebSocket infrastructure, no server overhead |
| **Optimistic wishlist** | Instant feedback, background sync, rollback on failure |
| **Mobile-first responsive** | Majority of users on mobile; desktop is progressive enhancement |
