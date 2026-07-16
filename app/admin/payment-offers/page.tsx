/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getAllPaymentOffers,
  createPaymentOffer,
  updatePaymentOffer,
  deletePaymentOffer,
} from "@/actions/admin/admin-payment-offers"

interface PaymentOfferData {
  id: string
  name: string
  description: string | null
  offerType: "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL"
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount: number | null
  minOrderValue: number | null
  validFrom: string
  validTo: string
  isActive: boolean
  createdAt: string
}

const paymentOfferSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  offerType: z.enum(["UPI", "WALLET", "CARDS", "NETBANKING", "ALL"]),
  discountType: z.enum(["FLAT", "PERCENTAGE"]),
  discountValue: z.coerce.number().positive("Value must be positive"),
  maxDiscount: z.coerce.number().nonnegative().nullable().optional(),
  minOrderValue: z.coerce.number().nonnegative().nullable().optional(),
  validFrom: z.string().min(1, "Valid from is required"),
  validTo: z.string().min(1, "Valid to is required"),
  isActive: z.boolean(),
})

type PaymentOfferForm = {
  name: string
  description: string | null
  offerType: "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL"
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount: number | null | undefined
  minOrderValue: number | null | undefined
  validFrom: string
  validTo: string
  isActive: boolean
}

const offerTypeLabels: Record<string, string> = {
  UPI: "UPI",
  WALLET: "Wallet",
  CARDS: "Cards",
  NETBANKING: "NetBanking",
  ALL: "All Methods",
}

const offerTypeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  UPI: "default",
  WALLET: "secondary",
  CARDS: "outline",
  NETBANKING: "destructive",
  ALL: "default",
}

const paymentOfferDefaultValues: PaymentOfferForm = {
  name: "",
  description: "",
  offerType: "ALL",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxDiscount: null,
  minOrderValue: null,
  validFrom: "",
  validTo: "",
  isActive: true,
}

function DiscountBadge({ type, value }: { type: string; value: number }) {
  return (
    <Badge variant="outline" className="text-xs font-mono">
      {type === "FLAT" ? `₹${value}` : `${value}%`}
    </Badge>
  )
}

function FormFields({
  form,
}: {
  form: UseFormReturn<PaymentOfferForm>
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Offer Name</Label>
        <Input
          id="name"
          placeholder="e.g. UPI Offer, Card Discount"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          placeholder="e.g. Get 10% off on UPI payments"
          {...form.register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="offerType">Payment Method</Label>
          <Select
            value={form.watch("offerType")}
            onValueChange={(v) => form.setValue("offerType", v as PaymentOfferForm["offerType"], { shouldValidate: true })}
          >
            <SelectTrigger id="offerType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="WALLET">Wallet</SelectItem>
              <SelectItem value="CARDS">Credit / Debit Cards</SelectItem>
              <SelectItem value="NETBANKING">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select
            value={form.watch("discountType")}
            onValueChange={(v) => form.setValue("discountType", v as "FLAT" | "PERCENTAGE", { shouldValidate: true })}
          >
            <SelectTrigger id="discountType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FLAT">Flat (₹)</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="discountValue">
            {form.watch("discountType") === "FLAT" ? "Discount (₹)" : "Discount (%)"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            placeholder={form.watch("discountType") === "FLAT" ? "50" : "10"}
            {...form.register("discountValue")}
          />
          {form.formState.errors.discountValue && (
            <p className="text-xs text-destructive">{form.formState.errors.discountValue.message}</p>
          )}
        </div>
        {form.watch("discountType") === "PERCENTAGE" && (
          <div className="grid gap-2">
            <Label htmlFor="maxDiscount">Max Discount Cap (₹)</Label>
            <Input
              id="maxDiscount"
              type="number"
              placeholder="e.g. 100"
              {...form.register("maxDiscount")}
            />
            <p className="text-xs text-muted-foreground">Maximum discount for percentage offers</p>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="minOrderValue">Min Order Value (₹)</Label>
        <Input
          id="minOrderValue"
          type="number"
          placeholder="0"
          {...form.register("minOrderValue")}
        />
        {form.formState.errors.minOrderValue && (
          <p className="text-xs text-destructive">{form.formState.errors.minOrderValue.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="validFrom">Valid From</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...form.register("validFrom")}
          />
          {form.formState.errors.validFrom && (
            <p className="text-xs text-destructive">{form.formState.errors.validFrom.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="validTo">Valid To</Label>
          <Input
            id="validTo"
            type="datetime-local"
            {...form.register("validTo")}
          />
          {form.formState.errors.validTo && (
            <p className="text-xs text-destructive">{form.formState.errors.validTo.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="offer-active"
          checked={form.watch("isActive")}
          onCheckedChange={(v) => form.setValue("isActive", v, { shouldValidate: true })}
        />
        <Label htmlFor="offer-active" className="text-sm font-normal">Active</Label>
      </div>
    </>
  )
}

export default function AdminPaymentOffersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createForm = useForm<PaymentOfferForm>({
    resolver: zodResolver(paymentOfferSchema) as any,
    defaultValues: paymentOfferDefaultValues,
  })

  const editForm = useForm<PaymentOfferForm>({
    resolver: zodResolver(paymentOfferSchema) as any,
    defaultValues: paymentOfferDefaultValues,
  })

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["admin-payment-offers"],
    queryFn: getAllPaymentOffers,
  })

  const filtered = offers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.offerType.toLowerCase().includes(search.toLowerCase())
  )

  const editingItem = editingId ? offers.find((o) => o.id === editingId) ?? null : null

  useEffect(() => {
    if (editingItem) {
      editForm.reset({
        name: editingItem.name,
        description: editingItem.description,
        offerType: editingItem.offerType,
        discountType: editingItem.discountType,
        discountValue: editingItem.discountValue,
        maxDiscount: editingItem.maxDiscount,
        minOrderValue: editingItem.minOrderValue,
        validFrom: editingItem.validFrom.slice(0, 16),
        validTo: editingItem.validTo.slice(0, 16),
        isActive: editingItem.isActive,
      })
    }
  }, [editingItem, editForm])

  const handleEdit = (item: PaymentOfferData) => {
    setEditingId(item.id)
  }

  const createMutation = useMutation({
    mutationFn: (data: PaymentOfferForm) =>
      createPaymentOffer({
        ...data,
        maxDiscount: data.maxDiscount || null,
        minOrderValue: data.minOrderValue || null,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Payment offer created")
        setIsCreateOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin-payment-offers"] })
      } else {
        toast.error(result.error ?? "Failed to create")
      }
    },
    onError: () => toast.error("Failed to create payment offer"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentOfferForm }) =>
      updatePaymentOffer(id, {
        ...data,
        maxDiscount: data.maxDiscount || null,
        minOrderValue: data.minOrderValue || null,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Payment offer updated")
        setEditingId(null)
        queryClient.invalidateQueries({ queryKey: ["admin-payment-offers"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update payment offer"),
  })

  const onCreate = createForm.handleSubmit((data) => {
    createMutation.mutate(data)
  })

  const onSave = editForm.handleSubmit((data) => {
    if (!editingId) return
    updateMutation.mutate({ id: editingId, data })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaymentOffer(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Payment offer deleted")
        queryClient.invalidateQueries({ queryKey: ["admin-payment-offers"] })
      } else {
        toast.error(result.error ?? "Failed to delete")
      }
    },
    onError: () => toast.error("Failed to delete payment offer"),
  })

  const handleDelete = (id: string) => {
    if (!confirm("Delete this payment offer?")) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Offers</CardTitle>
          <Button
            onClick={() => {
              createForm.reset()
              setIsCreateOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Offer
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="flex gap-4 pb-3 border-b border-border">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No payment offers found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>
                      <Badge variant={offerTypeVariants[offer.offerType] ?? "outline"}>
                        {offerTypeLabels[offer.offerType] ?? offer.offerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DiscountBadge type={offer.discountType} value={offer.discountValue} />
                      {offer.discountType === "PERCENTAGE" && offer.maxDiscount && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (up to ₹{offer.maxDiscount})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {offer.minOrderValue ? `₹${offer.minOrderValue}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(offer.validFrom).toLocaleDateString()}
                      {" → "}
                      {new Date(offer.validTo).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={offer.isActive}
                        onCheckedChange={async () => {
                          const result = await updatePaymentOffer(offer.id, { isActive: !offer.isActive })
                          if (result.success) {
                            toast.success("Status updated")
                            queryClient.invalidateQueries({ queryKey: ["admin-payment-offers"] })
                          } else {
                            toast.error(result.error ?? "Failed")
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(offer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(offer.id)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) setIsCreateOpen(false) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Offer</DialogTitle>
            <DialogDescription>Add a new payment method offer (e.g. UPI discount, Card offer).</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-4">
            <FormFields form={createForm} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) setEditingId(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Offer</DialogTitle>
            <DialogDescription>Update payment method offer details.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={onSave} className="space-y-4">
              <FormFields form={editForm} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
