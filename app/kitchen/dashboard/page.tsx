"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChefHat, DollarSign, ShoppingBag, TrendingUp, Users, Utensils } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartBarLabel } from "@/components/charts/bar-chart"
import { ChartLineDots } from "@/components/charts/line-chart"
import { ChartPieDonut } from "@/components/charts/donut-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { getKitchenDashboardData } from "@/actions/dashboard"

type KitchenData = Awaited<ReturnType<typeof getKitchenDashboardData>>

const categories = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snacks", label: "Snacks" },
  { value: "dinner", label: "Dinner" },
]

function FoodTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === "VEG" ? "secondary" : "destructive"}>
      {type === "VEG" ? "Veg" : "Non-Veg"}
    </Badge>
  )
}

interface MenuFormValues {
  foodName: string
  category: string
  foodType: string
  timeSlot: string
  price: number
  description: string
  prepTime: number
  quantity: number
}

const menuItemSchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  category: z.string().min(1, "Category is required"),
  foodType: z.enum(["veg", "nonveg"]),
  timeSlot: z.string().min(1, "Time slot is required"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  description: z.string().optional().default(""),
  prepTime: z.coerce.number().min(1, "Prep time is required"),
  quantity: z.coerce.number().optional().default(0),
})

function MenuForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MenuFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(menuItemSchema as any),
    defaultValues: {
      foodType: "veg",
      foodName: "",
      category: "",
      timeSlot: "",
      price: 0,
      description: "",
      prepTime: 0,
      quantity: 0,
    },
  })

  const foodType = watch("foodType")
  const category = watch("category")
  const timeSlot = watch("timeSlot")

  const onSubmit = (data: MenuFormValues) => {
    console.log("Add menu item:", data)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="foodName">Food Name</Label>
            <Input id="foodName" {...register("foodName")} placeholder="Enter dish name" />
            {errors.foodName && <p className="text-xs text-red-500">{errors.foodName.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setValue("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Veg / Non-Veg</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={foodType === "veg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("foodType", "veg")}
                >
                  Veg
                </Button>
                <Button
                  type="button"
                  variant={foodType === "nonveg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("foodType", "nonveg")}
                >
                  Non-Veg
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Time Slot</Label>
              <Select value={timeSlot} onValueChange={(v) => setValue("timeSlot", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeSlot && <p className="text-xs text-red-500">{errors.timeSlot.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" {...register("price")} placeholder="99" />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prepTime">Preparation Time (min)</Label>
              <Input id="prepTime" type="number" {...register("prepTime")} placeholder="15" />
              {errors.prepTime && <p className="text-xs text-red-500">{errors.prepTime.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe the dish..." />
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground">
              Upload images (coming soon)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="available" className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="available" className="text-sm font-normal">Available Today</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} placeholder="50" />
            </div>
          </div>

          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function MenuManagement({ menuItems }: { menuItems: NonNullable<KitchenData>["menuItems"] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <MenuForm />

        <Card>
          <CardHeader>
            <CardTitle>Tomorrow&apos;s Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">Set your availability for tomorrow. Bookings are one day in advance.</p>
              <div className="space-y-3">
                {["Breakfast", "Lunch", "Snacks", "Dinner"].map((slot) => (
                  <div key={slot} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{slot}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">Available</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Not Available</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">Save Availability</Button>
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
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
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

export default function KitchenPartnerDashboard() {
  const [data, setData] = useState<KitchenData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKitchenDashboardData().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Unauthorized or no kitchen partner profile found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = data.stats
  const kitchen = data.kitchen

  const revenueConfig = {
    revenue: { label: "Revenue (₹)", color: "var(--chart-1)" },
    orders: { label: "Orders", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const ordersConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const popularFoodConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const vegNonVegConfig = {
    count: { label: "Count" },
    veg: { label: "Veg", color: "var(--chart-1)" },
    nonveg: { label: "Non-Veg", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const weeklySalesConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
    target: { label: "Target", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const vegNonVegData: Array<Record<string, string | number>> = [
    { type: "Veg", count: data.vegCount, fill: "var(--color-veg)" },
    { type: "Non-Veg", count: data.nonVegCount ?? 0, fill: "var(--color-nonveg)" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Kitchen Partner Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Welcome, {kitchen.displayName}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayOrders}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <ChefHat className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayCompleted}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Utensils className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayPending}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{s.todayRevenue.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{s.monthRevenue.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.customers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.menuItems}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="w-full max-w-full overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartLineDots
                data={data.monthlyRevenue}
                config={revenueConfig}
                title="Revenue"
                description="Monthly"
                dataKeys={["revenue", "orders"]}
                xKey="period"
              />
              <ChartBarLabel
                data={data.weeklySales}
                config={ordersConfig}
                title="Orders"
                description="This week"
                dataKey="sales"
                xKey="day"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ChartBarLabel
                data={data.popularFood}
                config={popularFoodConfig}
                title="Popular Food"
                description="Most ordered items"
                dataKey="orders"
                xKey="item"
              />
              <ChartPieDonut
                data={vegNonVegData}
                config={vegNonVegConfig}
                title="Veg vs Non-Veg"
                description="Menu distribution"
                dataKey="count"
                nameKey="type"
              />
              <ChartLineDots
                data={data.weeklySales}
                config={weeklySalesConfig}
                title="Weekly Sales"
                description="vs Target"
                dataKeys={["sales", "target"]}
                xKey="day"
              />
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <MenuManagement menuItems={data.menuItems} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {data.orders.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {data.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              order.status === "Completed" ? "bg-green-100 text-green-700" :
                              order.status === "Preparing" ? "bg-blue-100 text-blue-700" :
                              order.status === "Confirmed" ? "bg-orange-100 text-orange-700" :
                              "bg-red-100 text-red-700"
                            }`}>{order.status}</span>
                          </div>
                          <p className="text-sm font-medium">{order.itemName} × {order.quantity}</p>
                          <p className="text-xs text-muted-foreground">{order.timeSlot} • {order.time} • ₹{order.amount}</p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === "Confirmed" && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200">Reject</Button>
                            </>
                          )}
                          {order.status === "Preparing" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Complete</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">₹{s.monthRevenue.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Commission</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">₹{Math.round(s.monthRevenue * 0.1).toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Platform fee (10%)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Net Amount</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">₹{Math.round(s.monthRevenue * 0.9).toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">After commission</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Settlement History</CardTitle></CardHeader>
              <CardContent>
                {data.settlements.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No settlements yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Net</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.settlements.map((s) => (
                        <TableRow key={s.period}>
                          <TableCell>{s.period}</TableCell>
                          <TableCell>₹{s.gross.toLocaleString()}</TableCell>
                          <TableCell>₹{s.commission.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">₹{s.net.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              s.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>{s.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Kitchen Name</Label>
                    <p className="font-medium">{kitchen.displayName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <p className="font-medium">{kitchen.status}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>FSSAI</Label>
                    <p className="font-medium">{kitchen.fssaiNumber ?? "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
