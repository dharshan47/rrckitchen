"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useCartActions, useMenuDeliveryAddress } from "@/stores";
import { formatTimeSlot, createBadgeVariant } from "@/lib/patterns";
import { LocationDialog } from "@/components/location";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCw,
  Truck,
  MapPin,
  ShoppingCart,
  Package,
  Search,
  TruckIcon,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { WishlistButton } from "@/components/menu/wishlist-button";

interface MenuItemPhoto {
  id?: string;
  imageUrl: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  avgRating: number | null;
  totalReviews: number;
  menu: { kitchenPartner: { kitchenAlias: { displayName: string } | null } | null } | null;
  photos: MenuItemPhoto[];
}

interface MenuItemDetailProps {
  item: MenuItem;
}

export function MenuItemDetail({ item }: MenuItemDetailProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showPrevCarousel, setShowPrevCarousel] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [showMobileSticky, setShowMobileSticky] = useState(false);
  const [passedContent, setPassedContent] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const addToCart = useCartActions().addToCart;
  const deliveryAddress = useMenuDeliveryAddress();
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const howToOrderRef = useRef<HTMLDivElement>(null);
  const pageBottomRef = useRef<HTMLDivElement>(null);

  const showDesktopCompact = passedContent && !atBottom;

  const kitchenName = item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen";
  const hasMultiplePhotos = item.photos?.length > 1;
  const price = Number(item.price);
  const hasDiscount = item.compareAtPrice != null;
  const mrp = item.compareAtPrice ?? Math.round(price * 1.35);
  const offAmount = mrp - price;

  const sortedPhotos = [...(item.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const handlePrevImage = useCallback(() => {
    setImageIndex((i) => (i > 0 ? i - 1 : sortedPhotos.length - 1));
  }, [sortedPhotos.length]);

  const handleNextImage = useCallback(() => {
    setImageIndex((i) => (i < sortedPhotos.length - 1 ? i + 1 : 0));
  }, [sortedPhotos.length]);

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: item.id,
      name: item.name,
      price,
      qty: 1,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName,
    });
  }, [addToCart, item, price, kitchenName]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    const SWIPE_THRESHOLD = 50;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }
    setTouchStart(null);
  }, [touchStart, handlePrevImage, handleNextImage]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: item.name, text: item.name, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [item.name]);

  // Mobile: show sticky top bar when image section scrolls past
  useEffect(() => {
    const el = imageSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Desktop: show compact bar when image/details section is scrolled past
  // (i.e., when How to Order section is in view)
  useEffect(() => {
    const el = imageSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPassedContent(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Desktop: hide bar when near footer
  useEffect(() => {
    const el = pageBottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Thumbnail Carousel: Toggle Previous button based on scroll
  useEffect(() => {
    const el = document.getElementById("thumb-scroll");
    if (!el) return;
    const handleScroll = () => {
      setShowPrevCarousel(el.scrollLeft > 50);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Mobile: Location Prompt */}
        {!deliveryAddress && (
          <div className="md:hidden">
            <LocationPrompt onClick={() => setLocationOpen(true)} />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 lg:px-10 py-6 lg:py-10">
          {/* Top Section: Side by side on desktop */}
          <div className="flex flex-col lg:flex-row lg:gap-10">
            {/* Left Column - Image Gallery + Price + Add to Cart */}
            <div
              ref={imageSectionRef}
              className="lg:w-[55%] lg:sticky lg:top-28 lg:self-start"
            >
              {/* Main Image Container */}
              <div
                className="relative overflow-hidden bg-white"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative aspect-square w-full overflow-hidden border border-border/40 bg-slate-50 shadow-sm">
                  {sortedPhotos.length > 0 ? (
                    <>
                      <ProgressiveImage
                        src={sortedPhotos[imageIndex]?.imageUrl}
                        alt={item.name}
                        fill
                        priority
                        className="object-contain p-4"
                      />
                      <button
                        onClick={() => window.history.back()}
                        className="md:hidden absolute top-4 left-4 h-9 w-9 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow-md"
                        aria-label="Go back"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <WishlistButton menuItemId={item.id} size="md" className="md:hidden absolute top-4 right-16" />
                      <button
                        onClick={handleShare}
                        className="md:hidden absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow-md"
                        aria-label="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-8xl font-bold text-muted-foreground/15">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mobile: dot indicators */}
                {hasMultiplePhotos && (
                  <div className="md:hidden flex items-center justify-center gap-1.5 mt-3">
                    {sortedPhotos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        className={`rounded-full transition-all ${
                          i === imageIndex
                            ? "h-2 w-5 bg-primary"
                            : "h-2 w-2 bg-muted-foreground/30"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Desktop Thumbnail carousel - centered below image */}
                {hasMultiplePhotos && (
                  <div className="hidden md:flex items-center justify-center gap-2 mt-8 px-10 relative group/carousel">
                    {/* Previous Button - only if scrolled past first page */}
                    {showPrevCarousel && (
                      <button
                        className="absolute left-0 h-10 w-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg border border-border hover:scale-110 transition-transform z-10"
                        onClick={() => {
                          const el = document.getElementById("thumb-scroll");
                          if (el) el.scrollBy({ left: -400, behavior: "smooth" });
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                    <div 
                      id="thumb-scroll"
                      className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1"
                      style={{ maxWidth: "600px" }}
                    >
                      {sortedPhotos.map((photo, i) => (
                        <button
                          key={photo.id ?? `thumb-${i}`}
                          onClick={() => setImageIndex(i)}
                          className={`snap-start shrink-0 relative overflow-hidden border-2 transition-all shadow-sm ${
                            i === imageIndex
                              ? "border-[#1a6a32] ring-1 ring-[#1a6a32]"
                              : "border-transparent opacity-80 hover:opacity-100 hover:border-border"
                          } w-20 h-20 lg:w-24 lg:h-24`}
                        >
                          <ProgressiveImage 
                            src={photo.imageUrl} 
                            alt="" 
                            fill 
                            className="object-contain p-1.5"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Next Button - visible if more images exist */}
                    <button
                      className="absolute right-0 h-10 w-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg border border-border hover:scale-110 transition-transform z-10"
                      onClick={() => {
                        const el = document.getElementById("thumb-scroll");
                        if (el) el.scrollBy({ left: 400, behavior: "smooth" });
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price + Add to Cart row below image section */}
              <div className="mt-4 lg:mt-6 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-foreground">₹{price}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-sm lg:text-base text-muted-foreground line-through">₹{mrp}</span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          ₹{offAmount} OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">(incl. of all taxes)</p>
                </div>
                <Button
                  size="default"
                  className="rounded-full px-6 h-11 hidden md:inline-flex"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Right Column - Info Only */}
            <div className="lg:w-[45%] mt-8 lg:mt-0">
              {/* Breadcrumb */}
              <nav className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/menu" className="hover:text-foreground transition-colors">
                  Menu
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-50">
                  {item.name}
                </span>
              </nav>

              <div className="space-y-6">
                {/* Product Name & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    {item.name}
                  </h1>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <Badge
                      variant={createBadgeVariant(item.foodType)}
                      className={item.foodType === "VEG" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                    >
                      {item.foodType}
                    </Badge>
                    <WishlistButton menuItemId={item.id} size="sm" variant="inline" className="hidden lg:flex" />
                    <button
                      onClick={handleShare}
                      className="hidden lg:flex h-8 w-8 rounded-full bg-muted items-center justify-center hover:bg-muted/80 transition-colors"
                      aria-label="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Net Qty & Rating */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Net Qty: 1 Serving
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  {item.avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-foreground font-medium">{item.avgRating}</span>
                      ({item.totalReviews}+)
                    </span>
                  )}
                </div>

                {/* Delivery Info Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3">
                    <RefreshCw className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-sm font-medium text-green-700">Freshly Prepared</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 p-3">
                    <Truck className="h-5 w-5 text-orange-600 shrink-0" />
                    <p className="text-sm font-medium text-orange-700">Fast Delivery</p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Highlights
                  </h3>
                  <div className="rounded-xl border border-border divide-y divide-border text-sm">
                    <div className="flex items-start justify-between px-4 py-3">
                      <span className="text-muted-foreground">Brand</span>
                      <span className="font-medium text-foreground text-right max-w-[60%]">{kitchenName}</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-muted-foreground block mb-1">Allergen Information</span>
                      <span className="text-foreground">Contains: Home-cooked ingredients. Please consult the kitchen for specific allergen details.</span>
                    </div>
                    {item.description && (
                      <div className="px-4 py-3">
                        <span className="text-muted-foreground block mb-1">About</span>
                        <span className="text-foreground leading-6">{item.description}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between px-4 py-3">
                      <span className="text-muted-foreground">Time Slot</span>
                      <span className="font-medium text-foreground text-right">{formatTimeSlot(item.timeSlot)}</span>
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Information
                  </h3>
                  <div className="rounded-xl border border-border divide-y divide-border text-sm">
                    <div className="px-4 py-3">
                      <span className="text-muted-foreground block mb-1">Disclaimer</span>
                      <span className="text-foreground text-xs leading-5">
                        All images are for representational purposes only. It is advised that you read the batch and manufacturing details, directions for use, allergen information, health and nutritional claims (wherever applicable), and other details mentioned on the label before consuming the product. For combo items, individual prices can be viewed on the page.
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-muted-foreground block mb-1">Customer Care Details</span>
                      <span className="text-foreground text-xs leading-5">
                        In case of any issue, contact us
                        <br />
                        E-mail address: support@rrckitchen.com
                      </span>
                    </div>
                    <div className="flex items-start justify-between px-4 py-3">
                      <span className="text-muted-foreground">Seller Name</span>
                      <span className="font-medium text-foreground text-right max-w-[55%]">{kitchenName}</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-muted-foreground block mb-1">Seller Address</span>
                      <span className="text-foreground text-xs leading-5">Prepared fresh in a home kitchen. Contact the kitchen for location details.</span>
                    </div>
                    <div className="flex items-start justify-between px-4 py-3">
                      <span className="text-muted-foreground">Country of Origin</span>
                      <span className="font-medium text-foreground text-right">India</span>
                    </div>
                    <div className="flex items-start justify-between px-4 py-3">
                      <span className="text-muted-foreground">Shelf Life</span>
                      <span className="font-medium text-foreground text-right">Consume within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width How to Order */}
          <div ref={howToOrderRef} className="mt-10 lg:mt-16">
            <HowToBuySection itemName={item.name} />
          </div>
        </div>

        {/* Mobile bottom spacing for fixed bars */}
        <div className="md:hidden h-20" />

        {/* Bottom sentinel at end of component (bar hides when footer is near) */}
        <div ref={pageBottomRef} className="h-1" />
      </div>

      {/* Mobile: Sticky Top Bar (appears when image section scrolls past) */}
      {showMobileSticky && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-sm animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => window.history.back()}
              className="shrink-0 text-foreground"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {sortedPhotos[0] && (
                <div className="h-8 w-8 overflow-hidden bg-slate-100 shrink-0">
                  <ProgressiveImage src={sortedPhotos[0].imageUrl} alt="" fill />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs font-medium text-primary">₹{price}</p>
              </div>
            </div>
            <WishlistButton menuItemId={item.id} size="sm" variant="inline" />
            <button
              onClick={handleShare}
              className="shrink-0 text-foreground"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop: Compact Top Bar (attached to navbar, appears when scrolled past) */}
      {showDesktopCompact && (
        <div className="hidden lg:flex fixed top-20 left-0 right-0 z-40 bg-background border-b border-border shadow-sm animate-in slide-in-from-top duration-200">
          <div className="mx-auto max-w-7xl w-full px-10 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {sortedPhotos[0] && (
                <div className="h-10 w-10 overflow-hidden bg-slate-100 shrink-0">
                  <ProgressiveImage src={sortedPhotos[0].imageUrl} alt="" fill />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-primary">₹{price}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                          ₹{offAmount} OFF
                        </span>
                      </>
                    )}
                  </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <Button
                size="default"
                className="rounded-full px-6 h-10"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Fixed Bottom Add to Cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-primary">₹{price}</span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
                  <span className="text-[10px] font-semibold text-green-600">₹{offAmount} OFF</span>
                </>
              )}
            </div>
          </div>
          <Button
            size="default"
            className="rounded-full px-8 h-11 shrink-0"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}

function LocationPrompt({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-blue-50 border-b border-blue-200 px-4 py-3 text-left"
    >
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <MapPin className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-800">Select your delivery location</p>
        <p className="text-xs text-blue-600">Enter an address to see availability</p>
      </div>
      <ChevronRight className="h-4 w-4 text-blue-400 shrink-0" />
    </button>
  );
}

function HowToBuySection({ itemName }: { itemName: string }) {
  const steps = [
    {
      icon: Search,
      title: "Search for the item",
      description: `Search for "${itemName}" in the RRC Kitchen app or browse through the menu section to find it.`,
    },
    {
      icon: Star,
      title: "View details & ratings",
      description: "Check the price, available time slots, kitchen information, and customer ratings to make your choice.",
    },
    {
      icon: ShoppingCart,
      title: "Add to cart & checkout",
      description: "Add the item to your cart and proceed to checkout with secure payment options including Razorpay.",
    },
    {
      icon: TruckIcon,
      title: "Get fresh delivery",
      description: "Your order will be prepared fresh by the kitchen and delivered to your doorstep by the next meal time.",
    },
  ];

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">
          How to Buy <span className="text-primary">{itemName}</span>
        </h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-2 ml-4">
        Step-by-step guide to order online
      </p>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-6 flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Step {i + 1}: {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-6">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


