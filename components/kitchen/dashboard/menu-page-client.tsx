"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus, Eye, Utensils, Calendar, Leaf, Drumstick, Search, CheckCircle2, XCircle, Sun, Moon, ImageIcon, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, CloudUpload, Send } from "lucide-react"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
    <Card id="menu-form" className="rounded-[12px] border border-[#E7E9EB] shadow-[0_1px_3px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.03)] bg-[#FFFFFF] overflow-hidden h-fit">
      <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-3 border-b border-[#E8EAEC] bg-[#FFFFFF]">
        <div className="h-[42px] w-[42px] rounded-full bg-[#EAF6ED] flex items-center justify-center shrink-0">
          <Utensils className="h-[20px] w-[20px] text-[#3D8B5A]" />
        </div>
        <CardTitle className="text-[16px] font-[600] text-[#202831]">Add New Menu Item</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-6 bg-[#FFFFFF]">
        <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Food Name */}
            <div className="grid gap-2">
              <Label htmlFor="foodName" className="text-[13px] font-[500] text-[#252D36]">Food Name <span className="text-[#E53935]">*</span></Label>
              <Input 
                id="foodName" 
                {...form.register("name")} 
                placeholder="Enter dish name" 
                className="h-[36px] rounded-[8px] border-[#E1E5E8] text-[#252D36] placeholder:text-[#8A939D] focus-visible:border-[#9BC8A8] focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(61,139,90,0.08)] text-[13px]"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-[#FF2B20]">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-[500] text-[#252D36]">Category <span className="text-[#E53935]">*</span></Label>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}>
                <SelectTrigger className="h-[36px] rounded-[8px] border-[#E1E5E8] text-[#252D36] focus:border-[#9BC8A8] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(61,139,90,0.08)] text-[13px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-[#FF2B20]">{form.formState.errors.category.message}</p>
              )}
            </div>

            {/* Veg / Non-Veg */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-[500] text-[#252D36]">Veg / Non-Veg <span className="text-[#E53935]">*</span></Label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 h-[36px] rounded-[8px] font-[500] text-[13px] transition-all border ${
                    foodType === "veg" 
                      ? "border-[#9BC8A8] bg-[#FFFFFF] text-[#3D8B5A]" 
                      : "border-[#E1E5E8] bg-[#FFFFFF] text-[#68727D] hover:bg-[#F3FAF4]"
                  }`}
                  onClick={() => form.setValue("foodType", "veg", { shouldValidate: true })}
                >
                  <Leaf className={`h-[16px] w-[16px] mr-2 ${foodType === "veg" ? "text-[#3D8B5A]" : "text-[#8A939D]"}`} /> Veg
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 h-[36px] rounded-[8px] font-[500] text-[13px] transition-all border ${
                    foodType === "nonveg" 
                      ? "border-[#FF9A78] bg-[#FFFFFF] text-[#FF4D00]" 
                      : "border-[#E1E5E8] bg-[#FFFFFF] text-[#68727D] hover:bg-[#FFF1EB]"
                  }`}
                  onClick={() => form.setValue("foodType", "nonveg", { shouldValidate: true })}
                >
                  <Drumstick className={`h-[16px] w-[16px] mr-2 ${foodType === "nonveg" ? "text-[#FF4D00]" : "text-[#8A939D]"}`} /> Non-Veg
                </Button>
              </div>
            </div>

            {/* Time Slot */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-[500] text-[#252D36]">Time Slot <span className="text-[#E53935]">*</span></Label>
              <Select value={form.watch("timeSlot")} onValueChange={(v) => form.setValue("timeSlot", v, { shouldValidate: true })}>
                <SelectTrigger className="h-[36px] rounded-[8px] border-[#E1E5E8] text-[#252D36] focus:border-[#9BC8A8] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(61,139,90,0.08)] text-[13px]">
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
                <p className="text-xs text-[#FF2B20]">{form.formState.errors.timeSlot.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-[13px] font-[500] text-[#252D36]">Price (₹) <span className="text-[#E53935]">*</span></Label>
              <Input 
                id="price" 
                type="number" 
                {...form.register("price", { valueAsNumber: true })} 
                placeholder="Enter price" 
                className="h-[36px] rounded-[8px] border-[#E1E5E8] text-[#252D36] placeholder:text-[#8A939D] focus-visible:border-[#9BC8A8] focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(61,139,90,0.08)] text-[13px]"
              />
              {form.formState.errors.price && (
                <p className="text-xs text-[#FF2B20]">{form.formState.errors.price.message}</p>
              )}
            </div>

            {/* Available For */}
            <div className="grid gap-2">
              <Label className="text-[13px] font-[500] text-[#252D36]">Available For <span className="text-[#E53935]">*</span></Label>
              <Select value="TOMORROW" disabled>
                <SelectTrigger className="h-[36px] rounded-[8px] border-[#E1E5E8] bg-[#FAFAFA] text-[#252D36] text-[13px]">
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
            <Label htmlFor="description" className="text-[13px] font-[500] text-[#252D36]">Description</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              placeholder="Describe the dish, ingredients and special notes..." 
              className="min-h-[80px] rounded-[8px] border-[#E1E5E8] text-[#252D36] placeholder:text-[#8A939D] focus-visible:border-[#9BC8A8] focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(61,139,90,0.08)] text-[13px] resize-none"
            />
          </div>

          {/* Images */}
          <div className="grid gap-2">
            <Label className="text-[13px] font-[500] text-[#252D36]">Images (Max 5)</Label>
            <div className="flex flex-wrap gap-4 items-center bg-[#FCFEFC] p-4 rounded-[8px] border border-dashed border-[#BFD8C5] min-h-[140px]">
              
              {/* Image Previews */}
              {images.map((img) => (
                <div key={img.public_id} className="relative h-24 w-24 shrink-0 rounded-[8px] overflow-hidden group">
                  <Image src={img.secure_url} alt="" fill sizes="96px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.public_id)}
                    className="absolute top-1 right-1 h-[18px] w-[18px] flex items-center justify-center rounded-full bg-[#4A4A4A] text-[#FFFFFF] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
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
                      className={`flex flex-col items-center justify-center gap-1 h-24 shrink-0 rounded-[8px] border border-dashed transition-colors ${
                        images.length === 0 
                          ? "bg-transparent border-[#BFD8C5] text-[#3D8B5A] hover:bg-[#EAF6ED] w-full sm:w-[240px]" 
                          : "bg-[#FCFEFC] border-[#C8DDD0] text-[#3D8B5A] hover:bg-[#EAF6ED] w-24"
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="h-[20px] w-[20px] animate-spin text-[#3D8B5A]" />
                      ) : images.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <div className="h-[42px] w-[42px] rounded-full bg-[#EAF6ED] flex items-center justify-center mb-2">
                            <CloudUpload className="h-[20px] w-[20px] text-[#3D8B5A]" />
                          </div>
                          <span className="text-[13px] font-[600]">Upload images of your dish</span>
                          <span className="text-[11px] text-[#8A939D] font-[400] mt-1">JPG, PNG up to 5MB each</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Plus className="h-[20px] w-[20px] text-[#3D8B5A] mb-1" />
                          <span className="text-[11px] font-[600]">Add More</span>
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
              className="bg-[#FF4D00] hover:bg-[#E94300] text-[#FFFFFF] font-[600] px-6 h-[36px] rounded-[8px] border border-[#FF4D00] shadow-[0_1px_3px_rgba(255,77,0,0.12)] w-full sm:w-auto transition-all" 
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 className="h-[16px] w-[16px] mr-2 animate-spin text-[#FFFFFF]" />
              ) : (
                <Send className="h-[16px] w-[16px] mr-2 text-[#FFFFFF]" />
              )}
              {addMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AvailabilityCard({ todayAvail, tomorrowAvail, onSetToday, onSetTomorrow }: { todayAvail: boolean | null; tomorrowAvail: boolean | null; onSetToday: (v: boolean) => void; onSetTomorrow: (v: boolean) => void }) {
  return (
    <Card className="rounded-[12px] border border-[#E7E9EB] shadow-[0_1px_3px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.03)] h-fit sticky top-28 bg-[#FFFFFF]">
      <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-3 border-b border-[#E8EAEC] bg-[#FFFFFF]">
        <div className="h-[42px] w-[42px] rounded-full bg-[#EEF8F0] flex items-center justify-center shrink-0">
          <Calendar className="h-[20px] w-[20px] text-[#3D8B5A]" />
        </div>
        <div>
          <CardTitle className="text-[16px] font-[600] text-[#202831] leading-tight">Kitchen Availability</CardTitle>
          <p className="text-[13px] text-[#68727D] mt-0.5">Set when your kitchen is accepting orders</p>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 py-6 space-y-6">
        {/* Tomorrow (Pre-Orders) */}
        <div className="space-y-5 pb-5 border-b border-[#E8EAEC]">
          <div className="flex items-center gap-3">
            <div className="h-[42px] w-[42px] bg-[#EEF8F0] text-[#3D8B5A] rounded-full flex items-center justify-center shrink-0">
              <Calendar className="h-[20px] w-[20px]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[15px] font-[600] text-[#18212B] leading-tight">Tomorrow (Pre-Orders)</h4>
                <Badge className={`border-none px-3 py-1 text-[11px] font-[600] rounded-[999px] shadow-none ${
                  tomorrowAvail === true ? "bg-[#EAF6ED] text-[#3D8B5A]" : "bg-[#FFF0EE] text-[#FF2B20]"
                }`}>
                  {tomorrowAvail === true ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <p className="text-[13px] text-[#68727D] mt-1">Accept pre-orders for tomorrow</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={`flex-1 rounded-[8px] h-[36px] font-[500] text-[13px] border transition-all ${
                tomorrowAvail === true
                  ? "bg-[#EAF6ED] border-[#9BC8A8] text-[#3D8B5A] shadow-none"
                  : "bg-[#FFFFFF] border-[#9BC8A8] text-[#3D8B5A] hover:bg-[#F3FAF4]"
              }`}
              onClick={() => onSetTomorrow(true)}
            >
              <CheckCircle2 className={`h-[16px] w-[16px] mr-1.5 ${tomorrowAvail === true ? "text-[#3D8B5A]" : "text-[#3D8B5A]"}`} /> Available
            </Button>
            <Button
              variant="outline"
              className={`flex-1 rounded-[8px] h-[36px] font-[500] text-[13px] border transition-all ${
                tomorrowAvail === false
                  ? "bg-[#FF2B20] border-[#FF2B20] text-[#FFFFFF] shadow-none"
                  : "bg-[#FFFFFF] border-[#FF7B73] text-[#FF2B20] hover:bg-[#FFF0EE]"
              }`}
              onClick={() => onSetTomorrow(false)}
            >
              <XCircle className={`h-[16px] w-[16px] mr-1.5 ${tomorrowAvail === false ? "text-[#FFFFFF]" : "text-[#FF2B20]"}`} /> Unavailable
            </Button>
          </div>
        </div>

        {/* Today */}
        <div className="space-y-5 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-[42px] w-[42px] bg-[#FFF0EE] text-[#FF2B20] rounded-full flex items-center justify-center shrink-0">
              <Calendar className="h-[20px] w-[20px]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[15px] font-[600] text-[#18212B] leading-tight">Today</h4>
                <Badge className={`border-none px-3 py-1 text-[11px] font-[600] rounded-[999px] shadow-none ${
                  todayAvail === true ? "bg-[#EAF6ED] text-[#3D8B5A]" : "bg-[#FFF0EE] text-[#FF2B20]"
                }`}>
                  {todayAvail === true ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <p className="text-[13px] text-[#68727D] mt-1">Accept orders for today</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onSetToday(true)}
              className={`flex-1 rounded-[8px] h-[36px] font-[500] text-[13px] border transition-all ${
                todayAvail === true
                  ? "bg-[#EAF6ED] border-[#9BC8A8] text-[#3D8B5A] shadow-none"
                  : "bg-[#FFFFFF] border-[#9BC8A8] text-[#3D8B5A] hover:bg-[#F3FAF4]"
              }`}
            >
              <CheckCircle2 className="h-[16px] w-[16px] mr-1.5 text-[#3D8B5A]" /> Available
            </Button>
            <Button
              variant="outline"
              onClick={() => onSetToday(false)}
              className={`flex-1 rounded-[8px] h-[36px] font-[500] text-[13px] border transition-all ${
                todayAvail === false
                  ? "bg-[#FF2B20] border-[#FF2B20] text-[#FFFFFF] shadow-none"
                  : "bg-[#FFFFFF] border-[#FF7B73] text-[#FF2B20] hover:bg-[#FFF0EE]"
              }`}
            >
              <XCircle className="h-[16px] w-[16px] mr-1.5 text-[#FF2B20]" /> Unavailable
            </Button>
          </div>
        </div>
        
        {/* Tip Box */}
        <div className="bg-[#F3FAF4] rounded-[8px] p-4 flex gap-3 border border-[#F3FAF4]">
          <div className="shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6FA477]"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          </div>
          <p className="text-[13px] text-[#5F8067] font-[400] leading-relaxed">
            <span className="font-[600]">Tip:</span> Keep your availability updated to receive more orders and grow your business.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeSlotIcon(slot: string) {
  const s = slot.toLowerCase()
  if (s.includes("morning") || s.includes("breakfast")) return <Sun className="h-[16px] w-[16px] text-[#FFAA22]" />
  if (s.includes("lunch")) return <Sun className="h-[16px] w-[16px] text-[#FFAA22]" />
  if (s.includes("dinner") || s.includes("evening")) return <Moon className="h-[16px] w-[16px] text-[#FF8B45]" />
  return <Sun className="h-[16px] w-[16px] text-[#FFAA22]" />
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
  const todayAvail = data?.todayAvailability
  const isAvailableTomorrow = tomorrowAvail?.isAvailable ?? null
  const isAvailableToday = todayAvail?.isAvailable ?? null

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
    return "Both"
  }

  const getAvailableForBadgeStyle = (v?: string | null) => {
    if (v === "TODAY") return "bg-[#EAF4FF] text-[#4285D4]"
    if (v === "TOMORROW") return "bg-[#F2E9FF] text-[#7C4DCE]"
    return "bg-[#EAF6ED] text-[#3D8B5A]"
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
    mutationFn: ({ isAvailable, dateType }: { isAvailable: boolean; dateType: "TODAY" | "TOMORROW" }) =>
      setKitchenAvailability(isAvailable, dateType),
    onSuccess: (result, vars) => {
      if (result.success) {
        toast.success(`Kitchen marked as ${vars.isAvailable ? "Available" : "Unavailable"} for ${vars.dateType === "TODAY" ? "today" : "tomorrow"}`)
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
              <div className="h-[40px] w-[48px] rounded-[7px] overflow-hidden bg-[#FFFFFF] shrink-0 relative">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#8A939D]">
                    <ImageIcon className="h-[20px] w-[20px]" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-[600] text-[13px] text-[#252D36]">{item.name}</p>
                {item.description && (
                  <p className="text-[11px] text-[#737C85] mt-0.5 truncate max-w-[160px]">{item.description}</p>
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
          <span className="text-[13px] text-[#68727D] font-[400]">{row.original.menuName || "—"}</span>
        ),
      },
      {
        accessorKey: "foodType",
        header: "Type",
        cell: ({ row }) => {
          const isVeg = row.original.foodType === "VEG"
          return (
            <div className="flex items-center gap-1.5">
              {isVeg ? <Leaf className="h-[16px] w-[16px] text-[#3D8B5A]" /> : <Drumstick className="h-[16px] w-[16px] text-[#FF4D00]" />}
              <span className={`text-[12px] font-[500] ${isVeg ? "text-[#3D8B5A]" : "text-[#FF4D00]"}`}>
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
          <div className="flex items-center gap-1.5 text-[#252D36] font-[400] text-[13px]">
            {getTimeSlotIcon(row.original.timeSlot || "")}
            {getTimeSlotName(row.original.timeSlot || "")}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="text-[13px] font-[400] text-[#252D36]">₹{row.original.price}</span>
        ),
      },
      {
        accessorKey: "availableFor",
        header: "Available For",
        cell: ({ row }) => (
          <Badge className={`border-none px-2.5 py-1 text-[11px] font-[500] rounded-full hover:opacity-100 ${getAvailableForBadgeStyle(row.original.availableFor)}`}>
            {availableForLabel(row.original.availableFor)}
          </Badge>
        ),
      },
      {
        accessorKey: "isAvailable",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={`border-none px-2.5 py-1 text-[11px] font-[500] rounded-full hover:opacity-100 ${
            row.original.isAvailable
              ? "bg-[#EAF6ED] text-[#3D8B5A]"
              : "bg-[#FFF0EE] text-[#FF2B20]"
          }`}>
            {row.original.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="text-right">
              <Button
                size="sm"
                variant="outline"
                className={`h-8 px-3 rounded-[7px] text-[11px] font-[500] transition-all bg-[#FFFFFF] border-[#9BC8A8] text-[#287044] hover:bg-[#F3FAF4]`}
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
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 bg-[#FCFCFC] min-h-screen pt-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 px-6">
        <div>
          <h1 className="text-[24px] font-[700] text-[#18212B] tracking-tight">Menu Management</h1>
          <p className="text-[14px] text-[#68727D] mt-1">Add delicious items and manage your kitchen menu</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#9BC8A8] text-[#287044] bg-[#FFFFFF] hover:bg-[#F3FAF4] font-[600] px-4 h-[36px] rounded-[8px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hidden sm:flex" onClick={() => data.kitchen?.slug && router.push(`/kitchens/${data.kitchen.slug}`)}>
            <Eye className="h-[16px] w-[16px] mr-2 text-[#3D8B5A]" /> View Public Menu
          </Button>
          <Button className="bg-[#FF4D00] hover:bg-[#E94300] text-[#FFFFFF] font-[600] px-4 h-[36px] rounded-[8px] border border-[#FF4D00] shadow-[0_1px_3px_rgba(255,77,0,0.12)] transition-all" onClick={scrollToForm}>
            <Plus className="h-[16px] w-[16px] mr-2 text-[#FFFFFF]" /> Add Menu Item
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] px-6">
        {/* Left Column: Form */}
        <MenuForm />

        {/* Right Column: Availability */}
        <AvailabilityCard 
          todayAvail={isAvailableToday} 
          tomorrowAvail={isAvailableTomorrow} 
          onSetToday={(v) => availMutation.mutate({ isAvailable: v, dateType: "TODAY" })} 
          onSetTomorrow={(v) => availMutation.mutate({ isAvailable: v, dateType: "TOMORROW" })} 
        />
      </div>

      {/* Current Menu Items */}
      <div className="px-6">
        <Card className="rounded-[12px] border border-[#E7E9EB] shadow-[0_1px_3px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.03)] mt-2 bg-[#FFFFFF] overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8EAEC] gap-4 bg-[#FFFFFF]">
            <div className="flex items-center gap-3">
              <div className="h-[42px] w-[42px] rounded-full bg-[#EAF6ED] flex items-center justify-center shrink-0">
                <Utensils className="h-[20px] w-[20px] text-[#3D8B5A]" />
              </div>
              <CardTitle className="text-[16px] font-[600] text-[#202831]">Current Menu Items</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[#69737D]" />
                <Input
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 h-[36px] rounded-[8px] border-[#E5E7EB] bg-[#FFFFFF] text-[13px] font-[400] text-[#252D36] placeholder:text-[#8A939D] focus-visible:border-[#9BC8A8] focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(61,139,90,0.08)]"
                />
              </div>
              <Select value={slotFilter} onValueChange={(v) => { setSlotFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-[140px] h-[36px] rounded-[8px] border-[#E5E7EB] bg-[#FFFFFF] text-[13px] font-[500] text-[#252D36] focus:border-[#9BC8A8] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(61,139,90,0.08)]">
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
          
          <CardContent className="p-0 bg-[#FFFFFF]">
            <ScrollArea className="w-full">
            {filteredItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-[#8A939D]">
                <Utensils className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-[14px] font-[500] text-[#68727D]">
                  {menuItems.length === 0 ? "No menu items added yet." : "No items match your search."}
                </p>
              </div>
            ) : (
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-[#FAFAFA] hover:bg-[#FAFAFA] border-b border-[#E8EAEC]">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="font-[600] text-[12px] text-[#59636E] h-12 first:px-6 last:px-6"
                        >
                          {header.isPlaceholder ? null : (
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1 hover:text-[#18212B] ${
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
                    <TableRow key={row.id} className="hover:bg-[#FCFDFC] transition-colors border-b border-[#E8EAEC]">
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
            <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {/* Pagination */}
            {filteredItems.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-t border-[#E8EAEC] bg-[#FFFFFF] gap-4">
                <span className="text-[12px] font-[400] text-[#68727D]">
                  Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
                  {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, filteredItems.length)} of{" "}
                  {filteredItems.length} items
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-[36px] w-[36px] p-0 rounded-[8px] border-[#E5E7EB] bg-[#FFFFFF] text-[#4E5964] hover:bg-[#FCFCFC]"
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                    >
                      <ChevronLeft className="h-[16px] w-[16px]" />
                    </Button>
                    {pageNumbers.map((p, i) =>
                      p === "…" ? (
                        <span key={`e-${i}`} className="text-[#8A939D]">...</span>
                      ) : (
                        <Button
                          key={p}
                          variant="outline"
                          className={`h-[36px] w-[36px] p-0 rounded-[8px] font-[500] ${
                            p === currentPage
                              ? "border-[#EAF6ED] text-[#3D8B5A] bg-[#EAF6ED] font-[600]"
                              : "border-[#E5E7EB] bg-[#FFFFFF] text-[#4E5964] hover:bg-[#FCFCFC]"
                          }`}
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      className="h-[36px] w-[36px] p-0 rounded-[8px] border-[#E5E7EB] bg-[#FFFFFF] text-[#4E5964] hover:bg-[#FCFCFC]"
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                    >
                      <ChevronRight className="h-[16px] w-[16px]" />
                    </Button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[12px] font-[400] text-[#68727D]">Rows per page:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => table.setPageSize(Number(v))}
                    >
                      <SelectTrigger className="w-[60px] h-[36px] rounded-[8px] border-[#E5E7EB] text-[12px] font-[500] text-[#252D36] focus:border-[#9BC8A8] focus:ring-0 focus:shadow-[0_0_0_2px_rgba(61,139,90,0.08)]">
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
    </div>
  )
}
