# Design System

## Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#EE7005` (Orange) | Buttons, links, active states, icons |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--background` | `#FFFFFF` | Page backgrounds |
| `--foreground` | `#1B2F45` (Dark navy) | Primary text color |
| `--muted` | *neutral-100* | Subtle backgrounds |
| `--muted-foreground` | *neutral-500* | Secondary text |
| `--border` | *neutral-200* | Borders, dividers |
| `--card` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `#1B2F45` | Card text |
| `--destructive` | *red-500* | Error states, delete actions |

## Typography

| Element | Size (Mobile) | Size (Desktop) | Weight |
|---------|--------------|----------------|--------|
| Page title | `text-2xl` | `text-3xl` | `font-bold` |
| Section heading | `text-base` | `text-lg` | `font-bold` |
| Card title | `text-sm` | `text-sm` | `font-bold` |
| Body text | `text-sm` | `text-sm` | `font-medium` |
| Small text | `text-xs` | `text-xs` | `font-medium` |

**Font Family**: Inter (primary), Geist Sans (system), Geist Mono (code)

## Spacing

| Breakpoint | Container Padding | Section Gap |
|------------|------------------|-------------|
| Mobile (<768px) | `px-3` | `space-y-4` |
| Tablet (768px+) | `px-4` | `space-y-6` |
| Desktop (1024px+) | `px-8` | `space-y-8` |

## Component Patterns

### Cards
```tsx
<div className="rounded-xl border border-border bg-card overflow-hidden">
  {/* Card content */}
</div>
```

### Buttons
```tsx
// Primary (filled orange)
<Button className="bg-primary text-primary-foreground">
  Action
</Button>

// Outline
<Button variant="outline">
  Secondary
</Button>

// Ghost
<Button variant="ghost">
  Subtle
</Button>
```

### Forms
```tsx
<Input placeholder="Label" />
// Error state
<Input className="border-destructive" />
<p className="text-xs text-destructive mt-1">Error message</p>
```

### Badges
```tsx
// Kitchen rating badge
<Badge className="bg-green-700 text-white">4.5</Badge>
// Food type
<Badge variant={foodType === "VEG" ? "success" : "destructive"}>
  {foodType}
</Badge>
```

## Responsive Design

The app follows a **mobile-first** approach:

- `sm:` (640px) - Tablet adjustments
- `md:` (768px) - Medium screens
- `lg:` (1024px) - Desktop layout (grids, sidebars)

### Key Responsive Patterns

1. **Grids**: `sm:grid-cols-2 lg:grid-cols-6`
2. **Navigation**: Bottom nav on mobile, top nav on desktop
3. **Sidebars**: Hidden on mobile (sheet/drawer), visible on desktop
4. **Cards**: Horizontal scroll on mobile, grid on desktop
5. **Dialogs**: Full-screen sheet on mobile, centered dialog on desktop

## PWA & Mobile

- Splash screen removed for instant loading
- Manifest icons with `purpose: "maskable"` for adaptive icons
- 300ms delayed spinner to avoid flash for fast loads
- Service worker for offline support
- `display: standalone` for native app feel
