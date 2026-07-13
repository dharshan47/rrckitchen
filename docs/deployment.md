# Deployment Guide

## Build

```bash
npm run build
```

Produces a production build in `.next/` folder.

## Environment Variables

Required for production:

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Twilio (OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY=...

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Ably (Real-time)
ABLY_API_KEY=...
NEXT_PUBLIC_ABLY_KEY=...

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@domain.com

# Redis (Cache/Rate limiting)
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...
```

## Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Deployment Platforms

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in Vercel project settings.

### Docker (Alternative)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment

1. Set up Razorpay webhook pointing to `https://yourdomain.com/api/auth/razorpay/webhook`
2. Set up cron jobs:
   - `/api/cron/process-order-events` - Every 5 minutes
   - `/api/jobs/settle-payouts` - Daily at midnight
   - `/api/jobs/retry-refund` - Every hour
   - `/api/jobs/cravings-nudge` - Daily at 10 AM
3. Verify Twilio SMS sending
4. Test push notifications
5. Verify Ably real-time connections
