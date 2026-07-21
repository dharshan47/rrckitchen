"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Eye, Ban, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
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
import { getAdminKitchenPartners, updateKitchenPartnerStatus, updateKitchenCuisines } from "@/actions/admin/admin-partners"
import { getAllCategories } from "@/actions/admin/admin-cms"
import { Skeleton } from "@/components/ui/skeleton"

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PENDINGAPPROVAL: "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-gray-100 text-gray-500",
}

export default function AdminKitchensPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cuisineEditTarget, setCuisineEditTarget] = useState<any>(null)
  const [selectedCuisineIds, setSelectedCuisineIds] = useState<string[]>([])

  const { data: partners, isLoading } = useQuery({
    queryKey: ["admin-kitchen-partners"],
    queryFn: getAdminKitchenPartners,
    refetchInterval: 30_000,
  })

  const filtered = (partners ?? []).filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.status.toLowerCase().includes(search.toLowerCase()) ||
      (k.phoneNumber ?? "").includes(search) ||
      (k.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAllCategories,
  })

  const cuisineMutation = useMutation({
    mutationFn: ({ kitchenId, categoryIds }: { kitchenId: string; categoryIds: string[] }) =>
      updateKitchenCuisines(kitchenId, categoryIds),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cuisines updated")
        setCuisineEditTarget(null)
        queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] })
      } else {
        toast.error(result.error ?? "Failed to update cuisines")
      }
    },
    onError: () => toast.error("Failed to update cuisines"),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateKitchenPartnerStatus(id, status),
    onSuccess: (result, { status }) => {
      if (result.success) {
        toast.success(`Kitchen partner ${status === "SUSPENDED" ? "suspended" : status === "ACTIVE" || status === "APPROVED" ? "approved" : "rejected"}`)
        queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] })
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Kitchen Partners</CardTitle>
                <p className="text-sm text-muted-foreground">Manage all registered kitchen partners</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, status, phone..."
                  value=""
                  disabled
                  className="w-full h-12 pl-11 pr-4 bg-search-bar border-none rounded-xl text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 animate-pulse">
              <div className="flex gap-4 pb-3 border-b border-border">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 flex-1 max-w-50" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Kitchen Partners</CardTitle>
              <p className="text-sm text-muted-foreground">Manage all registered kitchen partners</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, status, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-search-bar border-none rounded-xl text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {search ? "No kitchen partners match your search" : "No kitchen partners yet"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kitchen Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Cuisines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {k.phoneNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-50">
                        {k.cuisines && k.cuisines.length > 0 ? (
                          k.cuisines.slice(0, 2).map((c: { id: string; name: string }) => (
                            <span key={c.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {k.cuisines && k.cuisines.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{k.cuisines.length - 2}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => { setCuisineEditTarget(k); setSelectedCuisineIds(k.cuisines?.map((c: { id: string }) => c.id) ?? []) }}
                          className="ml-1 text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[k.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {k.status === "PENDINGAPPROVAL" ? "Pending" : k.status.charAt(0) + k.status.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>{k.orders}</TableCell>
                    <TableCell>₹{k.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(k)}
                        disabled={!k.kyc}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View bank details</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(k.status === "PENDINGAPPROVAL" || k.status === "SUSPENDED") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(k.id, "ACTIVE")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === k.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === k.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                          </Button>
                        )}
                        {k.status !== "SUSPENDED" && k.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(k.id, "SUSPENDED")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === k.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === k.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4 text-red-600" />}
                          </Button>
                        )}
                        {(k.status === "PENDINGAPPROVAL" || k.status === "APPROVED" || k.status === "ACTIVE") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(k.id, "REJECTED")}
                            disabled={actionMutation.isPending && actionMutation.variables?.id === k.id}
                          >
                            {actionMutation.isPending && actionMutation.variables?.id === k.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 text-gray-500" />}
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
                  <p className="text-muted-foreground text-xs">GPay Number</p>
                  <p className="font-medium">{selected.kyc.gpayNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone (KYC)</p>
                  <p className="font-medium">{selected.kyc.phoneNumber ?? "—"}</p>
                </div>

              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Aadhaar: {selected.kyc.aadhaarVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No KYC details submitted yet.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cuisineEditTarget} onOpenChange={(open) => { if (!open) setCuisineEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cuisines — {cuisineEditTarget?.name}</DialogTitle>
            <DialogDescription>Select the cuisine types for this kitchen</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No cuisines available. Add them in CMS first.</p>
              ) : (
                categories.filter((c) => c.isActive).map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedCuisineIds.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        setSelectedCuisineIds(checked
                          ? [...selectedCuisineIds, cat.id]
                          : selectedCuisineIds.filter((id) => id !== cat.id)
                        )
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.description ?? cat.name}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setCuisineEditTarget(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!cuisineEditTarget) return
                cuisineMutation.mutate({ kitchenId: cuisineEditTarget.id, categoryIds: selectedCuisineIds })
              }}
              disabled={cuisineMutation.isPending}
            >
              {cuisineMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
