# Custom Hooks — Why & What They Do

## `useTomorrowMenu()`

**Why**: Fetches and caches menu items from the server with automatic refiltering when search or filter values change.

**What happens**: Reads `searchQuery`, `selectedFoodType`, and `selectedTimeSlot` from the Zustand menuStore. Debounces the search query by 350ms (so typing "biryani" fires only one fetch, not 7). Calls `GET /api/menu/tomorrow?q=...&foodType=...&timeSlot=...`. Data is cached for 30 seconds (staleTime). Does NOT refetch on window focus (avoids unnecessary network calls). Returns `{ data, isLoading, isError }` from TanStack Query.

## `useRazorpay()`

**Why**: Manages the complete Razorpay checkout lifecycle — SDK loading, order creation, modal display, and payment verification.

**What happens**: When `initiateCheckout` is called:
1. Loads the Razorpay Checkout script (`checkout.razorpay.com/v1/checkout.js`) dynamically if not already loaded
2. Calls `POST /api/payment/create-order` (with 15s timeout, 2 retries with exponential backoff)
3. Opens the Razorpay modal with UPI-first display configuration
4. On success: calls `POST /api/payment/verify` to verify the HMAC signature
5. On modal dismiss: calls `POST /api/payment/fail` to mark payment as failed
6. Exposes `{ initiateCheckout, isProcessing, paymentResult, resetPayment }`

The Razorpay checkout script is loaded on-demand (not at page load) so it doesn't block rendering.

## `usePhoneAuth()`

**Why**: Coordinates the phone → OTP → verify flow across multiple API calls and UI states.

**What happens**: Manages `step` ("phone" → "otp"), `errorMessage`, `isLoading`, `resendCooldown` (30s countdown), and `verified`. Three mutations:
1. **sendOtp**: Normalizes phone, checks if registered, calls send endpoint, moves to OTP step, starts 30s cooldown
2. **verifyOtp**: Calls verify endpoint with OTP, sets verified=true on success
3. **resendOtp**: Re-sends OTP (blocked during cooldown)

Uses refs (`phoneNumberRef`, `roleRef`) to ensure mutation callbacks always access the latest values even after re-renders, preventing stale closure bugs.

## `usePWA()`

**Why**: Provides a unified interface for PWA features — install prompt, service worker updates, push subscriptions, and online status.

**What happens**:
- **Online status**: Listens to `window.online`/`offline` events
- **Standalone detection**: Checks `display-mode: standalone` media query
- **iOS detection**: Checks user agent for iPad/iPhone/iPod
- **Install prompt**: Captures `beforeinstallprompt` event (prevented default) — `installApp()` triggers the native prompt
- **Update detection**: Registers service worker (`/sw.js`), listens for `updatefound` → `statechange` to `installed` — sets `updateAvailable` flag
- **Update activation**: `activateUpdate()` posts `SKIP_WAITING` to the waiting SW and reloads the page
- **Push subscription**: Fetches VAPID public key from server, subscribes, sends subscription to `/api/push/subscribe`

## `useAblySubscribe()`

**Why**: Subscribes to Ably real-time channels with automatic cleanup and stable callback references.

**What happens**: Creates/gets the Ably client (singleton), subscribes to the named channel, delegates messages to the callback. Uses `callbackRef` pattern so the subscription isn't re-created every time the callback function reference changes. Cleans up (unsubscribes) when `channelName` or `enabled` changes, or on unmount. Includes pre-built hooks for common patterns:
- `useAblyOrderChannel(orderId, cb)` → subscribes to `order:{orderId}`
- `useAblyKitchenChannel(kitchenId, cb)` → subscribes to `kitchen:{kitchenId}`
- `useAblyDeliveryPersonChannel(id, cb)` → subscribes to `deliveryPartner:{id}`

## `useIsMobile()`

**Why**: Detects mobile viewport (<768px) reactively for responsive UI decisions.

**What happens**: Initializes with the current `matchMedia` state (avoids flash of wrong content on SSR). Listens for `change` events on the media query. Returns a boolean. Uses 768px breakpoint to match Tailwind's `md:`.
