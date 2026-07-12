"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useCartActions } from "@/stores";

interface ReorderButtonProps {
  items: Array<{ name: string; quantity: number; unitPrice: string }>;
  onSuccess?: () => void;
}

export function ReorderButton({ items, onSuccess }: ReorderButtonProps) {
  const router = useRouter();
  const { addToCart, clearCart } = useCartActions();

  const handleReorder = useCallback(() => {
    clearCart();
    for (const item of items) {
      addToCart({
        id: `reorder-${item.name}-${Date.now()}`,
        name: item.name,
        price: Number(item.unitPrice),
        qty: item.quantity,
        foodType: "VEG",
        timeSlot: "LUNCH",
        kitchenName: "Previous order",
      });
    }
    router.push("/cart");
    onSuccess?.();
  }, [items, clearCart, addToCart, router, onSuccess]);

  return (
    <Button variant="outline" size="sm" onClick={handleReorder}>
      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
      Reorder
    </Button>
  );
}
