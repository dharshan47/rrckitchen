"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { setDeliveryPersonOnline } from "@/actions/dispatch/dispatch-actions"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DeliveryPersonOnlineToggle({
  initialOnline = false,
  onToggle,
}: {
  initialOnline?: boolean
  onToggle?: (online: boolean) => void
}) {
  const [online, setOnline] = useState(initialOnline)

  const mutation = useMutation({
    mutationFn: (isOnline: boolean) => setDeliveryPersonOnline(isOnline),
    onSuccess: (data) => {
      setOnline(data.isOnline)
      onToggle?.(data.isOnline)
      toast.success(data.isOnline ? "You're now online!" : "You're now offline")
    },
    onError: () => {
      toast.error("Failed to toggle status")
    },
  })

  return (
    <div className="flex items-center gap-3">
      <Switch
        id="delivery-online"
        checked={online}
        onCheckedChange={(checked) => mutation.mutate(checked)}
        disabled={mutation.isPending}
      />
      <Label htmlFor="delivery-online" className="text-sm font-medium">
        {mutation.isPending ? "Updating..." : online ? "Online" : "Offline"}
      </Label>
    </div>
  )
}
