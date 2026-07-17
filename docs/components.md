# Components

## UI Components (`components/ui/`)

45 shadcn-based UI components built on Radix UI primitives:

| Component | Description |
|-----------|-------------|
| `Button` | Variants: default, destructive, outline, secondary, ghost, link |
| `Input` | Form input with error states |
| `Card` | Content container with header/content/footer |
| `Dialog` | Modal dialog with overlay |
| `Sheet` | Slide-out panel (mobile-friendly) |
| `Sidebar` | Collapsible sidebar navigation |
| `DropdownMenu` | Context menus |
| `Badge` | Status/label badges |
| `Spinner` | Loading indicator |
| `Skeleton` | Content placeholder |
| `DataTable` | Sortable, filterable tables (TanStack Table) |
| `Tabs` | Tabbed content sections |
| `Select` | Dropdown select |
| `Separator` | Visual divider |
| `Toaster` (Sonner) | Toast notifications |
| `Switch` | Toggle switch |
| `Tooltip` | Hover tooltips |
| `Progress` | Progress bar |
| `Avatar` | User avatar |
| `Command` (cmdk) | Command palette for search |

## Feature Components

### Home Page (`components/home/`)
- **HeroCarousel** - Auto-playing carousel (Embla) with 3 slides (Become a Chef, Fresh Meals, Deliver With Us)
- **HomeClient** - Main home page client component with all sections
- **CravingsBanner** - Trending/cravings banner for logged-in users

### Menu (`components/menu/`)
- **CompoundMenuCard** - Reusable card with compound pattern (Root, ImageSection, BadgeRibbon, WishlistButton, Header, Footer)
- **MenuGrid** - Grid layout for menu items
- **MenuItemDetail** - Full item detail view with photos, badges, pricing, wishlist
- **CategoryPageClient** - Category-filtered menu page
- **WishlistButton** - Heart icon toggle with optimistic updates
- **AddToCartPopup** - Auto-dismiss (3s) popup with veg/non-veg badge, item name, price/qty, larger image

### Order (`components/order/`)
- **OrderTypeSelector** - Pre-book vs Order Now toggle
- **PaymentMethodSelector** - Razorpay vs COD selector
- **CouponInput** - Coupon code input with validation
- **CravingsPopup** - Post-order upsell dialog
- **RatingPrompt** - Kitchen + delivery rating with stars
- **OrderTimeline** - Order status progress tracker

### Search (`components/search/`)
- **SearchPageContent** - Full search results page with tabbed UI (Dishes/Kitchens), sort dropdowns (Relevance/Rating/Name) for each tab, empty states, recent kitchens tracking
- **SearchAutocomplete** - Live search with suggestions, recent kitchens via `lib/recent-searches.ts`, kitchen image thumbnails

### Location (`components/location/`)
- **LocationDialog** - Map-based location picker with autocomplete
- **LocationAutocomplete** - Address search (Nominatim)

### Map (`components/map/`)
- **ThanjavurMap** - Leaflet map with delivery zone boundaries
- **LiveOrderTrackingMap** - Real-time order tracking with rider location

### Patterns (`components/patterns/`)
- **CompoundMenuCard** - Compound component pattern for menu cards
- **ErrorBoundary** - React error boundary with retry
- **ProgressiveImage** - Blur-to-full image loading
- **SkeletonCard** - Loading skeleton variants
- **SwUpdateBanner** - Service worker update notification
- **InstallPrompt** - PWA install banner
- **PushSubscriptionInit** - Push notification subscription

### Kitchen (`components/kitchen/`)
- **KitchenDetailClient** - Kitchen detail page with image, rating, cuisine tags, menu items grouped by time slot, search/filter, add-to-cart with toast; now accepts `initialSearchQuery` prop to pre-populate search and highlight matched items separately
- **InfiniteKitchenGrid** - Scrollable grid of kitchen cards with lazy loading
- **KitchenNavbar** - Kitchen portal navigation bar
- **KitchenFooter** - Kitchen portal FAQ/footer section
- **KitchenWishlistButton** - Kitchen-level wishlist toggle
- **VegFilter / SortByDialog** - Menu filtering controls
- Loading skeletons at `app/kitchen/loading.tsx` (hero + feature cards) and `app/kitchen/[slug]/loading.tsx` (skeleton nav, image, filters, menu cards)

### Admin (`components/admin/`)
- **AcceptForm** - Admin invite acceptance form
- **PermissionGate** - Client component that conditionally renders children based on admin permissions; shows fallback/loading skeleton if permission denied

### Charts (`components/charts/`)
- **BarChart** - Recharts bar chart wrapper
- **LineChart** - Recharts line chart wrapper
- **PieChart** / **DonutChart** - Circular chart wrappers
- **EarningsChart** - Kitchen earnings visualization

## Design Patterns

### Compound Components
`CompoundMenuCard` uses the compound component pattern:
```tsx
<CompoundMenuCard.Root item={item} onAddToCart={fn}>
  <CompoundMenuCard.ImageSection>
    <CompoundMenuCard.BadgeRibbon />
    <CompoundMenuCard.WishlistButton />
  </CompoundMenuCard.ImageSection>
  <CompoundMenuCard.Header />
  <CompoundMenuCard.Footer />
</CompoundMenuCard.Root>
```

### Error Boundaries
`ErrorBoundary` wraps async data sections to prevent full-page crashes.

### Progressive Loading
`ProgressiveImage` loads a blur placeholder first, then the full image.
