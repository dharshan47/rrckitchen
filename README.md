# RRC Kitchen

A multi-vendor tiffin/meal delivery marketplace in Thanjavur connecting customers, kitchen partners (home chefs), and delivery partners. Full-stack PWA with role-based dashboards.

## Features

- **Menu Browsing** — Browse items by day, filter by food type (veg/non-veg), time slot, search by name/kitchen
- **Kitchen Detail Pages** — Dedicated `/kitchen/[slug]` pages with full menu, rating, cuisine tags, and search
- **Cart** — Client-side cart with add/remove/quantity/clear, coupon application
- **Ordering** — Pre-book or Instant, tracked through status flow (confirmed → preparing → ready for pickup → completed)
- **Payments** — Razorpay (cards/UPI/netbanking) + Cash on Delivery
- **Kitchen Portal** — Menu CRUD, order management, payouts, profile/KYC
- **Delivery Portal** — Accept deliveries, COD cash tracking, UPI/bank payout details
- **Admin Panel** — Manage kitchens, delivery partners, customers, orders, coupons, cash reconciliation
- **Customer Account** — Order history, tracking (real-time via Ably), wishlist, loyalty points, addresses
- **Reviews & Ratings** — Rate kitchens and delivery per order
- **Real-time** — Live order tracking, delivery location, cravings popup via Ably
- **PWA** — Offline-capable, installable, push notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Database | PostgreSQL via Prisma ORM v7 |
| Auth | Better-Auth (phone OTP + admin 2FA) |
| Payments | Razorpay (online) + Cash on Delivery |
| Real-time | Ably (order tracking, live location) |
| Storage | Cloudinary (images), Upstash Redis (cache) |
| State | Zustand (client), TanStack Query (server) |
| Charts | Recharts |
| Notifications | Web Push API (VAPID) |

## Documentation

See [docs/README.md](docs/README.md) for full documentation index covering architecture, auth, payments, state management, hooks, PWA, real-time, deployment, and more.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run postinstall` | Auto-generate Prisma client |

## Routes

### Public
- `/` — Home page with hero carousel, top-rated kitchens, menu by time slot
- `/menu` — Tomorrow's menu grouped by time slot with filters
- `/menu/[kitchenSlug]/[itemSlug]-[shortId]` — Menu item detail by kitchen + item
- `/menu/category/[slug]` — Category-filtered menu
- `/kitchen/[slug]` — Kitchen detail page with full menu
- `/search` — Search with autocomplete
- `/cart` — Cart with checkout
- `/login` / `/signup` — Auth pages
- `/terms-of-use` / `/privacy-policy` — Legal pages

### Authenticated
- `/account/profile` — Edit profile, addresses, loyalty
- `/account/orders` — Order history with tracking
- `/kitchen/dashboard` — Kitchen partner portal
- `/delivery-partner/dashboard` — Delivery partner portal
- `/admin/*` — Admin panel

## Project Structure

```
├── actions/          # Server actions (business logic)
├── app/              # Next.js App Router pages & API routes
├── components/       # React components (UI + feature)
│   ├── ui/           # shadcn UI primitives (Button, Input, Card, etc.)
│   ├── kitchen/      # Kitchen detail, grid, navbar
│   ├── menu/         # Menu card, detail, wishlist
│   ├── order/        # Order flow components
│   ├── cart/         # Cart, delivery address
│   ├── search/       # Search autocomplete, results
│   ├── location/     # Map, address picker
│   ├── site/         # Header, footer
│   └── patterns/     # CompoundMenuCard, ErrorBoundary, PWA
├── hooks/            # Custom React hooks
├── stores/           # Zustand state stores (cart, menu, auth)
├── lib/              # Library code (auth, prisma, utils)
├── providers/        # React context providers
├── prisma/           # Schema, migrations, seeds
├── public/           # Static assets (PWA icons, banners)
├── content/          # MDX content (privacy, terms)
├── types/            # TypeScript declarations
└── docs/             # Documentation
```
