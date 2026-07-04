# RRC Kitchen

A multi-vendor tiffin / meal delivery marketplace connecting customers, kitchen partners (home chefs / small kitchens), and delivery partners. Built as a full-stack PWA with role-based dashboards.

## Features

- **Menu Browsing** — Browse tiffin/meal items by day, filter by food type (veg/non-veg), time slot, category, and search by name/kitchen
- **Cart** — Client-side cart with add/remove/quantity/clear actions
- **Ordering** — Place orders with delivery address and time slot, tracked through status flow (confirmed → preparing → ready for pickup → completed)
- **Payments** — Razorpay integration (cards/UPI/netbanking) + cash on pickup
- **Kitchen Partner Portal** — Dashboard with menu CRUD, order management, payments/payouts, profile/KYC (Aadhaar, FSSAI, bank details, UPI)
- **Delivery Partner Portal** — Dashboard, profile, bank/UPI payout details, kitchen assignments
- **Admin Panel** — Manage kitchens (approve/reject KYC), customers, delivery partners, orders, CMS
- **Customer Account** — Order history, profile management, saved addresses
- **Reviews & Ratings** — Rate/review kitchens per order
- **PWA** — Offline-capable, installable

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Prisma ORM) |
| **Auth** | Better-Auth (email/password + phone/OTP + admin plugin) |
| **Payments** | Razorpay |
| **Server State** | TanStack React Query |
| **Client State** | Zustand |
| **UI** | Tailwind CSS, Radix UI / shadcn |
| **Forms** | React Hook Form + Zod |
| **Maps** | Google Maps (@vis.gl/react-google-maps) |
| **Media** | Cloudinary |
| **Charts** | Recharts |
| **Carousel** | Embla |
| **Testing** | Vitest (unit) + Playwright (e2e) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Maps API key
- Cloudinary account
- Razorpay account

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
NEXT_PUBLIC_CLOUDINARY_API_KEY="..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

# Razorpay
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."
```

### Setup

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |

## Project Structure

```
├── actions/          # Server actions (payment, orders, menu, dashboard, etc.)
├── app/              # Next.js App Router pages
│   ├── account/      # Customer account & orders
│   ├── admin/        # Admin panel
│   ├── cart/         # Cart page
│   ├── delivery-partner/  # Delivery partner portal
│   ├── kitchen/      # Kitchen partner portal
│   ├── login/        # Customer auth
│   └── menu/         # Menu browsing
├── components/       # Reusable UI components
│   ├── cloudinary/   # Cloudinary upload/image components
│   ├── location/     # Google Maps location picker
│   ├── patterns/     # Compound components, error boundary, skeleton card
│   ├── site/         # Site header, footer
│   └── ui/           # Base UI primitives (shadcn)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, auth client, cache, patterns, prisma
├── prisma/           # Schema & migrations
├── stores/           # Zustand stores (cart, menu, auth)
└── tests/            # Unit & e2e tests
```
