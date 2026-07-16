"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface KitchenWishlistButtonProps {
  kitchenPartnerId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function KitchenWishlistButton({ kitchenPartnerId, className, size = "sm" }: KitchenWishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = ["kitchen-wishlist-ids"];

  const { data: wishlist = [] } = useQuery<string[]>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/kitchen/wishlist");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session?.user,
    staleTime: 30_000,
  });

  const isFavorite = wishlist.includes(kitchenPartnerId);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/kitchen/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitchenPartnerId }),
      });
      if (!res.ok) throw new Error("Failed to toggle wishlist");
      return res.json() as Promise<{ added: boolean; removed: boolean }>;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey) ?? [];
      const updated = prev.includes(kitchenPartnerId)
        ? prev.filter((id) => id !== kitchenPartnerId)
        : [...prev, kitchenPartnerId];
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

  return (
    <button
      onClick={handleClick}
      className={cn("flex items-center justify-center min-h-11 min-w-11", className)}
      aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all drop-shadow-sm",
          isFavorite
            ? "fill-rose-500 text-rose-500"
            : "text-white/80 hover:text-rose-400"
        )}
      />
    </button>
  );
}
