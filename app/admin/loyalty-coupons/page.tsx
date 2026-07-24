"use client"

/* eslint-disable react-hooks/incompatible-library */
import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Coins, ToggleLeft, ToggleRight } from "lucide-react"
import type { DiscountType } from "@/lib/generated/prisma/client"
import { toast } from "sonner"
import {
  getAllLoyaltyCoupons,
  createLoyaltyCoupon,
  updateLoyaltyCoupon,
  deleteLoyaltyCoupon,
  toggleLoyaltyCouponActive,
} from "@/actions/loyalty/loyalty-coupons"

interface FormData {
  name: string
  description: string
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: string
  maxDiscount: string
  minOrderValue: string
  pointsCost: string
}

export default function AdminLoyaltyCouponsPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { name: "", description: "", discountType: "FLAT", discountValue: "", maxDiscount: "", minOrderValue: "", pointsCost: "" },
  })

  const discountType = watch("discountType")

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-loyalty-coupons"],
    queryFn: getAllLoyaltyCoupons,
  })

  const createMutation = useMutation({
    mutationFn: createLoyaltyCoupon,
    onSuccess: () => {
      toast.success("Loyalty coupon created")
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-coupons"] })
      setDialogOpen(false)
      reset()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateLoyaltyCoupon>[1] }) =>
      updateLoyaltyCoupon(id, data),
    onSuccess: () => {
      toast.success("Loyalty coupon updated")
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-coupons"] })
      setDialogOpen(false)
      setEditingId(null)
      reset()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLoyaltyCoupon,
    onSuccess: () => {
      toast.success("Loyalty coupon deleted")
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-coupons"] })
    },
    onError: () => toast.error("Failed to delete"),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleLoyaltyCouponActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-coupons"] })
    },
    onError: () => toast.error("Failed to toggle"),
  })

  const openCreate = useCallback(() => {
    setEditingId(null)
    reset({ name: "", description: "", discountType: "FLAT", discountValue: "", maxDiscount: "", minOrderValue: "", pointsCost: "" })
    setDialogOpen(true)
  }, [reset])

  const openEdit = useCallback((coupon: { id: string; name: string; description: string | null; discountType: string; discountValue: number; maxDiscount: number | null; minOrderValue: number | null; pointsCost: number }) => {
    setEditingId(coupon.id)
    setValue("name", coupon.name)
    setValue("description", coupon.description ?? "")
    setValue("discountType", coupon.discountType as "FLAT" | "PERCENTAGE")
    setValue("discountValue", String(coupon.discountValue))
    setValue("maxDiscount", coupon.maxDiscount ? String(coupon.maxDiscount) : "")
    setValue("minOrderValue", coupon.minOrderValue ? String(coupon.minOrderValue) : "")
    setValue("pointsCost", String(coupon.pointsCost))
    setDialogOpen(true)
  }, [setValue])

  const onSubmit = useCallback((formData: FormData) => {
    const data = {
      name: formData.name,
      description: formData.description || undefined,
      discountType: formData.discountType as DiscountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      pointsCost: parseInt(formData.pointsCost) || 0,
    }
    if (!data.name) { toast.error("Name is required"); return }
    if (data.discountValue <= 0) { toast.error("Discount value must be positive"); return }
    if (data.pointsCost <= 0) { toast.error("Points cost must be positive"); return }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }, [editingId, createMutation, updateMutation])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div><Skeleton className="h-6 w-48 mb-1" /><Skeleton className="h-4 w-72" /></div>
        <Card><CardContent className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4"><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /></div>
          ))}
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Loyalty Coupons</h1>
          <p className="text-sm text-muted-foreground">Coupon templates customers can buy with loyalty points</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No loyalty coupons yet
                  </TableCell>
                </TableRow>
              ) : coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="font-medium">{coupon.name}</div>
                    {coupon.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-64">{coupon.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                      {coupon.maxDiscount && coupon.discountType === "PERCENTAGE" ? ` (max ₹${coupon.maxDiscount})` : ""}
                    </Badge>
                    {coupon.minOrderValue && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">Min ₹{coupon.minOrderValue}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {coupon.pointsCost}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(coupon)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this loyalty coupon?")) deleteMutation.mutate(coupon.id)
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingId(null) } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Loyalty Coupon" : "Create Loyalty Coupon"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the coupon template details" : "Add a new coupon template customers can purchase with loyalty points"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Coupon Name *</Label>
              <Input id="name" placeholder="e.g. ₹50 Off" {...register("name")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional description" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setValue("discountType", v as "FLAT" | "PERCENTAGE")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountValue">{discountType === "PERCENTAGE" ? "Discount (%) *" : "Discount (₹) *"}</Label>
                <Input id="discountValue" type="number" step="0.01" min="0" {...register("discountValue")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount">Max Discount (₹) — optional</Label>
                <Input id="maxDiscount" type="number" step="0.01" min="0" {...register("maxDiscount")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrderValue">Min Order (₹) — optional</Label>
                <Input id="minOrderValue" type="number" step="0.01" min="0" {...register("minOrderValue")} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pointsCost">Points Cost *</Label>
              <Input id="pointsCost" type="number" min="1" {...register("pointsCost")} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingId(null) }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
