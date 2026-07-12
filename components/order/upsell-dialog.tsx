"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { XIcon, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpsellItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  foodType: string;
}

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: UpsellItem[];
  onAddItem: (item: UpsellItem) => void;
  message?: string;
}

export function UpsellDialog({ open, onOpenChange, items, onAddItem, message }: UpsellDialogProps) {
  if (items.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="
            fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2
            md:-translate-x-1/2 md:-translate-y-1/2
            rounded-t-3xl md:rounded-2xl bg-white dark:bg-gray-900 p-6 z-50
            data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom
            data-[state=open]:duration-300
            data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom
            data-[state=closed]:duration-200
            max-w-md w-full mx-auto
          "
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">{message ?? "Craving more?"}</h2>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm">
                <XIcon className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">₹{item.price}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onAddItem(item)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>

          <Dialog.Close asChild>
            <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
              No thanks
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
