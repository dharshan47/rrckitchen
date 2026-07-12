"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAdminOrders, updateOrderStatus, verifyPaymentWithRazorpay } from "@/actions/orders/orders"
import { ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useEffect } from "react"

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READYFORPICKUP: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
}

const paymentStyles: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
}

const methodLabels: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay Later",
  banktransfer: "Bank Transfer",
  emandate: "eMandate",
}

function methodDisplayName(method: string): string {
  return methodLabels[method.toLowerCase()] ?? method.charAt(0).toUpperCase() + method.slice(1)
}

const statusFlow = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "COMPLETED"] as const

const nextStatus: Record<string, string> = {
  CONFIRMED: "PREPARING",
  PREPARING: "READYFORPICKUP",
  READYFORPICKUP: "COMPLETED",
}

const statusChangeSchema = z.object({
  newStatus: z.enum(["CONFIRMED", "PREPARING", "READYFORPICKUP", "COMPLETED", "CANCELLED", "REFUNDED"]),
})

type StatusChangeForm = z.infer<typeof statusChangeSchema>

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const autoVerified = useRef(false)

  const form = useForm<StatusChangeForm>({
    resolver: zodResolver(statusChangeSchema),
  })

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
    refetchInterval: 15_000,
  })

  const selectedOrder = selectedOrderId ? orders.find((o) => o.id === selectedOrderId) ?? null : null

  useEffect(() => {
    if (selectedOrder) {
      form.setValue("newStatus", selectedOrder.status as StatusChangeForm["newStatus"])
      form.clearErrors()
    }
  }, [selectedOrder, form])

  const verifyMutation = useMutation({
    mutationFn: (orderId: string) => verifyPaymentWithRazorpay(orderId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      } else {
        toast.error(result.error ?? "Verification failed")
      }
    },
    onError: () => toast.error("Failed to verify payment"),
  })

  useEffect(() => {
    if (orders.length > 0 && !autoVerified.current) {
      autoVerified.current = true
      const pending = orders.filter((o) => o.payment === "PENDING" && o.providerOrderId)
      if (pending.length > 0) {
        pending.forEach((o) => verifyMutation.mutate(o.id))
      }
    }
  }, [orders, verifyMutation])

  const advanceMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (result, { status }) => {
      if (result.success) {
        toast.success(`Order marked as ${status.replace(/_/g, " ").toLowerCase()}`)
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update order"),
  })

  const statusChangeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: (result, { status }) => {
      if (result.success) {
        toast.success(`Order status updated to ${status.replace(/_/g, " ").toLowerCase()}`)
        setSelectedOrderId(null)
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update order"),
  })

  const handleAdvance = (orderId: string, status: string) => {
    advanceMutation.mutate({ orderId, status })
  }

  const onStatusChange = form.handleSubmit((data) => {
    if (!selectedOrderId) return
    statusChangeMutation.mutate({ id: selectedOrderId, status: data.newStatus })
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <p className="text-sm text-muted-foreground">All customer orders across kitchens</p>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Kitchen</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="text-sm">{order.kitchen}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                      {order.items.join(", ")}
                    </TableCell>
                    <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status === "READYFORPICKUP" ? "Ready" : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStyles[order.payment] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.payment === "SUCCESS" ? "Paid" : order.payment.charAt(0) + order.payment.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.paymentMethod
                        ? methodDisplayName(order.paymentMethod)
                        : order.paymentProvider === "CASH_ON_DELIVERY"
                          ? "COD"
                          : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {order.payment === "PENDING" && order.providerOrderId && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-amber-600"
                            onClick={() => verifyMutation.mutate(order.id)}
                            disabled={verifyMutation.isPending && verifyMutation.variables === order.id}
                          >
                            {verifyMutation.isPending && verifyMutation.variables === order.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <><RefreshCw className="h-3 w-3 mr-1" /> Verify</>}
                          </Button>
                        )}
                        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleAdvance(order.id, nextStatus[order.status] ?? order.status)}
                            disabled={advanceMutation.isPending && advanceMutation.variables?.orderId === order.id}
                          >
                            {advanceMutation.isPending && advanceMutation.variables?.orderId === order.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <><ChevronRight className="h-3 w-3 mr-1" /> {nextStatus[order.status] === "COMPLETED" ? "Delivered" : "Next"}</>
                            )}
                          </Button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "REFUNDED" && order.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600"
                            onClick={() => handleAdvance(order.id, "CANCELLED")}
                            disabled={advanceMutation.isPending && advanceMutation.variables?.orderId === order.id}
                          >
                            {advanceMutation.isPending && advanceMutation.variables?.orderId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          Change
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => { if (!open) setSelectedOrderId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id?.slice(0, 8)} &middot; {selectedOrder?.customer}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={onStatusChange} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Current Status</label>
                <span className={`inline-flex self-start items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[selectedOrder.status] ?? ""}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="newStatus">New Status</label>
                <Select
                  value={form.getValues("newStatus")}
                  onValueChange={(v) => form.setValue("newStatus", v as StatusChangeForm["newStatus"])}
                >
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFlow.map((s) => (
                      <SelectItem key={s} value={s}>{s === "READYFORPICKUP" ? "Ready for Pickup" : s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                    ))}
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.newStatus && (
                  <p className="text-xs text-destructive">{form.formState.errors.newStatus.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedOrderId(null)}>Cancel</Button>
                <Button type="submit" disabled={statusChangeMutation.isPending}>
                  {statusChangeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
