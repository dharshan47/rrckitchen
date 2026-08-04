"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2, Plus, Eye, Utensils, Calendar, Leaf, Drumstick, Search, CheckCircle2, XCircle, Sun, Moon, CloudSun, Sunset, ImageIcon, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { addKitchenMenuItem, toggleMenuItemAvailability, setKitchenAvailability } from "@/actions/admin/dashboard"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"

const categories = [
  { value: "south-indian", label: "South Indian" },
  { value: "north-indian", label: "North Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "continental", label: "Continental" },
  { value: "snacks", label: "Snacks" },
  { value: "beverages", label: "Beverages" },
  { value: "desserts", label: "Desserts" },
  { value: "juices", label: "Juices" },
  { value: "chat", label: "Chat" },
  { value: "others", label: "Others" },
]

const menuItemSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  category: z.string().min(1, "Category is required"),
  foodType: z.enum(["veg", "nonveg"]),
  timeSlot: z.string().min(1, "Time slot is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  isAvailable: z.boolean(),
  availableFor: z.enum(["TODAY", "TOMORROW", "BOTH"]),
  images: z.array(z.object({ secure_url: z.string(), public_id: z.string() })),
})

type MenuItemFormData = z.infer<typeof menuItemSchema>

type MenuItemRow = {
  id: string
  name: string
  price: number
  description?: string | null
  foodType?: string | null
  timeSlot?: string | null
  isAvailable: boolean
  availableFor?: string | null
  menuName?: string | null
  image?: string | null
}

function MenuForm() {
  const queryClient = useQueryClient()

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      category: "",
      foodType: "veg",
      timeSlot: "",
      price: undefined,
      description: "",
      isAvailable: true,
      availableFor: "TOMORROW",
      images: [],
    },
  })

  const images = form.watch("images")
  const foodType = form.watch("foodType")

  const removeImage = (publicId: string) => {
    const current = form.getValues("images")
    form.setValue("images", current.filter((img) => img.public_id !== publicId), { shouldValidate: true })
  }

  const addMutation = useMutation({
    mutationFn: (data: MenuItemFormData) => {
      const formData = new FormData()
      formData.set("name", data.name)
      formData.set("category", data.category)
      formData.set("foodType", data.foodType)
      formData.set("timeSlot", data.timeSlot)
      formData.set("price", String(data.price))
      formData.set("description", data.description ?? "")
      formData.set("isAvailable", String(data.isAvailable))
      formData.set("availableFor", "TOMORROW")
      if (data.images.length > 0) {
        formData.set("images", JSON.stringify(data.images))
      }
      return addKitchenMenuItem(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item added successfully")
        form.reset({
          name: "",
          category: "",
          foodType: "veg",
          timeSlot: "",
          price: 0,
          description: "",
          isAvailable: true,
          availableFor: "TOMORROW",
          images: [],
        })
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to add item")
      }
    },
    onError: () => {
      toast.error("Something went wrong")
    },
  })

  return (
    <Card id="menu-form" className="rounded-2xl border-none shadow-sm overflow-hidden h-fit">
      <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-2 border-b border-gray-50 bg-white">
        <Utensils className="h-5 w-5 text-green-600" />
        <CardTitle className="text-[16px] font-bold text-gray-900">Add New Menu Item</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-6 bg-white">
        <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Food Name */}
            <div className="grid gap-2">
              <Label htmlFor="foodName" className="text-[13px] font-bold text-gray-700">Food Name <span className="text-red-500">*</span></Label>
              <Input 
                id="foodName" 
                {...form.register("name")} 
                placeholder="Enter dish name" 
                className="h-11 rounded-xl border-gray-200 text-[13px]"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-bold text-gray-700">Category <span className="text-red-500">*</span></Label>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200 text-[13px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>

            {/* Veg / Non-Veg */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-bold text-gray-700">Veg / Non-Veg <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 h-11 rounded-xl font-bold text-[13px] transition-all border-2 ${
                    foodType === "veg" 
                      ? "border-green-600 bg-green-50 text-green-700" 
                      : "border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => form.setValue("foodType", "veg", { shouldValidate: true })}
                >
                  <Leaf className={`h-4 w-4 mr-2 ${foodType === "veg" ? "text-green-600" : "text-gray-400"}`} /> Veg
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 h-11 rounded-xl font-bold text-[13px] transition-all border-2 ${
                    foodType === "nonveg" 
                      ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]" 
                      : "border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => form.setValue("foodType", "nonveg", { shouldValidate: true })}
                >
                  <Drumstick className={`h-4 w-4 mr-2 ${foodType === "nonveg" ? "text-[#FF6B00]" : "text-gray-400"}`} /> Non-Veg
                </Button>
              </div>
            </div>

            {/* Time Slot */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-bold text-gray-700">Time Slot <span className="text-red-500">*</span></Label>
              <Select value={form.watch("timeSlot")} onValueChange={(v) => form.setValue("timeSlot", v, { shouldValidate: true })}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200 text-[13px]">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="eveningsnacks">Snacks</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.timeSlot && (
                <p className="text-xs text-red-500">{form.formState.errors.timeSlot.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-[13px] font-bold text-gray-700">Price (₹) <span className="text-red-500">*</span></Label>
              <Input 
                id="price" 
                type="number" 
                {...form.register("price", { valueAsNumber: true })} 
                placeholder="Enter price" 
                className="h-11 rounded-xl border-gray-200 text-[13px]"
              />
              {form.formState.errors.price && (
                <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

            {/* Available For */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-bold text-gray-700">Available For <span className="text-red-500">*</span></Label>
              <Select value="TOMORROW" disabled>
                <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 text-[13px] text-gray-500">
                  <SelectValue placeholder="Tomorrow (Pre-Orders)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOMORROW">Tomorrow (Pre-Orders)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-[13px] font-bold text-gray-700">Description</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              placeholder="Describe the dish, ingredients and special notes..." 
              className="min-h-[80px] rounded-xl border-gray-200 text-[13px] resize-none"
            />
          </div>

          {/* Images */}
          <div className="grid gap-2">
            <Label className="text-[13px] font-bold text-gray-700">Images (Max 5)</Label>
            <div className="flex flex-wrap gap-4 items-center bg-green-50/30 p-4 rounded-xl border-2 border-dashed border-green-200 min-h-[140px]">
              
              {/* Image Previews */}
              {images.map((img) => (
                <div key={img.public_id} className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-sm group">
                  <Image src={img.secure_url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.public_id)}
                    className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:text-red-500"
                  >
                    <X className="h-3 w-3 font-bold" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger - only show if less than 5 images */}
              {images.length < 5 && (
                <CloudinaryUpload
                  onUpload={(info) => {
                    const current = form.getValues("images")
                    form.setValue("images", [...current, { secure_url: info.secure_url, public_id: info.public_id }], { shouldValidate: true })
                  }}
                >
                  {({ uploading, startUpload }) => (
                    <button
                      type="button"
                      onClick={startUpload}
                      disabled={uploading}
                      className={`flex flex-col items-center justify-center gap-2 h-24 w-24 shrink-0 rounded-xl border-2 border-dashed transition-colors ${
                        images.length === 0 
                          ? "bg-transparent border-green-300 text-green-600 hover:bg-green-50 w-full sm:w-[240px]" 
                          : "bg-white border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                      ) : images.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <Upload className="h-6 w-6 mb-2" />
                          <span className="text-[13px] font-bold">Upload images of your dish</span>
                          <span className="text-[10px] text-gray-500 font-medium">JPG, PNG up to 5MB each</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Plus className="h-6 w-6 text-green-500 mb-1" />
                          <span className="text-[11px] font-bold">Add More</span>
                        </div>
                      )}
                    </button>
                  )}
                </CloudinaryUpload>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              className="bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold px-6 h-11 rounded-xl shadow-sm w-full sm:w-auto" 
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {addMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AvailabilityCard({ tomorrowAvail, onSetTomorrow }: { tomorrowAvail: boolean | null; onSetTomorrow: (v: boolean) => void }) {
  return (
    <Card className="rounded-2xl border-none shadow-sm h-fit sticky top-28 bg-white">
      <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-2 border-b border-gray-50">
        <Calendar className="h-5 w-5 text-green-600" />
        <div>
          <CardTitle className="text-[16px] font-bold text-gray-900 leading-tight">Kitchen Availability</CardTitle>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Set when your kitchen is accepting orders</p>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 py-6 space-y-6">
        {/* Tomorrow (Pre-Orders) */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[15px] font-bold text-gray-900 leading-tight">Tomorrow (Pre-Orders)</h4>
                <Badge className={`border-none px-2.5 py-1 text-[10px] font-bold shadow-sm ${
                  tomorrowAvail === true ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                }`}>
                  {tomorrowAvail === true ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Accept pre-orders for tomorrow</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={`flex-1 rounded-xl h-11 font-bold text-[13px] border-2 transition-all ${
                tomorrowAvail === true
                  ? "bg-white border-green-600 text-green-700 shadow-sm"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => onSetTomorrow(true)}
            >
              <CheckCircle2 className={`h-4 w-4 mr-1.5 ${tomorrowAvail === true ? "text-green-600" : "text-gray-400"}`} /> Available
            </Button>
            <Button
              variant="outline"
              className={`flex-1 rounded-xl h-11 font-bold text-[13px] border-2 transition-all ${
                tomorrowAvail === false
                  ? "bg-white border-red-500 text-red-600 shadow-sm"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-red-500 hover:border-red-200"
              }`}
              onClick={() => onSetTomorrow(false)}
            >
              <XCircle className={`h-4 w-4 mr-1.5 ${tomorrowAvail === false ? "text-red-500" : "text-gray-400"}`} /> Unavailable
            </Button>
          </div>
        </div>
        
        {/* Tip Box */}
        <div className="bg-[#F0FDF4] rounded-xl p-4 flex gap-3 border border-[#DCFCE7]">
          <Utensils className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#166534] font-medium leading-relaxed">
            <span className="font-bold">Tip:</span> Keep your availability updated to receive more orders and grow your business.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeSlotIcon(slot: string) {
  const s = slot.toLowerCase()
  if (s.includes("morning") || s.includes("breakfast")) return <Sun className="h-4 w-4 text-orange-500" />
  if (s.includes("lunch")) return <CloudSun className="h-4 w-4 text-amber-500" />
  if (s.includes("dinner") || s.includes("evening")) return <Moon className="h-4 w-4 text-indigo-500" />
  return <Sunset className="h-4 w-4 text-orange-500" />
}

function getTimeSlotName(slot: string) {
  const s = slot.toLowerCase()
  if (s.includes("morning") || s.includes("breakfast")) return "Breakfast"
  if (s.includes("lunch")) return "Lunch"
  if (s.includes("dinner")) return "Dinner"
  if (s.includes("evening") || s.includes("snacks")) return "Snacks"
  return slot
}

export default function MenuPageClient() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [slotFilter, setSlotFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sorting, setSorting] = useState<SortingState>([])

  const data = useKitchenDashboardData()

  const menuItems = useMemo<MenuItemRow[]>(() => data?.menuItems ?? [], [data])
  const tomorrowAvail = data?.tomorrowAvailability
  const isAvailableTomorrow = tomorrowAvail?.isAvailable ?? null

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return menuItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.menuName || "").toLowerCase().includes(q)
      const matchesSlot =
        slotFilter === "all" || (item.timeSlot || "").toLowerCase().includes(slotFilter.toLowerCase())
      return matchesSearch && matchesSlot
    })
  }, [menuItems, search, slotFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("…")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("…")
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, currentPage])

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p)
  }

  const availableForLabel = (v?: string | null) => {
    if (v === "TODAY") return "Today"
    if (v === "TOMORROW") return "Tomorrow"
    return "Today & Tomorrow"
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      toggleMenuItemAvailability(itemId, isAvailable),
    onSuccess: (result, vars) => {
      if (result.success) {
        toast.success(`Item marked as ${vars.isAvailable ? "Available" : "Unavailable"}`)
        refresh()
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update"),
  })

  const availMutation = useMutation({
    mutationFn: (isAvailable: boolean) => setKitchenAvailability(isAvailable, "TOMORROW"),
    onSuccess: (result, vars) => {
      if (result.success) {
        toast.success(`Kitchen marked as ${vars ? "Available" : "Unavailable"} for tomorrow`)
        refresh()
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Failed to update"),
  })

  const scrollToForm = () => {
    document.getElementById("menu-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const columns = useMemo<ColumnDef<MenuItemRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Food Name",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50 relative">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-[13px] text-gray-900">{item.name}</p>
                {item.description && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[160px]">{item.description}</p>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "menuName",
        header: "Menu",
        cell: ({ row }) => (
          <span className="text-[13px] font-medium text-gray-600">{row.original.menuName || "—"}</span>
        ),
      },
      {
        accessorKey: "foodType",
        header: "Type",
        cell: ({ row }) => {
          const isVeg = row.original.foodType === "VEG"
          return (
            <div className="flex items-center gap-1.5">
              {isVeg ? <Leaf className="h-4 w-4 text-green-600" /> : <Drumstick className="h-4 w-4 text-[#FF6B00]" />}
              <span className={`text-[12px] font-bold ${isVeg ? "text-green-700" : "text-[#FF6B00]"}`}>
                {isVeg ? "Veg" : "Non-Veg"}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "timeSlot",
        header: "Time Slot",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-gray-700 font-medium text-[13px]">
            {getTimeSlotIcon(row.original.timeSlot || "")}
            {getTimeSlotName(row.original.timeSlot || "")}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="text-[13px] font-bold text-gray-900">₹{row.original.price}</span>
        ),
      },
      {
        accessorKey: "availableFor",
        header: "Available For",
        cell: ({ row }) => (
          <Badge className="bg-purple-50 text-purple-600 border-none px-2.5 py-1 text-[11px] font-bold hover:bg-purple-50">
            {availableForLabel(row.original.availableFor)}
          </Badge>
        ),
      },
      {
        accessorKey: "isAvailable",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={`border-none px-2.5 py-1 text-[11px] font-bold ${
            row.original.isAvailable
              ? "bg-green-50 text-green-700 hover:bg-green-50"
              : "bg-red-50 text-red-600 hover:bg-red-50"
          }`}>
            {row.original.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="text-right">
              <Button
                size="sm"
                variant="outline"
                className={`h-8 px-3 rounded-lg text-[11px] font-bold transition-all border-2 ${
                  item.isAvailable
                    ? "border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                    : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-300"
                }`}
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate({ itemId: item.id, isAvailable: !item.isAvailable })}
              >
                {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
              </Button>
            </div>
          )
        },
      },
    ],
    [toggleMutation]
  )

  const table = useReactTable({
    data: filteredItems,
    columns,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex: currentPage - 1, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize })
          : updater
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize)
        setPage(1)
      } else {
        setPage(next.pageIndex + 1)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
  })

  if (!data) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-5 w-96 rounded mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="pb-4 pt-6 px-6 flex flex-row items-center gap-2 border-b border-gray-50">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
              <Skeleton className="h-[140px] w-full rounded-xl" />
              <div className="flex justify-end">
                <Skeleton className="h-11 w-36 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm h-fit sticky top-28">
            <div className="pb-4 pt-6 px-6 flex flex-row items-center gap-2 border-b border-gray-50">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-11 flex-1 rounded-xl" />
                  <Skeleton className="h-11 flex-1 rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="pb-4 pt-6 px-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-10 w-[140px] rounded-xl" />
            </div>
          </div>
          <div className="p-6 space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="flex items-center gap-3 w-[280px]">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-20 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Menu Management</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Add delicious items and manage your kitchen menu</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-green-200 text-green-700 bg-white hover:bg-green-50 font-bold px-4 h-11 rounded-xl shadow-sm transition-all hidden sm:flex" onClick={() => data.kitchen?.slug && router.push(`/kitchens/${data.kitchen.slug}`)}>
            <Eye className="h-4 w-4 mr-2" /> View Public Menu
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold px-4 h-11 rounded-xl shadow-sm transition-all" onClick={scrollToForm}>
            <Plus className="h-4 w-4 mr-2" /> Add Menu Item
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Form */}
        <MenuForm />

        {/* Right Column: Availability */}
        <AvailabilityCard 
          tomorrowAvail={isAvailableTomorrow} 
          onSetTomorrow={(v) => availMutation.mutate(v)} 
        />
      </div>

      {/* Current Menu Items */}
      <Card className="rounded-2xl border-none shadow-sm mt-2 overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 gap-4 bg-white">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-600" />
            <CardTitle className="text-[16px] font-bold text-gray-900">Current Menu Items</CardTitle>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-10 rounded-xl border-gray-100 bg-gray-50 text-[13px] font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-green-500"
              />
            </div>
            <Select value={slotFilter} onValueChange={(v) => { setSlotFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl border-gray-100 bg-white text-[13px] font-bold text-gray-700 shadow-sm focus:ring-1 focus:ring-green-500">
                <SelectValue placeholder="All Time Slots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time Slots</SelectItem>
                <SelectItem value="morning">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-white overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <Utensils className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-[14px] font-medium text-gray-500">
                {menuItems.length === 0 ? "No menu items added yet." : "No items match your search."}
              </p>
            </div>
          ) : (
            <Table className="w-full min-w-[800px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-bold text-[12px] text-gray-600 h-12 first:px-6 last:px-6"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1 hover:text-gray-900 ${
                              header.column.getCanSort() ? "cursor-pointer select-none" : "cursor-default"
                            } ${header.column.id === "actions" ? "w-full justify-end" : ""}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              )
                            )}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.id === "actions" ? "text-right px-6 py-4" : "px-6 py-4"}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-t border-gray-50 bg-white gap-4">
              <span className="text-[12px] font-medium text-gray-500">
                Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
                {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, filteredItems.length)} of{" "}
                {filteredItems.length} items
              </span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-400 bg-gray-50"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {pageNumbers.map((p, i) =>
                    p === "…" ? (
                      <span key={`e-${i}`} className="text-gray-400">...</span>
                    ) : (
                      <Button
                        key={p}
                        variant="outline"
                        className={`h-8 w-8 p-0 rounded-lg font-medium ${
                          p === currentPage
                            ? "border-green-200 text-green-700 bg-green-50 font-bold"
                            : "border-transparent text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[12px] font-medium text-gray-500">Rows per page:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => table.setPageSize(Number(v))}
                  >
                    <SelectTrigger className="w-[60px] h-8 rounded-lg border-gray-200 text-[12px] font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
