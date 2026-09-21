# Cravings Popup Management

> **Status:** Active
> **Last updated:** 2026-09-20
> **Cross-refs:** [Data Model](03-data-model.md), [State & Data Flow](06-state-data-flow.md), [Real-Time System](09-real-time-system.md), [Roles & Permissions](16-roles-permissions.md)

---

## 1. Overview

The Cravings Popup is a cross-sell/upsell feature. Admins author **rules** ("IF a customer adds `<trigger item>` THEN show `<recommended items>` in the add-to-cart popup"), and the customer-facing popup renders live recommendations right after an item is added to the cart or an order is paid.

Two surfaces consume the same rules:

| Surface | Path | What it does |
|---------|------|--------------|
| Admin management | `/admin/content/cravings-popup` | CRUD + toggle + preview of rules (requires `MANAGE_CMS`) |
| Customer popup | `components/menu/add-to-cart-popup.tsx` | Renders recommendations from rules + real-time Ably events |

---

## 2. Data Model

Prisma models added in `prisma/schema.prisma` (migration `20260808000000_add_cravings_rules`):

```
CravingsPriority enum: HIGH | MEDIUM | LOW

CravingsRule
  id, name
  triggerItemId      -> MenuItem (relation "cravingsTriggerItem")
  kitchenId          -> KitchenPartner (relation "cravingsTriggerKitchen")
  title, message     (popup copy)
  priority           CravingsPriority  (HIGH applied first)
  isActive
  updatedBy          (admin user id)
  items              CravingsRuleItem[]  (ordered by sortOrder)
  createdAt, updatedAt

CravingsRuleItem
  id, ruleId         -> CravingsRule
  menuItemId         -> MenuItem
  sortOrder
  @@unique([ruleId, menuItemId])
```

Key relations added to existing models:

- `MenuItem.cravingsTriggers` / `MenuItem.cravingsRuleItems` (back-relations)
- `KitchenPartner.cravingsTriggerRules` (back-relation)

### Rule resolution

On the customer side, rules are matched in `CravingsPriority` order (`HIGH → MEDIUM → LOW`). The first active rule whose trigger item is present in the cart wins; its recommended items are shown. See `getCravingsRecommendations` in `actions/admin/cravings-popup.ts`.

---

## 3. Server Actions

All actions live in `actions/admin/cravings-popup.ts` ("use server"). Admin actions are guarded with `requirePermission("MANAGE_CMS")`; the customer recommendation action is public.

| Action | Purpose |
|--------|---------|
| `getAllCravingsRules()` | List rows (name, trigger, kitchen, priority, counts, trigger image, timestamps) |
| `getCravingsRule(id)` | Full detail incl. ordered items with photos/kitchen/popularity |
| `getCravingsMenuItems(limit)` | Picker options for trigger + recommended items (price, foodType, kitchen, bestseller, order count) |
| `createCravingsRule(input)` | Create rule + `CravingsRuleItem` rows (transaction) |
| `updateCravingsRule(id, input)` | Update rule, sync item set + sort order (transaction) |
| `deleteCravingsRule(id)` | Remove rule + items |
| `toggleCravingsRule(id, isActive)` | Quick activate/pause |
| `getCravingsRecommendations(triggerItemIds)` | **Public** — resolve best rule for given cart item ids |

---

## 4. State Architecture (Zustand + TanStack Query)

`stores/cravingsPopupStore.ts` follows the project convention: TanStack Query fetches, `useEffect` syncs data into the zustand store; components read via selectors.

### Store (`cravingsPopupStore`)

- `rules`, `menuOptions`, `selectedRuleId`, `draft` (create/edit form state)
- Actions: `setSelectedRuleId`, `openCreateDraft`, `openEditDraft`, `closeDraft`, `updateDraft`, `toggleDraftItem`, `setDraftItemIds`

### Query hooks

| Hook | Backend source |
|------|----------------|
| `useCravingsRulesQuery` (30s refetch) | `getAllCravingsRules` |
| `useCravingsMenuItemsQuery` (5 min stale) | `getCravingsMenuItems(300)` |
| `useCravingsRuleDetailQuery(ruleId)` | `getCravingsRule` |
| `useCravingsRecommendationsQuery(triggerItemIds)` | `getCravingsRecommendations` (customer popup) |

### Mutation hooks

`useCreateCravingsRuleMutation`, `useUpdateCravingsRuleMutation`, `useDeleteCravingsRuleMutation`, `useToggleCravingsRuleMutation` — all invalidate `admin-cravings-rules` / `admin-cravings-rule` keys on success.

---

## 5. Admin UI (`components/admin/content/cravings-popup-client.tsx`)

Built exclusively from shadcn/ui components (`components/ui/*`): `Card`, `Button`, `Badge`, `Input`, `Select`, `Tabs`, `Switch`, `Checkbox`, `Label`, `Textarea`, `Skeleton`, `Dialog`, `AlertDialog`, `ScrollArea`, `Table`.

Layout:

- **Page header** — Preview Popup (disabled until a rule is selected) + Save All Changes
- **6 stat cards** — Active Rules, Total Mappings, Total Menu Items, Impacted Orders, Avg Items per Rule (all computed from real query data)
- **Rules sidebar** — search + status filter, per-rule trigger image, priority/items meta
- **Editor tabs** — Rule Settings, Recommended Items, Display Settings, Popup Content, Preview
- **Dialogs** — Add/Edit Rule (`RuleDialog` incl. trigger search + item picker), `ItemPickerDialog` (search + kitchen/food-type filters), `PopupPreviewDialog` (exact customer popup shape), delete `AlertDialog`

Loading states are exact-shape `Skeleton` layouts (sidebar rows, detail layout, item picker rows). Entry/exit animations use `tw-animate-css` (`animate-in fade-in-0 slide-in-from-* zoom-in-95`) with staggered `animationDelay`.

### Admin navigation

`/admin/content/cravings-popup` was registered in `components/admin/layout-client.tsx` under the **Content** collapsible (icon `ConciergeBell`, permission `MANAGE_CMS`). Route protection is inherited from the `/admin/content` entry in `routePermissionMap`.

---

## 6. Customer Popup (`components/menu/add-to-cart-popup.tsx`)

Rendered by:

- `menu-item-detail.tsx` (~line 303 builds the `AddPopupItem` from backend data; line ~909 renders the popup)
- `kitchen-detail-client.tsx` (~line 920)
- `cart-content.tsx` after successful payment, passing `orderId`

### Data flow

1. **Rule-based (server → TanStack Query → zustand):** `useCravingsRecommendationsQuery(triggerItemIds)` where trigger ids = currently added item + cart items. Results are synced through `cravingsPopupStore` and rendered as recommendation cards.
2. **Real-time (Ably):** when `orderId` is provided, `useAblyOrderChannel(orderId, ...)` subscribes and listens for the `order:cravings` event (`{ title, message, items[] }`). Live items merge ahead of rule-based ones (deduped by display key).
3. **Real data only:** no mock/static item data remains — `AddPopupItem` flows from backend queries; recommendation cards only render fields supplied by the backend (foodType badge and kitchen name are hidden when absent; title/message render only when present).

### Popup shape

- Success header ("Added to Cart!" + item card with qty controls)
- Cart summary with free-delivery progress (`getCartConfig` via TanStack Query)
- Cravings section with skeleton rows while loading and staggered `animate-in` card entries
- shadcn `ScrollArea` (`h-[min(85vh,640px)]`) wraps the body; footer buttons stay at the bottom of the scroll viewport
- `ADD` buttons call `addToCart` with full real item fields (id, name, price, foodType, timeSlot, kitchenName, imageUrl)

---

## 7. Related

- The old post-payment `components/order/cravings-popup.tsx` was removed; `cart-content.tsx` now renders `AddToCartPopup` (with `orderId`) after payment success.
- Invite acceptance form (`components/admin/accept-form.tsx`) follows the same store pattern: `stores/acceptInviteStore.ts` exposes `useInviteValidationQuery` (new public `validateAdminInvite` action in `actions/admin/invites-actions.ts`), `useAcceptInviteMutation`, `useInviteSignOutMutation`; loading/invalid-invite states render exact-shape skeletons.
