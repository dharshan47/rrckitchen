"use client"

import { useState } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
import { useKitchenData } from "../layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { addKitchenMenuItem, toggleMenuItemAvailability, setKitchenAvailability } from "@/actions/dashboard"

const categories = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snacks", label: "Snacks" },
  { value: "dinner", label: "Dinner" },
]

function FoodTypeBadge({ type }: { type: string }) {
  const isVeg = type === "VEG"
  return (
    <Badge variant={isVeg ? "secondary" : "destructive"} className={isVeg ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
      {isVeg ? "Veg" : "Non-Veg"}
    </Badge>
  )
}

interface UploadedImage {
  secure_url: string
  public_id: string
}

function MenuForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [foodType, setFoodType] = useState("veg")
  const [timeSlot, setTimeSlot] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [submitting, setSubmitting] = useState(false)

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.public_id !== publicId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !category || !timeSlot || !price) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("name", name)
      formData.set("category", category)
      formData.set("foodType", foodType)
      formData.set("timeSlot", timeSlot)
      formData.set("price", price)
      formData.set("description", description)
      formData.set("isAvailable", String(isAvailable))
      if (images.length > 0) {
        formData.set("images", JSON.stringify(images))
      }
      const result = await addKitchenMenuItem(formData)
      if (result.success) {
        toast.success("Menu item added successfully")
        setName("")
        setCategory("")
        setFoodType("veg")
        setTimeSlot("")
        setPrice("")
        setDescription("")
        setImages([])
        setIsAvailable(true)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to add item")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="foodName">Food Name *</Label>
            <Input id="foodName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter dish name" />
          </div>

          <div className="grid gap-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Veg / Non-Veg *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={foodType === "veg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFoodType("veg")}
                >
                  Veg
                </Button>
                <Button
                  type="button"
                  variant={foodType === "nonveg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFoodType("nonveg")}
                >
                  Non-Veg
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Time Slot *</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="eveningsnacks">Snacks</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Images ({images.length})</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.public_id} className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden border group">
                  <img src={img.secure_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.public_id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <CloudinaryUpload
                onUpload={(info) => {
                  setImages((prev) => [...prev, { secure_url: info.secure_url, public_id: info.public_id }])
                }}
              >
                {({ uploading, startUpload, cancelUpload }) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startUpload}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                    {uploading && (
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the dish..." />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label htmlFor="available" className="text-sm font-normal">Available for Tomorrow</Label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function MenuPage() {
  const data = useKitchenData()
  const menuItems = data.menuItems
  const tomorrowAvail = data.tomorrowAvailability
  const isAvailableTomorrow = tomorrowAvail?.isAvailable ?? null
  const queryClient = useQueryClient()

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })

  const handleToggleAvailability = async (itemId: string, current: boolean) => {
    const result = await toggleMenuItemAvailability(itemId, !current)
    if (result.success) {
      toast.success(`Item marked as ${!current ? "Available" : "Unavailable"}`)
      refresh()
    } else {
      toast.error(result.error ?? "Failed to update")
    }
  }

  const handleSetKitchenAvailability = async (isAvailable: boolean) => {
    const result = await setKitchenAvailability(isAvailable)
    if (result.success) {
      toast.success(`Kitchen marked as ${isAvailable ? "Available" : "Unavailable"} for tomorrow`)
      refresh()
    } else {
      toast.error(result.error ?? "Failed to update")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <MenuForm />

        <Card>
          <CardHeader>
            <CardTitle>Tomorrow&apos;s Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Set your kitchen availability for tomorrow. Orders are accepted one day in advance.</p>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tomorrow&apos;s Status</p>
                    <p className="text-sm mt-0.5">
                      {isAvailableTomorrow === null ? (
                        <span className="text-muted-foreground">Not set yet</span>
                      ) : isAvailableTomorrow ? (
                        <span className="text-green-600 font-medium">You will accept orders tomorrow</span>
                      ) : (
                        <span className="text-red-600 font-medium">You will not accept orders tomorrow</span>
                      )}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isAvailableTomorrow === true
                      ? "bg-green-600 text-white"
                      : isAvailableTomorrow === false
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}>
                    {isAvailableTomorrow === true
                      ? "Available"
                      : isAvailableTomorrow === false
                        ? "Unavailable"
                        : "Not Set"}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant={isAvailableTomorrow === true ? "default" : "outline"}
                    className={`flex-1 ${
                      isAvailableTomorrow === true
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-green-600 border-green-300 hover:bg-green-50"
                    }`}
                    onClick={() => handleSetKitchenAvailability(true)}
                  >
                    {isAvailableTomorrow === true ? "✓ Available" : "Available"}
                  </Button>
                  <Button
                    size="sm"
                    variant={isAvailableTomorrow === false ? "default" : "outline"}
                    className={`flex-1 ${
                      isAvailableTomorrow === false
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "text-red-600 border-red-200 hover:bg-red-50"
                    }`}
                    onClick={() => handleSetKitchenAvailability(false)}
                  >
                    {isAvailableTomorrow === false ? "✕ Unavailable" : "Unavailable"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No menu items added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food Name</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.menuName}</TableCell>
                    <TableCell><FoodTypeBadge type={item.foodType} /></TableCell>
                    <TableCell>{item.timeSlot}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={item.isAvailable ? "outline" : "default"}
                        className={`h-7 text-xs ${item.isAvailable ? "" : "bg-green-600 hover:bg-green-700 text-white"}`}
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      >
                        {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
