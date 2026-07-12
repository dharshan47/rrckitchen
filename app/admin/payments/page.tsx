"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle, HandCoins, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-cod-orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cod-orders")
      if (!res.ok) throw new Error("Failed to fetch COD orders")
      return res.json()
    },
  })

  const settleMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch("/api/admin/settle-cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to settle" }))
        throw new Error(err.error || "Failed to settle COD payment")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cod-orders"] })
      toast.success("Payment settled successfully")
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">COD order reconciliation and delivery partner payouts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Cash on Delivery Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No COD orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Delivery Partner</TableHead>
                    <TableHead>Payout Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: Record<string, unknown>) => (
                    <TableRow key={order.id as string}>
                      <TableCell className="font-mono text-xs">#{(order.id as string).slice(0, 8)}</TableCell>
                      <TableCell>{order.customerName as string}</TableCell>
                      <TableCell>₹{Number(order.totalAmount).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge className={order.paymentStatus === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {order.paymentStatus === "SUCCESS" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.orderStatus as string}</Badge>
                      </TableCell>
                      <TableCell>{order.deliveryPartnerName as string || "—"}</TableCell>
                      <TableCell>
                        {order.payoutStatus ? (
                          <Badge className={order.payoutStatus === "SETTLED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                            {order.payoutStatus as string}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.paymentStatus === "SUCCESS" && order.payoutStatus !== "SETTLED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1"
                            onClick={() => settleMutation.mutate(order.id as string)}
                            disabled={settleMutation.isPending}
                          >
                            {settleMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Settle Payout
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
