"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
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

  const queryKey = ["wishlist-ids"];

  const { data: wishlist = [] } = useQuery<string[]>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items ?? data).map((i: { menuItemId: string }) => i.menuItemId);
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey) ?? [];
      const updated = prev.includes(menuItemId)
        ? prev.filter((id) => id !== menuItemId)
        : [...prev, menuItemId];
      queryClient.setQueryData(queryKey, updated);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      toast.error("Failed to update favourites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
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
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-6 w-6",
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-1.5 right-1.5 z-10 flex items-center justify-center",
          className
        )}
        aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-colors",
            isFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-400"
          )}
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.75))" }}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-400",
        className
      )}
      aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart className={cn(isFavorite ? "fill-red-500" : "", iconSizes[size])} />
    </button>
  );
}
