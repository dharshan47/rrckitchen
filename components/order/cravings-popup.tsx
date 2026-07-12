"use client"

import { useCallback, useState } from "react"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Sparkles } from "lucide-react"
import Link from "next/link"

interface CravingItem {
  id: string
  name: string
  description: string
  price: number
  foodType: string
}

interface CravingsPopupProps {
  orderId: string
}

export function CravingsPopup({ orderId }: CravingsPopupProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CravingItem[]>([])
  const [message, setMessage] = useState("")

  useAblyOrderChannel(
    orderId,
    useCallback(
      (msg: { name: string; data: unknown }) => {
        if (msg.name === "order:cravings") {
          const data = msg.data as { items: CravingItem[]; message: string }
          setItems(data.items)
          setMessage(data.message)
          setOpen(true)
        }
      },
      []
    ),
    true
  )

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Still hungry?</DialogTitle>
          </div>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/menu?highlight=${item.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors no-underline"
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
                <span className={`text-[10px] font-medium ${item.foodType === "VEG" ? "text-green-600" : "text-red-600"}`}>
                  {item.foodType}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Not now
          </Button>
          <Button asChild className="flex-1" onClick={() => setOpen(false)}>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
