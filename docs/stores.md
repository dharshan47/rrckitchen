# State Management

## Why Three Layers?

- **Zustand** for client-only UI state (cart items, menu filters, auth form step) — fast, no server dependency
- **TanStack Query** for server/API state (menu items, orders, profile) — built-in caching, deduplication, refetching
- **React Hook Form** for form state (signup, checkout, edit profile) — validated, controlled inputs

## Cart Store

### Why Zustand over Context/Redux?

Zustand is minimal — no providers, no boilerplate. We can create a store in ~50 lines and use it from any component without wrapping the app tree.

### What happens

The cart store holds an array of `CartItem` objects, an optional `AppliedCoupon`, and an `OrderType` (`PREBOOK` or `INSTANT`). Actions like `addToCart` check if the item already exists by ID — if so, it increments quantity; otherwise it appends. `removeFromCart` filters by ID. `updateQuantity` sets exact quantity (minimum 1). `clearCart` also clears the applied coupon.

Every action emits an event on the global event bus (`AppEvents.CART_UPDATED`) so other parts of the app (like the header cart badge or analytics) can react without coupling.

**Fine-grained selectors** (`selectCartItems`, `selectCartCount`, `selectCartTotal`) ensure components only re-render when their specific slice of state changes. For example, the header badge subscribes to `selectCartCount` — it won't re-render when just the coupon changes.

## Menu Store

### Why persisted to localStorage?

Menu filters (search, food type, time slot) are ephemeral — we don't persist them. But `deliveryAddress` is persisted so the user doesn't re-enter it on every visit. The `persist` middleware from Zustand handles this automatically with the key `rrc-menu-store`.

### What happens

The store holds `searchQuery`, `selectedFoodType`, `selectedTimeSlot`, `selectedTab`, and `deliveryAddress`. Every filter change emits `AppEvents.MENU_FILTER_CHANGED` so the menu page can refetch data. The `useTomorrowMenu` hook reads these values reactively and debounces the search query by 350ms before fetching.

## Auth Store

### Why a separate store?

Auth form state (selected role, phone number, OTP code) is UI-only — it doesn't need to persist or sync. Keeping it in Zustand avoids prop-drilling through multi-step signup forms. The `resetAuthState` action clears phone and code but keeps the role, so the user doesn't re-select their role on error.

## TanStack Query Configuration

| Key | Stale Time | Why |
|-----|------------|-----|
| Menu items | 30s | Likely to change (stock updates), so refresh periodically |
| Wishlist | 30s | Can change from another tab |
| User profile | Infinity | Only changes when user explicitly edits — manual refetch |
| Orders | Manual | Refetched after actions (place order, cancel) |
| Loyalty points | Manual | Only changes after order completion |
