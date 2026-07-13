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

### Order (`components/order/`)
- **OrderTypeSelector** - Pre-book vs Order Now toggle
- **PaymentMethodSelector** - Razorpay vs COD selector
- **CouponInput** - Coupon code input with validation
- **CravingsPopup** - Post-order upsell dialog
- **RatingPrompt** - Kitchen + delivery rating with stars
- **OrderTimeline** - Order status progress tracker

### Search (`components/search/`)
- **SearchPageContent** - Full search results page
- **SearchAutocomplete** - Live search with suggestions

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

### Admin (`components/admin/`)
- **AcceptForm** - Admin invite acceptance form

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
