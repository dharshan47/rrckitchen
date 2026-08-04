"use client"

import { useSession } from "@/lib/auth-client"
import { OrderCard, OrderCardSkeleton } from "./order-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ChefHat, ShieldCheck, Clock, ShoppingBag, RotateCcw } from "lucide-react"
import {
  useUserOrdersListQuery,
  useUserOrdersList,
  useUserOrdersTab,
  useUserOrdersSort,
  useUserOrdersActions,
} from "@/stores/userOrdersStore"

function getStatusCategory(status: string): string {
  if (status === "CANCELLED") return "cancelled"
  if (status === "REFUNDED") return "refunds"
  if (status === "COMPLETED") return "completed"
  return "ongoing"
}

export function OrdersClient() {
  const { data: session, isPending: sessionLoading } = useSession()
  const activeTab = useUserOrdersTab()
  const sortOrder = useUserOrdersSort()
  const { setActiveTab, setSortOrder } = useUserOrdersActions()

  const {
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useUserOrdersListQuery(!!session?.user)

  const orders = useUserOrdersList()

  if (sessionLoading || isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 md:gap-8 border-b border-gray-200">
            <Skeleton className="h-10 w-20 rounded-none border-b-2 border-transparent bg-transparent" />
            <Skeleton className="h-10 w-20 rounded-none border-b-2 border-transparent bg-transparent" />
            <Skeleton className="h-10 w-24 rounded-none border-b-2 border-transparent bg-transparent" />
            <Skeleton className="h-10 w-24 rounded-none border-b-2 border-transparent bg-transparent" />
            <Skeleton className="h-10 w-20 rounded-none border-b-2 border-transparent bg-transparent" />
          </div>
          <Skeleton className="h-9 w-[200px]" />
        </div>
        <div className="flex flex-col gap-5">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <p className="text-destructive text-sm font-semibold">Failed to load orders</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RotateCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredOrders = (orders || [])
    .filter((order) => {
      if (activeTab === "all") return true
      return getStatusCategory(order.status) === activeTab
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-gray-900">My Orders</h1>
        <p className="text-[14px] text-gray-600 mt-1.5 font-medium">
          Track and manage all your orders in one place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Tabs value={activeTab} className="w-full sm:w-auto" onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto gap-4 md:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EE7005] data-[state=active]:text-[#EE7005] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              All Orders
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EE7005] data-[state=active]:text-[#EE7005] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EE7005] data-[state=active]:text-[#EE7005] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EE7005] data-[state=active]:text-[#EE7005] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancelled
            </TabsTrigger>
            <TabsTrigger
              value="refunds"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EE7005] data-[state=active]:text-[#EE7005] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Refunds
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] font-bold text-gray-600">Sort by:</span>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
            <SelectTrigger className="w-[140px] h-9 text-[13px] font-bold border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest" className="text-[13px] font-bold">Latest First</SelectItem>
              <SelectItem value="oldest" className="text-[13px] font-bold">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-5 mb-16">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="py-16 text-center">
              <div className="h-14 w-14 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-700 font-bold">No orders found in this category.</p>
              <p className="text-[13px] text-gray-500 mt-1 font-medium">
                Place an order and it will show up here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trust Badges - Desktop/Tablet (Matches exact design) */}
      <div className="hidden md:flex bg-white rounded-2xl py-8 px-4 mb-10 border border-gray-100 shadow-sm mt-8">
        {[
          { title: "100% Homemade", desc: "Made with love & care", icon: <ChefHat className="w-7 h-7 text-red-500 shrink-0" strokeWidth={1.5} /> },
          { title: "Hygienic & Safe", desc: "Verified home kitchens", icon: <ShieldCheck className="w-7 h-7 text-green-600 shrink-0" strokeWidth={1.5} /> },
          { title: "On-time Delivery", desc: "Always on time, every time", icon: <Clock className="w-7 h-7 text-orange-500 shrink-0" strokeWidth={1.5} /> },
          { title: "Easy Returns", desc: "Hassle-free refunds", icon: <svg className="w-7 h-7 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg> },
          { title: "Secure Payments", desc: "100% secure transactions", icon: <ShoppingBag className="w-7 h-7 text-green-600 shrink-0" strokeWidth={1.5} /> },
        ].map((badge, i, arr) => (
          <div key={i} className={`flex-1 flex items-center justify-center gap-3 px-4 ${i !== arr.length - 1 ? 'border-r border-dotted border-gray-300' : ''}`}>
            {badge.icon}
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{badge.title}</span>
              <span className="text-[11px] text-gray-500 font-medium leading-tight">{badge.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
