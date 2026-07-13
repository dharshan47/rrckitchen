# Progressive Web App (PWA)

## Why PWA?

PWA gives us a native-app-like experience without requiring app store submission. Users can install RRC Kitchen on their home screen (Android Chrome, iOS Safari), receive push notifications for order updates, and browse cached content offline.

---

## Manifest (`app/manifest.ts`)

**Why `next.config.ts` route?** Next.js serves the manifest from the file system route `app/manifest.ts` at `/manifest.json` — no manual JSON file needed.

**Key settings:**
- `display: "standalone"` — removes browser chrome (URL bar, nav buttons). The app opens like a native app with just a title bar.
- `background_color: #FFFFFF` — shown as a splash color before CSS loads (instant white screen instead of flash of unstyled content)
- `theme_color: #EE7005` — colors the status bar on Android to match our brand
- `orientation: "portrait-primary"` — locks portrait mode (food ordering apps don't benefit from landscape)
- `purpose: "maskable"` — icons have safe-zone padding so they render correctly as adaptive icons (circles, squircles, etc. on different Android launchers)
- **Shortcuts** — "Tomorrow's Menu" → `/menu`, "My Cart" → `/cart`. On Android, long-pressing the app icon shows these as quick actions.

## Service Worker (`public/sw.js`)

### Why a service worker?

The SW runs separately from the main page — it intercepts network requests, serves cached responses, and handles push notifications even when the page isn't open.

### Caching Strategies

| Resource | Strategy | Cache Name | Why |
|----------|----------|------------|-----|
| JS, CSS, fonts | Cache-first | `rrc-static-v1` | These never change between builds (fingerprinted URLs) |
| Images | Cache-first (7-day) | `rrc-images-v1` | Kitchen photos rarely change; 7-day cache reduces bandwidth |
| API calls | Network-first | `rrc-api-v1` | Must show fresh data; fall back to cache if offline |
| Navigation | Network-first | `rrc-dynamic-v1` | Try fresh page; show cached home page if offline |

**Cache-first** serves from cache immediately (fastest), falls back to network. **Network-first** tries network first (fresh data), falls back to cache (offline). **Stale-while-revalidate** serves cache immediately, updates cache from network in background.

### Auth API exclusion

Requests to `/api/auth/` are NEVER cached — they contain sensitive session data. Third-party requests (Razorpay, Cloudinary, Google Maps) are fetched directly without caching.

### Push Notifications

The SW listens for:
1. **`push` event** — triggered when the server sends a push message. Parses the JSON payload and calls `showNotification` with title, body, icon, badge, and action buttons (View Order / Dismiss).
2. **`notificationclick` event** — when user clicks the notification, it closes the notification and navigates to `event.notification.data.url` (either focuses an existing tab or opens a new window).
3. **`message` event** — listens for `SKIP_WAITING` from the client to activate a new SW version.

## The `usePWA()` Hook

See [hooks.md](hooks.md) for what it does.

## Key Files

| File | Purpose |
|------|---------|
| `app/manifest.ts` | Generates `/manifest.json` — app name, icons, shortcuts |
| `public/sw.js` | Service worker — caching strategies, push notifications |
| `public/icons/icon-{192,384,512}.png` | App icons (maskable) |
| `public/icons/badge.png` | Notification badge icon (status bar) |
| `hooks/usePWA.ts` | React hook — install, update, push, online status |
