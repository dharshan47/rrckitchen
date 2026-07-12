/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Pencil, Trash2, ImageIcon, Upload, X, Loader2, Tag } from "lucide-react"
import { useForm } from "react-hook-form"
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
import { Spinner } from "@/components/ui/spinner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
import { toast } from "sonner"
import { getAllMenuItems, updateMenuItem, addMenuItemPhoto, deleteMenuItemPhoto, deleteMenuItem } from "@/actions/admin/admin-menu"

interface MenuItemData {
  id: string
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  foodType: string
  timeSlot: string
  isAvailable: boolean
  photos: { id: string; imageUrl: string }[]
  menuName: string
  kitchenName: string
  createdAt: Date
}

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive("MRP must be positive").nullable(),
  ),
  foodType: z.enum(["VEG", "NONVEG"]),
  timeSlot: z.enum(["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"]),
  isAvailable: z.boolean(),
})

type MenuItemForm = z.infer<typeof menuItemSchema>

function FoodTypeBadge({ type }: { type: string }) {
  const isVeg = type === "VEG"
  return (
    <Badge variant={isVeg ? "secondary" : "destructive"} className={isVeg ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
      {isVeg ? "Veg" : "Non-Veg"}
    </Badge>
  )
}

const timeSlotLabels: Record<string, string> = {
  MORNING: "Breakfast",
  LUNCH: "Lunch",
  EVENINGSNACKS: "Snacks",
  DINNER: "Dinner",
}

export default function AdminMenuPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      foodType: "VEG",
      timeSlot: "MORNING",
      isAvailable: true,
    },
  })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: getAllMenuItems,
    refetchInterval: 30_000,
  })

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.kitchenName.toLowerCase().includes(search.toLowerCase())
  )

  const editingItem = editingId ? items.find((i) => i.id === editingId) ?? null : null

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        compareAtPrice: editingItem.compareAtPrice,
        foodType: editingItem.foodType as "VEG" | "NONVEG",
        timeSlot: editingItem.timeSlot as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER",
        isAvailable: editingItem.isAvailable,
      })
    }
  }, [editingItem, form])

  const handleEdit = (item: MenuItemData) => {
    setEditingId(item.id)
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuItemForm }) =>
      updateMenuItem(id, {
        name: data.name,
        description: data.description ?? "",
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        foodType: data.foodType,
        timeSlot: data.timeSlot,
        isAvailable: data.isAvailable,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item updated")
        setEditingId(null)
        queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update menu item"),
  })

  const onSave = form.handleSubmit((data) => {
    if (!editingId) return
    saveMutation.mutate({ id: editingId, data })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item deleted")
        queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      } else {
        toast.error(result.error ?? "Failed to delete")
      }
    },
    onError: () => toast.error("Failed to delete menu item"),
  })

  const handleDelete = (id: string) => {
    if (!confirm("Delete this menu item?")) return
    deleteMutation.mutate(id)
  }

  const addPhotoMutation = useMutation({
    mutationFn: ({ id, url, publicId }: { id: string; url: string; publicId?: string }) =>
      addMenuItemPhoto(id, url, publicId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Image added")
        queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      } else {
        toast.error(result.error ?? "Failed to add image")
      }
    },
    onError: () => toast.error("Failed to add image"),
  })

  const handleAddPhoto = (info: { secure_url: string; public_id: string }) => {
    if (!editingId) return
    addPhotoMutation.mutate({ id: editingId, url: info.secure_url, publicId: info.public_id })
  }

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => deleteMenuItemPhoto(photoId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Image removed")
        queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      } else {
        toast.error(result.error ?? "Failed to remove image")
      }
    },
    onError: () => toast.error("Failed to remove image"),
  })

  const handleDeletePhoto = (photoId: string) => {
    deletePhotoMutation.mutate(photoId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or kitchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No menu items found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Kitchen</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden relative">
                        {item.photos[0]?.imageUrl ? (
                          <Image src={item.photos[0].imageUrl} alt="" fill className="object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.kitchenName}</TableCell>
                    <TableCell><FoodTypeBadge type={item.foodType} /></TableCell>
                    <TableCell className="text-sm">{timeSlotLabels[item.timeSlot] ?? item.timeSlot}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      {item.compareAtPrice ? (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                          MRP ₹{item.compareAtPrice}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.isAvailable ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
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

      <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) setEditingId(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update details, price, offer, or manage images.</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={onSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" {...form.register("description")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" {...form.register("price")} />
                  {form.formState.errors.price && (
                    <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mrp" className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-green-600" />
                    MRP / Compare At (₹)
                  </Label>
                  <Input
                    id="mrp"
                    type="number"
                    placeholder="Original price"
                    {...form.register("compareAtPrice")}
                  />
                  {form.formState.errors.compareAtPrice && (
                    <p className="text-xs text-destructive">{form.formState.errors.compareAtPrice.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Set higher than price to show discount</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="foodType">Food Type</Label>
                  <Select
                    value={form.getValues("foodType")}
                    onValueChange={(v) => form.setValue("foodType", v as "VEG" | "NONVEG", { shouldValidate: true })}
                  >
                    <SelectTrigger id="foodType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VEG">Veg</SelectItem>
                      <SelectItem value="NONVEG">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.foodType && (
                    <p className="text-xs text-destructive">{form.formState.errors.foodType.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select
                    value={form.watch("timeSlot")}
                    onValueChange={(v) => form.setValue("timeSlot", v as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER", { shouldValidate: true })}
                  >
                    <SelectTrigger id="timeSlot">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Breakfast</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="EVENINGSNACKS">Snacks</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.timeSlot && (
                    <p className="text-xs text-destructive">{form.formState.errors.timeSlot.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-available"
                  checked={form.watch("isAvailable")}
                  onCheckedChange={(v) => form.setValue("isAvailable", v, { shouldValidate: true })}
                />
                <Label htmlFor="edit-available" className="text-sm font-normal">Available</Label>
              </div>

              <div className="grid gap-2">
                <Label>Images ({editingItem.photos.length})</Label>
                {editingItem.photos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editingItem.photos.map((photo) => (
                      <div key={photo.id || photo.imageUrl} className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden border group">
                        <Image src={photo.imageUrl} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    No images yet
                  </div>
                )}
                <CloudinaryUpload onUpload={handleAddPhoto}>
                  {({ uploading: isUploading, startUpload, cancelUpload }) => (
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={startUpload}
                        disabled={isUploading || addPhotoMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        {(isUploading || addPhotoMutation.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploading ? "Uploading..." : "Add Image"}
                      </button>
                      {isUploading && (
                        <button
                          type="button"
                          onClick={cancelUpload}
                          className="inline-flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </CloudinaryUpload>
              </div>

              {form.watch("compareAtPrice") && form.watch("compareAtPrice")! > form.watch("price") && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  <strong>Offer active:</strong> ₹{form.watch("price")} (save ₹{form.watch("compareAtPrice")! - form.watch("price")})
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
