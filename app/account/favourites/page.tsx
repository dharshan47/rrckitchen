"use client";

import { useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Heart, Trash2, ChefHat, Loader2, UtensilsCrossed, MapPin } from "lucide-react";
import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

function menuItemUrl(item: MenuWishlistItem["menuItem"]): string {
  const kitchenSlug = item.menu?.kitchenPartner?.slug;
  const itemSlug = item.slug;
  const shortId = item.id.slice(0, 8);
  if (kitchenSlug && itemSlug) {
    return `/menu/${kitchenSlug}/${itemSlug}-${shortId}`;
  }
  return "/search";
}

interface MenuWishlistItem {
  id: string;
  menuItem: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    foodType: string;
    timeSlot: string;
    description: string | null;
    photos: { imageUrl: string }[];
    menu: {
      kitchenPartner: {
        slug?: string;
        kitchenAlias: { displayName: string } | null;
      } | null;
    } | null;
  };
}

interface KitchenWishlistItem {
  id: string;
  kitchenPartnerId: string;
  createdAt: string;
  kitchenPartner: {
    id: string;
    slug: string | null;
    status: string;
    kitchenAlias: { displayName: string } | null;
    kitchenAddress: { lineOne: string; pincode: string } | null;
    kitchenKyc: { phoneNumber: string | null } | null;
    user: { name: string | null };
  };
}

function MenuSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
    </div>
  );
}

function KitchenSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
    </div>
  );
}

function MenuCard({ item, onRemove, isRemoving }: { item: MenuWishlistItem; onRemove: (id: string) => void; isRemoving: boolean }) {
  return (
    <div className="flex flex-col rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
      {item.menuItem.slug ? (
        <Link href={menuItemUrl(item.menuItem)} className="shrink-0">
          <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2">
            {item.menuItem.photos[0]?.imageUrl ? (
              <Image src={item.menuItem.photos[0].imageUrl} alt="" width={200} height={200} className="h-full w-full object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            ) : (
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
        </Link>
      ) : (
        <div className="shrink-0">
          <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2">
            {item.menuItem.photos[0]?.imageUrl ? (
              <Image src={item.menuItem.photos[0].imageUrl} alt="" width={200} height={200} className="h-full w-full object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            ) : (
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
        </div>
      )}
      {item.menuItem.slug ? (
        <Link href={menuItemUrl(item.menuItem)} className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.menuItem.name}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">₹{item.menuItem.price}</span> · {item.menuItem.foodType}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.menuItem.menu?.kitchenPartner?.kitchenAlias?.displayName ?? ""}
          </p>
        </Link>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.menuItem.name}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">₹{item.menuItem.price}</span> · {item.menuItem.foodType}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.menuItem.menu?.kitchenPartner?.kitchenAlias?.displayName ?? ""}
          </p>
        </div>
      )}
      <button
        onClick={() => onRemove(item.menuItem.id)}
        disabled={isRemoving}
        className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
        aria-label="Remove from favourites"
      >
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
  );
}

function KitchenCard({ item, onRemove, isRemoving }: { item: KitchenWishlistItem; onRemove: (id: string) => void; isRemoving: boolean }) {
  const kitchen = item.kitchenPartner;
  const alias = kitchen.kitchenAlias;
  const address = kitchen.kitchenAddress;
  return (
    <div className="flex flex-col rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
      <Link href={`/kitchen/${kitchen.slug || (alias?.displayName ?? kitchen.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} className="flex flex-col items-center text-center mb-2">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <ChefHat className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm font-medium truncate w-full">{alias?.displayName ?? kitchen.user.name ?? ""}</p>
        {address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" /> {address.lineOne}
          </p>
        )}
      </Link>
      <button
        onClick={() => onRemove(kitchen.id)}
        disabled={isRemoving}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
        aria-label="Remove from favourites"
      >
        <Trash2 className="h-3.5 w-3.5" /> Remove
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
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const columnCount = useCallback(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1024) return 4;
    return 2;
  }, []);

  const rowCount = Math.ceil(items.length / columnCount());
  const rowHeight = 280;

  /* eslint-disable-next-line react-hooks/incompatible-library */
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => gridRef.current?.closest("[data-virtual-scroll]") as HTMLElement ?? gridRef.current,
    estimateSize: () => rowHeight,
    overscan: 2,
  });

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

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <div key={i}>{skeleton}</div>)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <EmptyIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">{emptyTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{emptyDesc}</p>
          <Button asChild><Link href={emptyHref}>{emptyAction}</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={gridRef} data-virtual-scroll className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
      <div
        className="relative w-full"
        style={{ transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const cols = columnCount();
          const rowItems = items.slice(rowIndex * cols, (rowIndex + 1) * cols);
          return (
            <div
              key={virtualRow.key}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              style={{ height: `${virtualRow.size}px` }}
            >
              {rowItems.map((item, ci) => (
                <div key={ci}>{renderItem(item)}</div>
              ))}
            </div>
          );
        })}
      </div>
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function FavouritesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const {
    data: menuData,
    fetchNextPage: fetchNextMenuPage,
    hasNextPage: hasNextMenuPage,
    isFetchingNextPage: isFetchingNextMenuPage,
    isLoading: menuLoading,
    isError: menuError,
  } = useInfiniteQuery({
    queryKey: ["wishlist"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "12");
      const res = await fetch(`/api/wishlist?${params}`);
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json() as Promise<{ items: MenuWishlistItem[]; nextCursor: string | null }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isLoggedIn,
  });

  const {
    data: kitchenData,
    fetchNextPage: fetchNextKitchenPage,
    hasNextPage: hasNextKitchenPage,
    isFetchingNextPage: isFetchingNextKitchenPage,
    isLoading: kitchenLoading,
    isError: kitchenError,
  } = useInfiniteQuery({
    queryKey: ["kitchen-wishlist"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "12");
      const res = await fetch(`/api/kitchen/wishlist?${params}`);
      if (!res.ok) throw new Error("Failed to fetch kitchen wishlist");
      return res.json() as Promise<{ items: KitchenWishlistItem[]; nextCursor: string | null }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isLoggedIn,
  });

  const menuRemoveMutation = useMutation({
    mutationFn: async (menuItemId: string) => {
      const res = await fetch(`/api/wishlist?menuItemId=${menuItemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from favourites");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const kitchenRemoveMutation = useMutation({
    mutationFn: async (kitchenPartnerId: string) => {
      const res = await fetch(`/api/kitchen/wishlist?kitchenPartnerId=${kitchenPartnerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-wishlist"] });
      toast.success("Removed from favourites");
    },
    onError: () => toast.error("Failed to remove kitchen"),
  });

  const menuItems = menuData?.pages.flatMap((p) => p.items) ?? [];
  const kitchenItems = kitchenData?.pages.flatMap((p) => p.items) ?? [];

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Login to view Favourites</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to see your favourite items and kitchens.</p>
          </div>
          <Button asChild><Link href="/login">Login</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Favourites</h1>
            <p className="text-sm text-muted-foreground">Your saved items and kitchens</p>
          </div>
        </div>

        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start gap-1 bg-transparent p-0 pb-1 scrollbar-none">
            <TabsTrigger value="menu" className="shrink-0 gap-1.5 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UtensilsCrossed className="h-4 w-4 shrink-0" /> Menu Items ({menuItems.length})
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="shrink-0 gap-1.5 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChefHat className="h-4 w-4 shrink-0" /> Kitchens ({kitchenItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-0">
            <VirtualGrid<MenuWishlistItem>
              items={menuItems}
              loading={menuLoading}
              error={menuError}
              hasNextPage={hasNextMenuPage}
              isFetchingNextPage={isFetchingNextMenuPage}
              fetchNextPage={fetchNextMenuPage}
              renderItem={(item) => (
                <MenuCard
                  item={item}
                  onRemove={(id) => menuRemoveMutation.mutate(id)}
                  isRemoving={menuRemoveMutation.isPending}
                />
              )}
              skeleton={<MenuSkeleton />}
              emptyIcon={Heart}
              emptyTitle="No favourite items yet"
              emptyDesc="Browse the menu and save items you love"
              emptyAction="Browse Menu"
              emptyHref="/"
            />
          </TabsContent>

          <TabsContent value="kitchen" className="mt-0">
            <VirtualGrid<KitchenWishlistItem>
              items={kitchenItems}
              loading={kitchenLoading}
              error={kitchenError}
              hasNextPage={hasNextKitchenPage}
              isFetchingNextPage={isFetchingNextKitchenPage}
              fetchNextPage={fetchNextKitchenPage}
              renderItem={(item) => (
                <KitchenCard
                  item={item}
                  onRemove={(id) => kitchenRemoveMutation.mutate(id)}
                  isRemoving={kitchenRemoveMutation.isPending}
                />
              )}
              skeleton={<KitchenSkeleton />}
              emptyIcon={ChefHat}
              emptyTitle="No favourite kitchens yet"
              emptyDesc="Discover kitchens and save your favourites"
              emptyAction="Browse Kitchens"
              emptyHref="/"
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
