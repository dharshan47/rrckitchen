# Architecture Decision Records

> **Status:** Active
> **Last updated:** 2026-08-05
> **Format:** ADR (based on Michael Nygard's template)
> **Total ADRs:** 21

---

## ADR-001: Use Server Actions over REST API Routes

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-15 |
| **Deciders** | Tech Lead, Senior Engineers |

### Context
The platform needs to handle CRUD operations for orders, menus, user profiles, and payments. Two patterns were available in Next.js 16: Server Actions (colocated functions) and traditional API Routes (`pages/api/` or `route.ts`).

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Server Actions** | Type-safe caller/callee, no serialization overhead, colocated with pages, automatic progressive enhancement, built-in revalidation | Tied to Next.js runtime, cannot be called from external services |
| **API Routes (REST)** | Framework-agnostic, swappable backend, natural API boundary, external consumer support | Boilerplate (route definition, validation, serialization), manual cache invalidation |
| **tRPC** | End-to-end type safety, rich procedure system | Additional dependency, complex setup with RSC, slower adoption in team |

### Decision
Use **Server Actions** for all business logic operations, and **API Routes** only for:
1. Payment webhooks (called by Razorpay, not the client)
2. Image upload (requires multipart form handling)
3. Ably token authentication (needs public endpoint for WebSocket SDK)

### Consequences
- **Positive:** Zero boilerplate for data mutations, automatic type inference, built-in revalidation via `revalidatePath()`
- **Negative:** Migrating to a different backend framework would require extracting all Server Actions
- **Risk:** Server Actions depend on Next.js runtime — mitigated by keeping all pure logic in `lib/` as plain functions

---

## ADR-002: Use Zustand for Client State over Redux

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-10 |
| **Deciders** | Frontend Team |

### Context
The app requires client-side state management for cart, auth UI flow, menu filters, and wishlist. The cart especially needs optimistic updates, undo support, and persistence.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Zustand v5** | ~5KB gzipped, no Provider wrapper, middleware (persist, immer), TypeScript-first, minimal boilerplate | Smaller ecosystem, fewer community patterns |
| **Redux Toolkit** | Mature ecosystem, RTK Query included, DevTools | 12KB+ gzipped, Provider required, verbose middleware |
| **Jotai** | Atomic re-renders, ~3KB | Different mental model, less suitable for complex state like cart |
| **Context + useReducer** | Built-in, no dependencies | Re-render cascading, no middleware, no DevTools |

### Decision
Use **Zustand v5** with `persist` middleware for cart (localStorage), `immer` middleware for immutable updates, and custom DevTools middleware.

### Consequences
- **Positive:** ~7KB total savings vs Redux Toolkit, simpler testing (no Provider wrapping), granular subscriptions via selectors
- **Negative:** Team needs to learn Zustand patterns; mitigated by similarity to Redux (stores, actions, selectors)

---

## ADR-003: Tailwind CSS for Styling

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-08 |
| **Deciders** | Tech Lead |

### Context
The app needs a consistent design system with responsive breakpoints, dark mode support, and minimal runtime cost.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Tailwind CSS v4** | Zero-runtime, utility-first, small CSS output via JIT, responsive built-in | Verbose HTML, learning curve for utility classes |
| **CSS Modules** | Scoped styles, native CSS | No design-system-level consistency without extra tooling |
| **Styled Components** | Runtime dynamic styles, colocated CSS | ~15KB runtime, slower SSR, hydration mismatch risks |
| **vanilla-extract** | Zero-runtime, type-safe CSS | Build tooling complexity, smaller ecosystem |

### Decision
Use **Tailwind CSS v4** with a custom design system defined in `tailwind.config`. All colors, spacing, typography follow the same tokens.

### Consequences
- **Positive:** ~12KB gzipped CSS, consistent design, fast iteration, built-in dark mode via `class` strategy
- **Negative:** JSX can become verbose; mitigated by extracting `cn()` helper and reusable patterns

---

## ADR-004: TanStack Query for Server State

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-12 |
| **Deciders** | Frontend Team |

### Context
The app fetches kitchen menus, user profiles, order lists, and wishlist data. We need caching, deduplication, background refetch, and optimistic updates.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **TanStack Query v5** | Automatic dedup, configurable staleTime, optimistic updates via `onMutate`, DevTools | ~15KB gzipped, opinionated cache key structure |
| **SWR** | Lightweight (~4KB), simple API | No optimistic update rollback, less flexible cache control |
| **useEffect + manual fetch** | No dependency, full control | No caching, manual dedup, race conditions |
| **Redux RTK Query** | Integrated with Redux if used | Already chose Zustand — redundant |

### Decision
Use **TanStack Query v5** with the following stale time strategy:
- **Menu data:** 30s staleTime (changes infrequently)
- **Wishlist:** 30s staleTime
- **User profile:** Infinity (refetched on mutation)
- **Orders:** 0s (always fresh)

### Consequences
- **Positive:** Optimistic updates for wishlist and cart, automatic background sync, request deduplication
- **Negative:** Cache invalidation must be explicit; mitigated by using query key conventions

---

## ADR-005: Better-Auth for Authentication

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-20 |
| **Deciders** | Tech Lead, Security Lead |

### Context
The platform serves four user roles (customer, kitchen partner, delivery partner, admin), requires phone OTP for non-admin roles, email + TOTP 2FA for admins, and persistent session management.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Better-Auth** | Phone OTP native, admin 2FA, session management, role-based access, TypeScript-native | Smaller community, fewer production deployments |
| **NextAuth (Auth.js)** | Large community, many providers, mature | No built-in phone OTP, no admin 2FA plugin, heavy customization needed |
| **Clerk** | Hosted, feature-rich, fast integration | Vendor lock-in, cost scales with users, data sovereignty concerns |
| **Supabase Auth** | Free tier, integrated with Supabase | Not using Supabase DB, phone OTP requires extra config, 2FA limited |

### Decision
Use **Better-Auth** with:
- **Phone OTP** via Twilio for customers, kitchen, delivery
- **Email + TOTP 2FA** for admin accounts
- Server-side session validation via cookie-based JWT
- Rate-limited OTP requests (1 per 60s per phone, 5 per hour per IP)

### Consequences
- **Positive:** Unified auth library for all roles, built-in 2FA, phone OTP templates
- **Negative:** Relatively new library — mitigated by thorough testing and session fallback logic

---

## ADR-006: Prisma as ORM

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-10 |
| **Deciders** | Tech Lead |

### Context
The app uses PostgreSQL with complex relations (users, orders, menus, payments, deliveries). We need type-safe queries, migrations, and good developer experience.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Prisma v7** | Type-safe queries, auto-generated client, migrations, relation queries | Query flexibility, performance overhead on complex joins |
| **Drizzle ORM** | SQL-like API, better performance, smaller bundle | Less mature migration tooling, steeper learning curve |
| **Kysely** | SQL-like type safety, no magic, highly performant | No migration tooling, manual schema management |
| **Raw SQL (pg + slonik)** | Maximum performance, full control | No type safety, no migration tooling, verbose |

### Decision
Use **Prisma** with:
- Connection pooling via Prisma Data Proxy
- Raw queries for performance-critical paths (e.g., real-time order aggregation)
- `@prisma/extension-accelerate` for edge caching

### Consequences
- **Positive:** Zero manual SQL for 90% of queries, type-safe migrations, easy relation traversal
- **Negative:** Map 10-15% performance tax on complex joins vs. raw SQL; mitigated by raw query fallback + connection pooling

---

## ADR-007: Optimistic Cart Operations

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-02-01 |
| **Deciders** | Frontend Team |

### Context
Cart operations (add, remove, update quantity) must feel instant. Network latency (100-500ms in India) should not block UI updates.

### Decision
Implement **optimistic UI** for all cart operations:
1. Update Zustand store immediately
2. Fire Server Action in background
3. On success: confirm state (no-op, already updated)
4. On failure: rollback to previous state + show error toast

### Consequences
- **Positive:** Sub-10ms response for all cart interactions, smooth UX
- **Negative:** Rare inconsistency if server rejects (sold out, price change) — mitigated by rollback toast

---

## ADR-008: Ably for Real-Time over WebSocket Custom

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-25 |
| **Deciders** | Tech Lead |

### Context
Real-time features: order status updates (customer), incoming orders (kitchen), delivery tracking (customer + kitchen), cravings popups.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Ably** | Managed WebSocket, channel history, presence, fallback transports, 99.999% SLA | Cost at scale ($49/mo for 1M messages) |
| **Socket.io** | Open source, self-hosted, large community | Requires sticky sessions (Vercel limitation), operational overhead, no SLA |
| **Supabase Realtime** | Integrated if using Supabase | Not using Supabase, PostgreSQL replication limitations |
| **Server-Sent Events** | Simple, HTTP-based | Unidirectional only, not suitable for kitchen/delivery workflows |

### Decision
Use **Ably** with:
- Server-side publishing via REST API
- Client-side subscriptions via WebSocket SDK
- Channel naming convention: `order:{id}`, `delivery:{id}`, `kitchen:{id}`
- Token authentication (server issues short-lived tokens)

### Consequences
- **Positive:** 5-minute integration, guaranteed delivery, no operational overhead
- **Negative:** Monthly cost ($49-199 depending on volume), vendor lock-in

---

## ADR-009: Next.js App Router over Pages Router

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-05 |
| **Deciders** | Tech Lead |

### Context
Next.js 16 offers two routing paradigms. The Pages Router is stable and battle-tested; the App Router is the future direction with React Server Components, nested layouts, and Server Actions.

### Decision
Use **App Router** exclusively. No Pages Router files in the codebase.

### Consequences
- **Positive:** RSC for zero-bundle-size pages, nested layouts, Server Actions, streaming SSR
- **Negative:** Some third-party libraries have incomplete RSC support; mitigated by wrapping in Client Component boundaries

---

## ADR-010: Cloudinary for Image Management

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-15 |
| **Deciders** | Product, Tech Lead |

### Context
Kitchen partners upload menu item photos. The platform needs responsive images, WebP/AVIF support, face detection for cropping, and CDN delivery.

### Decision
Use **Cloudinary** with:
- Client-side upload via unsigned presets (rate-limited server-side)
- `f_auto` + `q_auto` for automatic format/quality selection
- Responsive breakpoints: 320w, 480w, 768w, 1024w
- Lazy loading via `loading="lazy"` + `decoding="async"`

### Consequences
- **Positive:** Automatic image optimization, CDN delivery, face-aware cropping
- **Negative:** Vendor lock-in, cost at scale (~$0.10/GB bandwidth beyond free tier)

---

## ADR-011: Prisma Data Proxy over Direct PostgreSQL Connection

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-10 |
| **Deciders** | Tech Lead |

### Context
Need a PostgreSQL database with serverless connection pooling and type-safe queries.

### Decision
Use **Prisma Data Proxy** (`pooled.db.prisma.io`) with:
- Connection pooling via Prisma's serverless adapter (`@prisma/adapter-pg`)
- `DATABASE_URL` pointing to Prisma Data Proxy
- Spring Clean for connection management

### Consequences
- **Positive:** Connection pooling, type-safe queries, Prisma ecosystem integration
- **Negative:** Dependency on Prisma Data Proxy infrastructure; cold start latency on first connection (+200ms)

---

## ADR-012: Payment — Razorpay (Checkout + UPI Smart Collect)

| Field | Value |
|-------|-------|
| **Status** | Superseded by ADR-019 (COD removed) |
| **Date** | 2026-02-01 |
| **Deciders** | Product, Tech Lead, Finance |

### Context
The platform serves Indian customers who expect online payment (UPI, cards, net banking). COD was originally planned but was removed in ADR-019 — see that ADR for the rationale.

### Decision
Use **Razorpay** for all payments:
- Razorpay Checkout.js modal with explicit method order (UPI → Net Banking → Wallets → Cards)
- Razorpay webhooks (`payment.captured` / `refund.processed`) for async status updates
- Razorpay Smart Collect (virtual payment address per order) for UPI-based flows
- RazorpayX for kitchen and delivery-partner payouts

### Consequences
- **Positive:** Unified payment flow, refund management via Razorpay API, no cash handling
- **Negative:** Razorpay fee per transaction; UPI Smart Collect UI not yet wired (backend + hooks complete)

---

## ADR-013: Monorepo with Single Next.js App

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-01-05 |
| **Deciders** | Tech Lead |

### Context
The platform has a customer-facing app, kitchen dashboard, delivery partner dashboard, and admin panel. These share auth, components, types, and utilities.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Single Next.js app** | Shared code, single build, easy refactoring, simple deployment | Larger bundle, no independent deploy of admin vs customer |
| **Turborepo monorepo** | Independent deployments, separate builds, clear boundaries | Build complexity, shared code management, CI pipeline complexity |
| **Nx monorepo** | Advanced dependency graph, computation caching | Overkill for 2 developers, steep learning curve |

### Decision
Use a **single Next.js app** with clear directory separation for each domain. Extract shared logic into `lib/`, `components/ui/`, and `types/`.

### Consequences
- **Positive:** Single `npm run build`, fast iteration, shared types without package management
- **Negative:** Cannot deploy admin panel independently; mitigated by route-level code splitting

---

## ADR-014: Manual OTP Cooldown over Redis TTL

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-02-10 |
| **Deciders** | Security Lead |

### Context
OTP abuse is a common attack vector. We need rate limiting that persists across serverless function invocations.

### Decision
Implement OTP cooldown via **Upstash Redis**:
- **Per phone:** 1 OTP per 60 seconds (TTL: 60s)
- **Per IP:** 5 OTPs per hour (TTL: 3600s)
- **Per phone per day:** 10 OTPs (TTL: 86400s)

### Consequences
- **Positive:** Prevents OTP bombing, Twilio cost abuse
- **Negative:** Redis becomes a dependency for auth; mitigated by graceful degradation (skip rate limit if Redis down, log alert)

---

## ADR-015: Session Skeleton over Flash Prevention

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Deciders** | Frontend Team |

### Context
The site header showed a flash of the Login button followed by Profile on session resolve. This caused layout shift and poor UX. The previous approach tried conditional rendering with `isPending`.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Skeleton pulse** | Smooth loading state, no layout shift, clear progress indication | Extra HTML/CSS for skeleton |
| **SSR session cookie** | No flash on page load | Only works for initial request, not SPA navigations |
| **Persist session in Zustand** | Instant read on app mount | Stale session risk, security concern |

### Decision
Render a **skeleton pulse** (gray animated block matching button dimensions) while session resolves. Switch to Login or Profile buttons based on session result.

### Consequences
- **Positive:** Zero layout shift, smooth transition, clear loading state
- **Negative:** Minor rendering overhead for skeleton markup

---

## ADR-016: Grouped Quantity Controls over Individual Buttons

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07-15 |
| **Deciders** | Frontend Team |

### Context
Menu item quantity controls (+/- buttons with qty) had individual rounded borders with varying radii, looking inconsistent. The Add button used a grouped border style.

### Decision
Wrap the entire quantity control group (`-`, qty, `+`) in a single `rounded-lg border border-[#EE7005] overflow-hidden` container, matching the Add button style. On increment, immediately show the AddToCartPopup.

### Consequences
- **Positive:** Visual consistency across all menu cards, improved UX (+ click shows popup)
- **Negative:** None

---

## ADR-017: Hero Section Conditional Render over Height Transition

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07-15 |
| **Deciders** | Frontend Team |

### Context
The kitchen detail hero section used `max-h-[10000px]` CSS transition to animate in/out. This caused layout jank and performance issues on low-end mobile devices.

### Decision
Replace the CSS transition with **conditional rendering** (`showHero && <div>...</div>`). The hero appears instantly when the kitchen is selected, with a fade-in via CSS animation.

### Consequences
- **Positive:** Zero layout jank, smoother performance on mobile
- **Negative:** No expand/collapse animation (acceptable for this use case)

---

## ADR-018: Accordion over Manual Expand/Collapse for FAQs

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Deciders** | Frontend Team |

### Context
The kitchen about section had a custom expand/collapse implementation using `useState(expanded)` with `max-h` CSS transitions. FAQs were static divs. This was fragile and non-accessible.

### Decision
Replace the custom implementation with **Radix UI Accordion** for both the "Discover more" section and all FAQs. This provides built-in keyboard navigation, ARIA attributes, and smooth animations.

### Consequences
- **Positive:** Accessible (WCAG 2.1 compliant), keyboard-navigable, fewer lines of code
- **Negative:** Adds ~2KB to bundle from Radix Accordion dependency (already in bundle via other components)

---

## ADR-019: Remove Cash on Delivery (Online Payments Only)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07-20 |
| **Deciders** | Product, Tech Lead, Finance |

### Context
COD introduced operational complexity disproportionate to adoption: daily cash reconciliation (collections vs. remittances vs. variances), delivery-partner cash handling, fraud exposure, and a 2-5% handling cost. The platform's early user base pays overwhelmingly via UPI.

### Decision
Remove COD entirely:
- Delete all COD surfaces: eligibility checks, COD checkout, delivery OTP confirmation, remittance, reconciliation engine (`CodCollection`, `CodRemittance`, `CodVariance`, `KitchenDailyStock` models dropped)
- All orders are prepaid via Razorpay (Checkout) or UPI Smart Collect
- `Order.paymentMethod` is always `online`; `Payment.method` is always `online`

### Consequences
- **Positive:** No cash handling, no reconciliation engine, simpler order state machine, simpler audit trail
- **Negative:** Customers without digital payment methods cannot order; acceptable given measured user behavior

---

## ADR-020: Public Codes for Order/User/Entity Identification

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-03 |
| **Deciders** | Tech Lead |

### Context
Customer support and order references used long opaque CUIDs (`cm8f2x...`). Users needed short, human-friendly, copy-safe reference numbers for orders, payments, refunds, kitchens, and users.

### Decision
Introduce a `PublicIdCounter` table and a `lib/public-id.ts` allocator:
- Atomic per-prefix counter (`UPDATE public_id_counter SET sequence = sequence + 1 RETURNING sequence`) inside the transaction that creates the entity
- Formats: `KP-000123` (kitchen partner), `DP-…`, `ADM-…`, `ORD-…`, `PYMT-…`, `RFD-…`, `M-…` (menu item), `CUS-…` (customer)
- `publicCode` unique column added to User, Customer, KitchenPartner, DeliveryPartner, AdminProfile, Order, Payment, Refund, MenuItem
- One-time backfill via `scripts/backfill-public-codes.ts`

### Consequences
- **Positive:** Short, greppable reference numbers for support; stable across environments
- **Negative:** Extra counter table dependency; allocation must always run inside a transaction (avoided via strict helper)

---

## ADR-021: CMS-Driven Marketing Pages over Hardcoded Content

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Product, Tech Lead |

### Context
Category pages, search result pages, and kitchen landing pages were hardcoded. The team needed to iterate on copy, hero banners, filters, badges, and SEO metadata without code deploys.

### Decision
Store page content in dedicated content models edited from the admin panel under `/admin/content` (`MANAGE_CMS` permission):
- `CategoryPageContent` (+ features/offers/faqs) — `/categories/[slug]`
- `SearchPageContent` (+ filters/badges/infoItems) — `/search`
- `KitchenSearchPageContent` (+ chips/filters/menuCategories/recommendedItems) — kitchen search landing pages
- `CravingsRule` (+ `CravingsRuleItem`) — cross-sell popup rules (see [17-cravings-popup](17-cravings-popup.md))
- Admin editors live in `actions/admin/category-pages.ts`, `search-page.ts`, `kitchen-search-pages.ts`, `cravings-popup.ts`

### Consequences
- **Positive:** Non-engineers iterate on landing pages; per-keyword SEO control; content versioning (`version` field)
- **Negative:** Editor complexity (stores, dialogs, previews); content/`revalidateTag` coupling must be maintained
