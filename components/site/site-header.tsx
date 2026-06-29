"use client";

import Link from "next/link";
import { Search, Zap, ChevronDown, User, ShoppingCart, Home, LayoutDashboard, Leaf, Egg } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useMenuStore, FoodTypeFilter, TimeSlotFilter, useCartStore } from "@/stores";

const foodTypeOptions: { value: FoodTypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "ALL", label: "All", icon: null },
  { value: "VEG", label: "Veg", icon: <Leaf className="h-4 w-4" /> },
  { value: "NONVEG", label: "Non Veg", icon: <Egg className="h-4 w-4" /> },
];

const timeSlotOptions: { value: TimeSlotFilter; label: string }[] = [
  { value: "MORNING", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "EVENINGSNACKS", label: "Snacks" },
  { value: "DINNER", label: "Dinner" },
];

export function SiteHeader() {
  const selectedFoodType = useMenuStore((s) => s.selectedFoodType);
  const selectedTimeSlot = useMenuStore((s) => s.selectedTimeSlot);
  const setSelectedFoodType = useMenuStore((s) => s.setSelectedFoodType);
  const setSelectedTimeSlot = useMenuStore((s) => s.setSelectedTimeSlot);
  const cartCount = useCartStore((s) => s.cart.reduce((t, i) => t + i.qty, 0));

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hidden md:block border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-20">
          {/* Logo & Address Area */}
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-foreground">
              RrcKitchen
            </Link>

            <div className="flex flex-col cursor-pointer group">
              <div className="flex items-center gap-1.5">
                <Zap className="h-5 w-5 text-primary fill-primary" />
                <span className="font-bold text-lg leading-none">19 minutes</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm text-muted-foreground max-w-[180px] truncate">Town Hall - 139, Oppanakara Street...</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                placeholder="Search for 'fresh paneer'"
                className="w-full h-12 pl-12 pr-4 bg-secondary border-none rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-8">
            <Link href="/login" className="flex flex-col items-center gap-0.5 group">
              <User className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Login</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center gap-0.5 group relative">
              <ShoppingCart className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[10px] font-bold">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop Tabs Section - Food Type */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-8 overflow-x-auto scrollbar-none">
            {foodTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedFoodType(opt.value)}
                className={cn(
                  "flex items-center gap-2 h-full border-b-2 whitespace-nowrap transition-colors",
                  selectedFoodType === opt.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.icon}
                <span className="text-sm font-bold uppercase tracking-wide">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Header (Top Nav) */}
      <header className="sticky top-0 z-50 md:hidden bg-background border-b border-border px-4 py-3 space-y-3">
        {/* Row 1: Logo & Login */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-primary tracking-tight">
            RrcKitchen
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[9px] font-bold">
                  {cartCount}
                </Badge>
              )}
            </Link>
            <Button asChild size="sm" className="h-8 px-4 rounded-sm font-semibold">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Row 2: Address */}
        <div className="flex items-center gap-2 text-sm cursor-pointer">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
            <Zap className="h-3 w-3 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-primary leading-none text-xs">19 minutes</p>
            <p className="text-muted-foreground truncate text-[10px] mt-0.5">Home - 139, Oppanakara Street, Town Hall...</p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Row 3: Food Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {foodTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedFoodType(opt.value)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                selectedFoodType === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        {/* Row 4: Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search for 'fresh paneer'"
            className="w-full bg-secondary border-none rounded-lg h-10 pl-10 pr-4 text-sm focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border px-2 py-2 flex items-center justify-around shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <MobileNavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" active />
        <MobileNavItem href="/menu" icon={<LayoutDashboard className="h-6 w-6" />} label="Categories" />
        <MobileNavItem href="/login" icon={<User className="h-6 w-6" />} label="Account" />
        <MobileNavItem href="/cart" icon={<ShoppingCart className="h-6 w-6" />} label="Cart" badge={cartCount} />
      </nav>
      {/* Spacer for mobile bottom nav to prevent content overlap */}
      <div className="h-16 md:hidden" />
    </>
  );
}

function MobileNavItem({ href, icon, label, active = false, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: number }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 px-3 py-1 relative",
      active ? "text-primary" : "text-muted-foreground"
    )}>
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge className="absolute top-0 right-2 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[9px] font-bold">
          {badge}
        </Badge>
      )}
    </Link>
  );
}
