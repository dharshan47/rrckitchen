"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Plus } from "lucide-react"

interface UpsellItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface UpsellDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: UpsellItem[]
  onAddItem: (item: UpsellItem) => void
}

export function UpsellDialog({ open, onOpenChange, items, onAddItem }: UpsellDialogProps) {
  const { data: upsellItems, isFetching } = useQuery<UpsellItem[]>({
    queryKey: ["upsell-items"],
    queryFn: async () => {
      const res = await fetch("/api/menu/upsell")
      if (!res.ok) throw new Error("Failed to fetch upsell items")
      return res.json()
    },
    enabled: open,
  })

  const displayItems = items.length > 0 ? items : (upsellItems ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <DialogTitle>Add to your order</DialogTitle>
          </div>
          <DialogDescription>
            You might also like these
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {isFetching ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading suggestions...</p>
          ) : displayItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No suggestions available</p>
          ) : (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">₹{item.price}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => onAddItem(item)}
                  aria-label={`Add ${item.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
