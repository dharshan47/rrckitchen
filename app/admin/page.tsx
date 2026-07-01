"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Banknote,
  ChefHat,
  CheckCircle,
  Clock,
  DollarSign,
  LayoutDashboard,
  ListOrdered,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Users,
  Utensils,
  XCircle,
  Settings,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
import { ChartPieSimple } from "@/components/charts/pie-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { getAdminDashboardData } from "@/actions/dashboard"

type AdminData = Awaited<ReturnType<typeof getAdminDashboardData>>

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ListOrdered },
  { id: "kitchens", label: "Kitchen Partners", icon: ChefHat },
  { id: "delivery", label: "Delivery Management", icon: Truck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "cms", label: "CMS", icon: Settings },
]

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().min(1, "Description is required"),
})

type CategoryForm = z.infer<typeof categorySchema>

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    formState: { errors: categoryErrors },
    reset: resetCategory,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  const onAddCategory = (form: CategoryForm) => {
    console.log("Add category:", form)
    resetCategory()
  }

  useEffect(() => {
    getAdminDashboardData().then((result) => {
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
            <p className="text-muted-foreground">Unauthorized. Please log in as admin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = data.stats

  const statsCards = [
    { title: "Total Revenue", value: `₹${s.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
    { title: "Today's Revenue", value: `₹${s.todayRevenue.toLocaleString()}`, icon: Banknote, color: "text-green-600" },
    { title: "Today's Orders", value: s.todayOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { title: "Completed Orders", value: s.completedOrders.toString(), icon: CheckCircle, color: "text-green-600" },
    { title: "Pending Orders", value: s.pendingOrders.toString(), icon: Clock, color: "text-orange-600" },
    { title: "Cancelled Orders", value: s.cancelledOrders.toString(), icon: XCircle, color: "text-red-600" },
    { title: "Active Customers", value: s.activeCustomers.toString(), icon: Users, color: "text-indigo-600" },
    { title: "Kitchen Partners", value: s.kitchenPartners.toString(), icon: ChefHat, color: "text-purple-600" },
    { title: "Delivery Partners", value: s.deliveryPartners.toString(), icon: Truck, color: "text-cyan-600" },
    { title: "Menu Items", value: s.menuItems.toString(), icon: Utensils, color: "text-rose-600" },
  ]

  const revenueTrendConfig = {
    revenue: { label: "Revenue (₹)", color: "var(--chart-1)" },
    orders: { label: "Orders", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const ordersTimeSlotConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const vegNonVegConfig = {
    count: { label: "Count" },
    veg: { label: "Veg", color: "var(--chart-1)" },
    nonveg: { label: "Non-Veg", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const orderStatusConfig = {
    count: { label: "Count" },
    confirmed: { label: "Pending", color: "var(--chart-1)" },
    preparing: { label: "Preparing", color: "var(--chart-2)" },
    completed: { label: "Completed", color: "var(--chart-3)" },
    cancelled: { label: "Cancelled", color: "var(--chart-4)" },
  } satisfies ChartConfig

  const topSellingConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">RRC Kitchen Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <div className="border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-bold">Super Admin Dashboard</h1>
              <div className="ml-auto">
                <Badge variant="secondary">Super Admin</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Stats Cards - visible on all sections */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {statsCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-3.5 w-3.5 shrink-0 ${stat.color}`} />
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="text-lg font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Content */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <ChartLineDots
                    data={data.revenueTrend}
                    config={revenueTrendConfig}
                    title="Revenue Trend"
                    description="Monthly"
                    dataKeys={["revenue", "orders"]}
                    xKey="period"
                  />
                  <ChartBarLabel
                    data={data.ordersByTimeSlot}
                    config={ordersTimeSlotConfig}
                    title="Orders by Time Slot"
                    description="Breakfast / Lunch / Snacks / Dinner"
                    dataKey="orders"
                    xKey="slot"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <ChartPieDonut
                    data={data.vegNonVeg}
                    config={vegNonVegConfig}
                    title="Veg vs Non-Veg"
                    description="Menu distribution"
                    dataKey="count"
                    nameKey="type"
                  />
                  <ChartPieSimple
                    data={data.orderStatusDist}
                    config={orderStatusConfig}
                    title="Order Status"
                    description="All orders"
                    dataKey="count"
                    nameKey="status"
                  />
                  <ChartBarLabel
                    data={data.topSelling}
                    config={topSellingConfig}
                    title="Top Selling Foods"
                    description="Most ordered items"
                    dataKey="orders"
                    xKey="item"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Kitchen Partners</CardTitle>
                      <p className="text-sm text-muted-foreground">Based on: Orders, Revenue, Rating</p>
                    </CardHeader>
                    <CardContent>
                      {data.topKitchens.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No kitchen data yet</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kitchen</TableHead>
                              <TableHead>Orders</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Rating</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.topKitchens.map((k) => (
                              <TableRow key={k.name}>
                                <TableCell className="font-medium">{k.name}</TableCell>
                                <TableCell>{k.orders}</TableCell>
                                <TableCell>₹{k.revenue.toLocaleString()}</TableCell>
                                <TableCell>{k.rating > 0 ? `${k.rating} ★` : "N/A"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Partner Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.deliveryPerformance.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No delivery data yet</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Delivery Partner</TableHead>
                              <TableHead>Deliveries</TableHead>
                              <TableHead>Rating</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.deliveryPerformance.map((d, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{d.name}</TableCell>
                                <TableCell>{d.deliveries}</TableCell>
                                <TableCell>{d.rating > 0 ? `${d.rating} ★` : "N/A"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentOrders.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No orders yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Kitchen</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.recentOrders.map((o) => (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}...</TableCell>
                              <TableCell>{o.customer}</TableCell>
                              <TableCell>{o.kitchen}</TableCell>
                              <TableCell className="whitespace-nowrap">{o.date}</TableCell>
                              <TableCell>₹{o.amount}</TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  o.status === "Completed" ? "bg-green-100 text-green-700" :
                                  o.status === "Preparing" ? "bg-blue-100 text-blue-700" :
                                  o.status === "Confirmed" ? "bg-orange-100 text-orange-700" :
                                  o.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>{o.status}</span>
                              </TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  o.payment === "Paid" ? "bg-green-100 text-green-700" :
                                  o.payment === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>{o.payment}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "kitchens" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Kitchen Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.kitchenPartners.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No kitchen partners yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kitchen Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.kitchenPartners.map((k) => (
                            <TableRow key={k.name}>
                              <TableCell className="font-medium">{k.name}</TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  k.status === "Active" ? "bg-green-100 text-green-700" :
                                  k.status === "SUSPENDED" ? "bg-red-100 text-red-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }`}>{k.status}</span>
                              </TableCell>
                              <TableCell>{k.orders}</TableCell>
                              <TableCell className="whitespace-nowrap">₹{k.revenue.toLocaleString()}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Partner Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.deliveryPartners.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No delivery partners yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Delivery Person</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Documents</TableHead>
                            <TableHead>Bank Details</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.deliveryPartners.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{d.name}</TableCell>
                              <TableCell>{d.vehicle}</TableCell>
                              <TableCell>{d.orders}</TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  d.status === "Active" ? "bg-green-100 text-green-700" :
                                  d.status === "Pending Approval" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                }`}>{d.status}</span>
                              </TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  d.docs === "Verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}>{d.docs}</span>
                              </TableCell>
                              <TableCell className="font-mono text-xs">-</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "customers" && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold mt-1">{s.activeCustomers}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Today&apos;s Orders</p>
                      <p className="text-2xl font-bold mt-1">{s.todayOrders}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Kitchen Partners</p>
                      <p className="text-2xl font-bold mt-1">{s.kitchenPartners}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Delivery Partners</p>
                      <p className="text-2xl font-bold mt-1">{s.deliveryPartners}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "cms" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage categories, menu items, and content across the platform.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <h3 className="font-semibold mb-3">Categories</h3>
                        <div className="space-y-2">
                          {["Breakfast", "Lunch", "Snacks", "Dinner"].map((cat) => (
                            <div key={cat} className="flex items-center justify-between rounded-lg border p-3">
                              <span>{cat}</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200">Disable</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Quick Edit</h3>
                        <form onSubmit={handleCategorySubmit(onAddCategory)} className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input id="cat-name" placeholder="New category name" {...registerCategory("name")} />
                            {categoryErrors.name && (
                              <p className="text-xs text-destructive">{categoryErrors.name.message}</p>
                            )}
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input id="cat-desc" placeholder="Category description" {...registerCategory("description")} />
                            {categoryErrors.description && (
                              <p className="text-xs text-destructive">{categoryErrors.description.message}</p>
                            )}
                          </div>
                          <Button type="submit">Add Category</Button>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
