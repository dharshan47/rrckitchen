"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { useForm, useWatch, UseFormReturn, type Resolver } from "react-hook-form"
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
  getAllCoupons,
  getSimpleKitchenPartners,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
} from "@/actions/admin/admin-coupons"

interface CouponData {
  id: string
  code: string
  description: string | null
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount: number | null
  minOrderValue: number | null
  scope: "PLATFORM" | "KITCHEN_SPECIFIC"
  kitchenPartnerId: string | null
  kitchenName: string | null
  validFrom: string
  validTo: string
  usageLimitTotal: number | null
  usageLimitPerUser: number | null
  isActive: boolean
  redemptionCount: number
  createdAt: string
}

interface KitchenOption {
  id: string
  name: string
}

const couponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable(),
  discountType: z.enum(["FLAT", "PERCENTAGE"]),
  discountValue: z.coerce.number().positive("Value must be positive"),
  maxDiscount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive("Max discount must be positive").nullable(),
  ),
  minOrderValue: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().nonnegative("Min order must be 0 or more").nullable(),
  ),
  scope: z.enum(["PLATFORM", "KITCHEN_SPECIFIC"]),
  kitchenPartnerId: z.string().nullable(),
  validFrom: z.string().min(1, "Valid from is required"),
  validTo: z.string().min(1, "Valid to is required"),
  usageLimitTotal: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive("Must be positive").nullable(),
  ),
  usageLimitPerUser: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive("Must be positive").nullable(),
  ),
  isActive: z.boolean(),
})

type CouponForm = {
  code: string
  description: string | null
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount: number | null
  minOrderValue: number | null
  scope: "PLATFORM" | "KITCHEN_SPECIFIC"
  kitchenPartnerId: string | null
  validFrom: string
  validTo: string
  usageLimitTotal: number | null
  usageLimitPerUser: number | null
  isActive: boolean
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
  kitchens,
  showKitchenSelect,
}: {
  form: UseFormReturn<CouponForm>
  kitchens: KitchenOption[]
  showKitchenSelect: boolean
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          placeholder="e.g. FLAT50"
          className="uppercase"
          {...form.register("code")}
        />
        {form.formState.errors.code && (
          <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          placeholder="Offer description shown to users"
          {...form.register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <p className="text-xs text-muted-foreground">Maximum discount amount for percentage coupons</p>
          {form.formState.errors.maxDiscount && (
            <p className="text-xs text-destructive">{form.formState.errors.maxDiscount.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="scope">Scope</Label>
          <Select
            value={form.watch("scope")}
            onValueChange={(v) => form.setValue("scope", v as "PLATFORM" | "KITCHEN_SPECIFIC", { shouldValidate: true })}
          >
            <SelectTrigger id="scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLATFORM">Platform</SelectItem>
              <SelectItem value="KITCHEN_SPECIFIC">Kitchen Specific</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showKitchenSelect && (
        <div className="grid gap-2">
          <Label htmlFor="kitchenPartnerId">Kitchen Partner</Label>
          <Select
            value={form.watch("kitchenPartnerId") ?? ""}
            onValueChange={(v) => form.setValue("kitchenPartnerId", v || null, { shouldValidate: true })}
          >
            <SelectTrigger id="kitchenPartnerId">
              <SelectValue placeholder="Select kitchen..." />
            </SelectTrigger>
            <SelectContent>
              {kitchens.map((k) => (
                <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.kitchenPartnerId && (
            <p className="text-xs text-destructive">{form.formState.errors.kitchenPartnerId.message}</p>
          )}
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="usageLimitTotal">Usage Limit (Total)</Label>
          <Input
            id="usageLimitTotal"
            type="number"
            placeholder="Unlimited"
            {...form.register("usageLimitTotal")}
          />
          <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
          {form.formState.errors.usageLimitTotal && (
            <p className="text-xs text-destructive">{form.formState.errors.usageLimitTotal.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usageLimitPerUser">Per User Limit</Label>
          <Input
            id="usageLimitPerUser"
            type="number"
            placeholder="1"
            {...form.register("usageLimitPerUser")}
          />
          {form.formState.errors.usageLimitPerUser && (
            <p className="text-xs text-destructive">{form.formState.errors.usageLimitPerUser.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="coupon-active"
          checked={form.watch("isActive")}
          onCheckedChange={(v) => form.setValue("isActive", v, { shouldValidate: true })}
        />
        <Label htmlFor="coupon-active" className="text-sm font-normal">Active</Label>
      </div>
    </>
  )
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createForm = useForm<CouponForm>({
    resolver: zodResolver(couponSchema) as unknown as Resolver<CouponForm>,
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscount: null,
      minOrderValue: null,
      scope: "PLATFORM",
      kitchenPartnerId: null,
      validFrom: "",
      validTo: "",
      usageLimitTotal: null,
      usageLimitPerUser: 1,
      isActive: true,
    },
  })

  const editForm = useForm<CouponForm>({
    resolver: zodResolver(couponSchema) as unknown as Resolver<CouponForm>,
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscount: null,
      minOrderValue: null,
      scope: "PLATFORM",
      kitchenPartnerId: null,
      validFrom: "",
      validTo: "",
      usageLimitTotal: null,
      usageLimitPerUser: 1,
      isActive: true,
    },
  })

  const createScope = useWatch({ control: createForm.control, name: "scope" })
  const editScope = useWatch({ control: editForm.control, name: "scope" })

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: getAllCoupons,
  })

  const { data: kitchens = [] } = useQuery({
    queryKey: ["admin-simple-kitchens"],
    queryFn: getSimpleKitchenPartners,
  })

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const editingItem = editingId ? coupons.find((c) => c.id === editingId) ?? null : null

  useEffect(() => {
    if (editingItem) {
      editForm.reset({
        code: editingItem.code,
        description: editingItem.description,
        discountType: editingItem.discountType,
        discountValue: editingItem.discountValue,
        maxDiscount: editingItem.maxDiscount,
        minOrderValue: editingItem.minOrderValue,
        scope: editingItem.scope,
        kitchenPartnerId: editingItem.kitchenPartnerId,
        validFrom: editingItem.validFrom.slice(0, 16),
        validTo: editingItem.validTo.slice(0, 16),
        usageLimitTotal: editingItem.usageLimitTotal,
        usageLimitPerUser: editingItem.usageLimitPerUser,
        isActive: editingItem.isActive,
      })
    }
  }, [editingItem, editForm])

  const createMutation = useMutation({
    mutationFn: (data: CouponForm) => createCoupon({ ...data, code: data.code.toUpperCase() }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Coupon created")
        setIsCreateOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
      } else {
        toast.error(result.error ?? "Failed to create")
      }
    },
    onError: () => toast.error("Failed to create coupon"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CouponForm }) =>
      updateCoupon(id, { ...data, code: data.code.toUpperCase() }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Coupon updated")
        setEditingId(null)
        queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update coupon"),
  })

  const onCreate = createForm.handleSubmit((data) => {
    createMutation.mutate(data)
  })

  const onSave = editForm.handleSubmit((data) => {
    if (!editingId) return
    updateMutation.mutate({ id: editingId, data })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Coupon deleted")
        queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
      } else {
        toast.error(result.error ?? "Failed to delete")
      }
    },
    onError: () => toast.error("Failed to delete coupon"),
  })

  const handleEdit = (item: CouponData) => {
    setEditingId(item.id)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this coupon?")) return
    deleteMutation.mutate(id)
  }

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCouponActive(id, isActive),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Coupon status updated")
        queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
      } else {
        toast.error(result.error ?? "Failed to update status")
      }
    },
    onError: () => toast.error("Failed to update coupon status"),
  })

  const handleToggleActive = (id: string, current: boolean) => {
    toggleMutation.mutate({ id, isActive: !current })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Coupons & Offers</CardTitle>
          <Button
            onClick={() => {
              createForm.reset()
              setIsCreateOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Coupon
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="flex gap-4 pb-3 border-b border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No coupons found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                    <TableCell>
                      <DiscountBadge type={coupon.discountType} value={coupon.discountValue} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.scope === "KITCHEN_SPECIFIC" ? (
                        <span className="text-xs">{coupon.kitchenName ?? "—"}</span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Platform</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(coupon.validFrom).toLocaleDateString()}
                      {" → "}
                      {new Date(coupon.validTo).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{coupon.redemptionCount}</TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon.id, coupon.isActive)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(coupon.id)}>
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
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Add a new coupon or offer code.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-4">
            <FormFields form={createForm} kitchens={kitchens} showKitchenSelect={createScope === "KITCHEN_SPECIFIC"} />
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
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon or offer details.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={onSave} className="space-y-4">
              <FormFields form={editForm} kitchens={kitchens} showKitchenSelect={editScope === "KITCHEN_SPECIFIC"} />
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
