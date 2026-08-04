"use client"

import { useState } from "react"
import { useAdminKitchensQuery, useAdminKitchens, useAdminSelectedKitchen, useAdminKitchensActions } from "@/stores/adminKitchensStore"
import { columns, KitchenPartnerRow } from "./columns"
import { DataTable } from "./data-table"
import { KitchenDetailsSheet } from "./kitchen-details-sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Store, CheckCircle, Clock, Ban, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border shadow-sm bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <Skeleton className="h-10 w-full sm:w-96 rounded-xl" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-[130px] rounded-xl" />
          <Skeleton className="h-10 w-[110px] rounded-xl" />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-muted/30 h-11 px-4 flex items-center gap-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-28 hidden md:block" />
          <Skeleton className="h-3 w-32 hidden lg:block" />
          <Skeleton className="h-3 w-20 hidden md:block" />
          <Skeleton className="h-3 w-16 hidden lg:block" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-1.5 flex-1 max-w-[180px]">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
              <Skeleton className="h-3 w-20 hidden md:block" />
              <Skeleton className="h-3 w-24 hidden lg:block" />
              <Skeleton className="h-5 w-16 hidden md:block" />
              <Skeleton className="h-5 w-14 hidden lg:block" />
              <Skeleton className="h-3 w-10 hidden md:block" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function KitchensClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const selectedKitchen = useAdminSelectedKitchen()
  const { setSelectedKitchen } = useAdminKitchensActions()

  const { isLoading } = useAdminKitchensQuery()
  const partners = useAdminKitchens()

  const handleEdit = (kitchen: KitchenPartnerRow) => {
    setSelectedKitchen(kitchen)
    setIsSheetOpen(true)
  }

  const handleView = (kitchen: KitchenPartnerRow) => {
    setSelectedKitchen(kitchen)
    setIsSheetOpen(true)
  }

  const totalKitchens = partners.length
  const activeCount = partners.filter((p) => p.status === "ACTIVE" || p.status === "APPROVED").length
  const pendingCount = partners.filter((p) => p.status === "PENDINGAPPROVAL").length
  const suspendedCount = partners.filter((p) => p.status === "SUSPENDED").length
  const rejectedCount = partners.filter((p) => p.status === "REJECTED").length

  const pct = (n: number) => (totalKitchens > 0 ? Math.round((n / totalKitchens) * 100) : 0)

  const stats = [
    { title: "Total Kitchens", value: totalKitchens, icon: Store, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendUp: true, trend: `${pct(activeCount)}% active` },
    { title: "Active", value: activeCount, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trendUp: true, trend: `${pct(activeCount)}% share` },
    { title: "Pending Approval", value: pendingCount, icon: Clock, iconBg: "bg-orange-50", iconColor: "text-orange-600", trendUp: false, trend: `${pct(pendingCount)}% share` },
    { title: "Suspended / Rejected", value: suspendedCount + rejectedCount, icon: Ban, iconBg: "bg-red-50", iconColor: "text-red-600", trendUp: false, trend: `${pct(suspendedCount + rejectedCount)}% share` },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          stats.map((stat) => (
            <Card key={stat.title} className="rounded-xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.iconBg} ${stat.iconColor} rounded-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center font-medium ${stat.trendUp ? "text-emerald-600" : "text-red-600"}`}>
                    {stat.trendUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {stat.trend.split(" ")[0]}
                  </span>
                  <span className="text-muted-foreground ml-2">{stat.trend.split(" ").slice(1).join(" ")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTable
              columns={columns(handleEdit, handleView)}
              data={partners}
            />
            <KitchenDetailsSheet
              open={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              kitchen={selectedKitchen}
            />
          </>
        )}
      </div>
    </>
  )
}
