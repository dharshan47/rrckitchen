"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WishlistButtonProps {
  menuItemId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline";
}

export function WishlistButton({ menuItemId, className, size = "sm", variant = "overlay" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: wishlist = [] } = useQuery<string[]>({
    queryKey: ["wishlist-ids"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return [];
      const items = await res.json();
      return items.map((i: { menuItemId: string }) => i.menuItemId);
    },
    enabled: !!session?.user,
    staleTime: 30_000,
  });

  const isFavorite = wishlist.includes(menuItemId);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId }),
      });
      if (!res.ok) throw new Error("Failed to toggle wishlist");
      return res.json() as Promise<{ added: boolean; removed: boolean }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.added ? "Added to favourites" : "Removed from favourites");
    },
    onError: () => {
      toast.error("Failed to update favourites");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    toggleMutation.mutate();
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-5 w-5",
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={cn(
          "absolute top-1.5 right-1.5 z-10 flex items-center justify-center transition-all",
          className
        )}
        aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
      >
        {toggleMutation.isPending ? (
          <Loader2 className={cn("animate-spin text-muted-foreground", iconSizes[size])} />
        ) : (
          <Heart
            className={cn(
              iconSizes[size],
              "transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground/60 hover:text-red-400"
            )}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-400",
        className
      )}
      aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
    >
      {toggleMutation.isPending ? (
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
      ) : (
        <Heart className={cn(isFavorite ? "fill-red-500" : "", iconSizes[size])} />
      )}
      <span className="text-sm font-medium">{isFavorite ? "Favourited" : "Favourite"}</span>
    </button>
  );
}
