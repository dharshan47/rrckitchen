# RRC Kitchen

A multi-vendor tiffin/meal delivery marketplace in Thanjavur connecting customers, kitchen partners (home chefs), and delivery partners. Full-stack PWA with role-based dashboards.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Database | PostgreSQL via Prisma ORM v7 |
| Auth | Better-Auth (phone OTP + email/password + 2FA) |
| Payments | Razorpay (online) + Cash on Delivery |
| Real-time | Ably (order tracking, live location) |
| Storage | Cloudinary (images), Upstash Redis (cache) |
| State | Zustand (client state), TanStack Query (server state) |
| Charts | Recharts |
| Notifications | Web Push API (VAPID) |

## System Architecture

See [how-rrc-works.md](how-rrc-works.md) for the complete system guide with Mermaid diagrams covering architecture, data flow, design patterns, component tree, database schema, authentication, payment flow, real-time system, and PWA architecture.

## Documentation Index

| Document | Description |
|----------|-------------|
| [how-rrc-works.md](how-rrc-works.md) | Complete system guide with diagrams (architecture, flows, patterns) |
| [architecture.md](architecture.md) | System architecture overview |
| [routes.md](routes.md) | All app routes and API endpoints |
| [components.md](components.md) | UI component catalog |
| [database.md](database.md) | Database schema and models |
| [api.md](api.md) | API reference |
| [auth.md](auth.md) | Authentication (phone OTP, admin 2FA) |
| [payment.md](payment.md) | Payment system (Razorpay, COD, payouts) |
| [stores.md](stores.md) | State management (Zustand, TanStack Query) |
| [hooks.md](hooks.md) | Custom React hooks reference |
| [actions.md](actions.md) | Server actions reference |
| [pwa.md](pwa.md) | Progressive Web App features |
| [real-time.md](real-time.md) | Ably real-time messaging system |
| [roles.md](roles.md) | User roles and dashboards |
| [design-system.md](design-system.md) | Brand colors, typography, component patterns |
| [deployment.md](deployment.md) | Deployment guide and environment variables |

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Project Structure

```
├── app/              # Next.js App Router pages & API routes
├── components/       # React components (UI + feature)
├── actions/          # Server actions (business logic)
├── hooks/            # Custom React hooks
├── stores/           # Zustand state stores
├── lib/              # Library code (auth, prisma, utils)
├── providers/        # React context providers
├── prisma/           # Schema, migrations, seeds
├── public/           # Static assets (PWA, icons)
├── types/            # TypeScript declarations
├── content/          # MDX content (legal pages)
└── docs/             # Documentation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run postinstall` | Prisma generate (auto) |
