"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, Loader2, Store, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { useCartActions } from "@/stores";
import { RelatedKitchensGrid } from "@/components/kitchen/related-kitchens-grid";
import { KitchenCard as KitchenCardComponent } from "@/components/kitchen/kitchen-card";
import type { KitchenData } from "@/hooks/useExploreKitchens";
import { CompoundMenuCard, type MenuCardItem } from "@/components/patterns/compound-menu-card";
import {
  useRecommendedKitchensQuery,
  useMenuWishlistQuery,
  useKitchenWishlistQuery,
  useRemoveMenuWishlistMutation,
  useRemoveKitchenWishlistMutation,
  useRecommendedKitchens,
  useMenuWishlistItems,
  useKitchenWishlistItems,
  type MenuWishlistItem,
  type KitchenWishlistItem,
} from "@/stores/favouritesStore";

function MenuSkeleton() {
  return (
    <div className="bg-white rounded-xl p-2.5 md:p-3 flex gap-3 md:gap-3.5 shadow-sm border border-gray-100">
      <Skeleton className="w-[100px] md:w-[120px] h-[100px] md:h-[120px] rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center justify-between mt-2 md:mt-2.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-[28px] md:h-[30px] w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function KitchenSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <Skeleton className="w-full h-[160px] md:h-[180px] rounded-none" />
      <div className="p-3 md:p-4 pt-6 md:pt-7 space-y-3">
        <Skeleton className="h-5 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function MenuCard({ item, onRemove, isRemoving }: { item: MenuWishlistItem; onRemove: (id: string) => void; isRemoving: boolean }) {
  const { addToCart } = useCartActions();
  const kitchenName = item.menuItem.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "";

  const menuCardItem: MenuCardItem = {
    id: item.menuItem.id,
    slug: item.menuItem.slug ?? "",
    name: item.menuItem.name,
    price: Number(item.menuItem.price),
    foodType: item.menuItem.foodType,
    timeSlot: item.menuItem.timeSlot,
    kitchenName,
    description: item.menuItem.description,
    imageUrl: item.menuItem.photos?.[0]?.imageUrl ?? null,
  };

  return (
    <div className="relative group">
      <CompoundMenuCard.Root
        item={menuCardItem}
        onAddToCart={(id) => {
          if (id !== item.menuItem.id) return;
          addToCart({
            id: item.menuItem.id,
            name: item.menuItem.name,
            price: Number(item.menuItem.price),
            qty: 1,
            foodType: item.menuItem.foodType,
            timeSlot: item.menuItem.timeSlot,
            kitchenName,
            imageUrl: item.menuItem.photos?.[0]?.imageUrl ?? undefined,
          });
        }}
      >
        <CompoundMenuCard.ImageSection hideWishlistButton />
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.menuItem.id); }}
        disabled={isRemoving}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 h-10 w-10 md:h-11 md:w-11 rounded-[12px] bg-white shadow-sm flex items-center justify-center text-[#F97316] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 border border-[#FEF2F2]"
      >
        <Heart className="h-5 w-5 md:h-6 md:w-6 fill-[#F97316]" strokeWidth={2} />
      </button>
    </div>
  );
}

function KitchenCard({ item, onRemove, isRemoving }: { item: KitchenWishlistItem; onRemove: (id: string) => void; isRemoving: boolean }) {
  const kitchen = item.kitchenPartner;
  const alias = kitchen.kitchenAlias;

  const kitchenData: KitchenData = {
    id: kitchen.id,
    slug: kitchen.slug ?? "",
    displayName: alias?.displayName ?? kitchen.user.name ?? "",
    avgRating: kitchen.avgRating,
    totalReviews: kitchen.totalReviews,
    imageUrl: kitchen.imageUrl,
    customOfferText: null,
    cuisineTags: kitchen.cuisineTags,
    items: [],
    timeSlots: [],
    lat: kitchen.lat,
    lng: kitchen.lng,
    estimatedPrepTime: kitchen.estimatedPrepTime,
    operatingHours: kitchen.operatingHours as KitchenData["operatingHours"],
  };

  return (
    <div className="relative group w-full">
      <KitchenCardComponent kitchen={kitchenData} variant="page" />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(kitchen.id); }}
        disabled={isRemoving}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 h-10 w-10 md:h-11 md:w-11 rounded-[12px] bg-white shadow-sm flex items-center justify-center text-[#F97316] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 border border-[#FEF2F2]"
      >
        <Heart className="h-5 w-5 md:h-6 md:w-6 fill-[#F97316]" strokeWidth={2} />
      </button>
    </div>
  );
}

function VirtualGrid<T>({
  items,
  loading,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  renderItem,
  skeleton,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDesc,
  emptyAction,
  emptyHref,
  layout = "grid"
}: {
  items: T[];
  loading: boolean;
  error: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  renderItem: (item: T) => React.ReactNode;
  skeleton: React.ReactNode;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDesc: string;
  emptyAction: string;
  emptyHref: string;
  layout?: "grid" | "list";
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Failed to load. Try again later.</CardContent></Card>;
  }

  if (loading && items.length === 0) {
    return (
      <div className={layout === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-4" : "flex flex-col gap-4"}>
        {Array.from({ length: layout === "grid" ? 8 : 4 }).map((_, i) => <div key={i}>{skeleton}</div>)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-[#FAFAFA]">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <EmptyIcon className="h-8 w-8 text-[#16A34A]/60" />
          </div>
          <h2 className="text-lg font-bold">{emptyTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">{emptyDesc}</p>
          <Button asChild className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl"><Link href={emptyHref}>{emptyAction}</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={gridRef} className="relative w-full">
      <div className={layout === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-4" : "flex flex-col gap-4"}>
        {items.map((item, index) => (
          <div key={index} className="w-full">
            {renderItem(item)}
          </div>
        ))}
      </div>
      
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#16A34A]" />
        </div>
      )}
    </div>
  );
}

export function FavouritesContent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useRecommendedKitchensQuery(isLoggedIn);
  const {
    fetchNextPage: fetchNextMenuPage,
    hasNextPage: hasNextMenuPage,
    isFetchingNextPage: isFetchingNextMenuPage,
    isLoading: menuLoading,
    isError: menuError,
  } = useMenuWishlistQuery(isLoggedIn);

  const {
    fetchNextPage: fetchNextKitchenPage,
    hasNextPage: hasNextKitchenPage,
    isFetchingNextPage: isFetchingNextKitchenPage,
    isLoading: kitchenLoading,
    isError: kitchenError,
  } = useKitchenWishlistQuery(isLoggedIn);

  const menuRemoveMutation = useRemoveMenuWishlistMutation();
  const kitchenRemoveMutation = useRemoveKitchenWishlistMutation();

  const recommendedKitchens = useRecommendedKitchens();
  const menuItems = useMenuWishlistItems();
  const kitchenItems = useKitchenWishlistItems();

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <div className="h-20 w-20 bg-[#ECFDF3] rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Login to view Favourites</h1>
            <p className="mt-3 text-base text-muted-foreground">Please log in to see your favourite items and kitchens.</p>
          </div>
          <Button asChild size="lg" className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl px-8"><Link href="/login">Login</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-foreground pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              My <span className="text-[#166534]">Favorites</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">Your saved kitchens and menu items</p>
          </div>
        </div>

        <Tabs defaultValue="kitchen" className="space-y-8 w-full">
          <div className="bg-[#F3F4F6] border border-gray-100 p-1.5 rounded-2xl w-full">
            <TabsList className="w-full grid grid-cols-2 bg-transparent h-auto p-0 gap-1 relative">
              <TabsTrigger 
                value="kitchen" 
                className="group relative data-[state=active]:bg-white data-[state=active]:text-[#166534] data-[state=active]:shadow-sm rounded-xl py-3.5 text-sm md:text-base font-semibold gap-2 text-gray-500 transition-all"
              >
                <Store className="h-5 w-5" /> Kitchens
                <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-[#15803D] hidden group-data-[state=active]:block rounded-t-full" />
              </TabsTrigger>
              <TabsTrigger 
                value="menu" 
                className="group relative data-[state=active]:bg-white data-[state=active]:text-[#166534] data-[state=active]:shadow-sm rounded-xl py-3.5 text-sm md:text-base font-semibold gap-2 text-gray-500 transition-all"
              >
                <Soup className="h-5 w-5" /> Menu Items
                <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-[#15803D] hidden group-data-[state=active]:block rounded-t-full" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kitchen" className="mt-0 outline-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Favorite Kitchens <span className="text-muted-foreground font-medium text-base">({kitchenItems.length})</span>
              </h2>
              {kitchenItems.length > 0 && (
                <Link href="/kitchens" className="text-[#F97316] text-sm font-semibold hover:underline">
                  View All
                </Link>
              )}
            </div>

            <VirtualGrid<KitchenWishlistItem>
              items={kitchenItems}
              layout="list"
              loading={kitchenLoading}
              error={kitchenError}
              hasNextPage={hasNextKitchenPage}
              isFetchingNextPage={isFetchingNextKitchenPage}
              fetchNextPage={fetchNextKitchenPage}
              renderItem={(item) => (
                <KitchenCard
                  item={item}
                  onRemove={(id) => kitchenRemoveMutation.mutate(id)}
                  isRemoving={
                    kitchenRemoveMutation.isPending &&
                    kitchenRemoveMutation.variables === item.kitchenPartnerId
                  }
                />
              )}
              skeleton={<KitchenSkeleton />}
              emptyIcon={Store}
              emptyTitle="No favorite kitchens yet"
              emptyDesc="Discover amazing kitchens and save your favorites"
              emptyAction="Browse Kitchens"
              emptyHref="/kitchens"
            />
          </TabsContent>

          <TabsContent value="menu" className="mt-0 outline-none">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Favorite Menu Items <span className="text-muted-foreground font-medium text-base">({menuItems.length})</span>
              </h2>
              {menuItems.length > 0 && (
                <Link href="/search" className="text-[#F97316] text-sm font-semibold hover:underline">
                  View All
                </Link>
              )}
            </div>

            <VirtualGrid<MenuWishlistItem>
              items={menuItems}
              layout="grid"
              loading={menuLoading}
              error={menuError}
              hasNextPage={hasNextMenuPage}
              isFetchingNextPage={isFetchingNextMenuPage}
              fetchNextPage={fetchNextMenuPage}
              renderItem={(item) => (
                <MenuCard
                  item={item}
                  onRemove={(id) => menuRemoveMutation.mutate(id)}
                  isRemoving={
                    menuRemoveMutation.isPending && menuRemoveMutation.variables === item.menuItem.id
                  }
                />
              )}
              skeleton={<MenuSkeleton />}
              emptyIcon={Soup}
              emptyTitle="No favorite items yet"
              emptyDesc="Browse the menu and save items you love"
              emptyAction="Browse Menu"
              emptyHref="/search"
            />
          </TabsContent>
        </Tabs>

        {recommendedKitchens.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <RelatedKitchensGrid 
              kitchens={recommendedKitchens} 
              title="You might also like"
            />
          </div>
        )}

      </div>
    </main>
  );
}
