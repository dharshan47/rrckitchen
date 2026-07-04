"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Eye, Ban, CheckCircle, XCircle, Loader2, Building, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import { getAdminDeliveryPartners, updateDeliveryPartnerStatus } from "@/actions/admin-partners"

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PENDINGAPPROVAL: "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-gray-100 text-gray-500",
}

export default function AdminDeliveryPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<any>(null)

  const { data: partners, isLoading } = useQuery({
    queryKey: ["admin-delivery-partners"],
    queryFn: getAdminDeliveryPartners,
    refetchInterval: 30_000,
  })

  const filtered = (partners ?? []).filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.status.toLowerCase().includes(search.toLowerCase()) ||
      (d.phoneNumber ?? "").includes(search) ||
      (d.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const actionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateDeliveryPartnerStatus(id, status),
    onSuccess: (result, { id, status }) => {
      if (result.success) {
        toast.success(`Delivery partner ${status === "SUSPENDED" ? "suspended" : status === "ACTIVE" || status === "APPROVED" ? "approved" : "rejected"}`)
        queryClient.invalidateQueries({ queryKey: ["admin-delivery-partners"] })
      } else {
        toast.error(result.error ?? "Action failed")
      }
    },
    onError: () => toast.error("Action failed"),
  })

  const handleAction = (id: string, status: string) => {
    actionMutation.mutate({ id, status })
  }

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Partner Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage all delivery partners</p>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, status, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {search ? "No delivery partners match your search" : "No delivery partners yet"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery Person</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.phoneNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[d.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {d.status === "PENDINGAPPROVAL" ? "Pending" : d.status.charAt(0) + d.status.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>{d.orders}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(d)}
                        disabled={!d.kyc}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View bank details</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(d.status === "PENDINGAPPROVAL" || d.status === "SUSPENDED") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(d.id, "ACTIVE")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === d.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                          </Button>
                        )}
                        {d.status !== "SUSPENDED" && d.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(d.id, "SUSPENDED")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === d.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4 text-red-600" />}
                          </Button>
                        )}
                        {(d.status === "PENDINGAPPROVAL" || d.status === "APPROVED" || d.status === "ACTIVE") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(d.id, "REJECTED")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === d.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 text-gray-500" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>Bank &amp; KYC details</DialogDescription>
          </DialogHeader>
          {selected?.kyc ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Account Holder</p>
                  <p className="font-medium">{selected.kyc.accountHolderName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Bank Name</p>
                  <p className="font-medium">{selected.kyc.bankName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Account Number</p>
                  <p className="font-medium">{selected.kyc.bankAccountNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">IFSC Code</p>
                  <p className="font-medium">{selected.kyc.ifscCode ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">UPI ID</p>
                  <p className="font-medium">{selected.kyc.upiId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Google Pay</p>
                  <p className="font-medium">{selected.kyc.googlePayNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">PhonePe</p>
                  <p className="font-medium">{selected.kyc.phonePeNumber ?? "—"}</p>
                </div>
              </div>
              <div className="border-t pt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                KYC {selected.kyc.verifiedAt ? `verified` : "not verified"}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No KYC details submitted yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
