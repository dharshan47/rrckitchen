"use client"

import { useState } from "react"
import { useAdminKitchensQuery, useAdminKitchens, useAdminSelectedKitchen, useAdminKitchensActions } from "@/stores/adminKitchensStore"
import { columns, KitchenPartnerRow } from "./columns"
import { DataTable } from "./data-table"
import { KitchenDetailsSheet, KitchenDetailsBody } from "./kitchen-details-sheet"
import { ClipboardList, CheckCircle, UserCheck, CircleX, ArrowUp, ArrowDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-[48px] h-[48px] rounded-full shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-[14px] w-[100px]" />
              <Skeleton className="h-[26px] w-[60px]" />
            </div>
          </div>
          <div className="flex items-center">
            <Skeleton className="h-[12px] w-[140px]" />
          </div>
        </div>
      ))}
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col 2xl:flex-row items-center gap-3">
        <div className="relative w-full 2xl:w-[320px] shrink-0">
          <Skeleton className="h-[40px] w-full rounded-[8px]" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full 2xl:w-auto">
          <Skeleton className="h-[40px] w-[140px] rounded-[8px]" />
          <Skeleton className="h-[40px] w-[140px] rounded-[8px]" />
          <Skeleton className="h-[40px] w-[160px] rounded-[8px]" />
          <Skeleton className="h-[40px] w-[120px] rounded-[8px]" />
        </div>
      </div>
      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.02)] overflow-hidden">
        <div className="bg-[#FFFFFF] border-b border-[#F1F5F9] h-[52px] px-6 flex items-center gap-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28 hidden xl:block" />
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-32 hidden 2xl:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-[14px]">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Skeleton className="h-[40px] w-[40px] rounded-[8px] shrink-0" />
                <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                  <Skeleton className="h-[14px] w-3/4" />
                  <Skeleton className="h-[12px] w-1/2" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 hidden xl:block" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-4 w-32 hidden 2xl:block" />
              <Skeleton className="h-6 w-20 hidden md:block" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-[8px]" />
                <Skeleton className="h-8 w-8 rounded-[8px]" />
              </div>
            </div>
          ))}
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
  const suspendedCount = partners.filter((p) => p.status === "SUSPENDED" || p.status === "REJECTED").length

  const stats = [
    { title: "Total Kitchens", value: totalKitchens, icon: ClipboardList, iconBg: "bg-[#EAF3FF]", iconColor: "text-[#1677E8]", trendUp: true, trend: "8.2%", trendColor: "text-[#16A34A]" },
    { title: "Active", value: activeCount, icon: CheckCircle, iconBg: "bg-[#E8F7EC]", iconColor: "text-[#15803D]", trendUp: true, trend: "6.1%", trendColor: "text-[#16A34A]" },
    { title: "Pending Approval", value: pendingCount, icon: UserCheck, iconBg: "bg-[#FFF4DE]", iconColor: "text-[#F59E0B]", trendUp: false, trend: "3.2%", trendColor: "text-[#EF4444]" },
    { title: "Suspended", value: suspendedCount, icon: CircleX, iconBg: "bg-[#FFE8E8]", iconColor: "text-[#EF4444]", trendUp: false, trend: "1.4%", trendColor: "text-[#EF4444]" },
  ]

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-[#FFFFFF] min-h-screen pb-12">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <stat.icon className={`h-[24px] w-[24px] ${stat.iconColor}`} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#334155] mb-1 leading-none">{stat.title}</span>
                  <span className="text-[26px] font-bold text-[#111827] leading-none">{stat.value}</span>
                </div>
              </div>
              <div className="flex items-center text-[12px]">
                <span className={`flex items-center font-semibold ${stat.trendColor}`}>
                  {stat.trendUp ? <ArrowUp className="h-[14px] w-[14px] mr-0.5" /> : <ArrowDown className="h-[14px] w-[14px] mr-0.5" />}
                  {stat.trend}
                </span>
                <span className="text-[#64748B] ml-1.5 font-medium">• vs last week</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-start gap-6">
        <div className={`flex-1 min-w-0 transition-all duration-300 ${isSheetOpen ? "hidden lg:block lg:w-[calc(100%-424px)]" : "w-full"}`}>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <DataTable
                columns={columns(handleEdit, handleView)}
                data={partners}
              />
              <div className="lg:hidden">
                <KitchenDetailsSheet
                  open={isSheetOpen}
                  onOpenChange={setIsSheetOpen}
                  kitchen={selectedKitchen}
                />
              </div>
            </>
          )}
        </div>
        
        {isSheetOpen && selectedKitchen && (
          <div className="hidden lg:flex w-[400px] shrink-0 flex-col bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden h-[calc(100vh-140px)] sticky top-[80px]">
            <KitchenDetailsBody
              key={selectedKitchen.id}
              kitchen={selectedKitchen}
              onClose={() => setIsSheetOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
