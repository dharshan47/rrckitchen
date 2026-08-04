"use client"

import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { updateKitchenBankDetails } from "@/actions/admin/dashboard"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { 
  Wallet, Settings, IndianRupee, Percent, Calendar, Landmark, 
  CheckCircle2, ShieldCheck, Download, ChevronRight, 
  Building2, UserCircle2, Lock, FileText, Smartphone, ArrowUpRight, ArrowDownRight,
  SmartphoneNfc, Receipt, Clock, ChevronDown, ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react"

type SettlementRow = {
  id: string
  period: string
  gross: number
  commission: number
  net: number
  status: string
  payoutDate?: string | null
  transactionId?: string | null
}

function getNextMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = (1 - day + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}

function getGrowthPct(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export default function PaymentsPageClient() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sorting, setSorting] = useState<SortingState>([])

  const bankSchema = z.object({
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
    gpayNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  type BankFormData = z.infer<typeof bankSchema>

  const data = useKitchenDashboardData()

  const kyc = data?.kitchen

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: kyc?.bankName ?? "",
      accountHolderName: kyc?.accountHolderName ?? "",
      bankAccountNumber: kyc?.bankAccountNumber ?? "",
      ifscCode: kyc?.ifscCode ?? "",
      upiId: kyc?.upiId ?? "",
      gpayNumber: kyc?.gpayNumber ?? "",
      phoneNumber: kyc?.phoneNumber ?? "",
    },
  })

  useEffect(() => {
    if (!data?.kitchen || form.formState.isDirty) return
    form.reset({
      bankName: data.kitchen.bankName ?? "",
      accountHolderName: data.kitchen.accountHolderName ?? "",
      bankAccountNumber: data.kitchen.bankAccountNumber ?? "",
      ifscCode: data.kitchen.ifscCode ?? "",
      upiId: data.kitchen.upiId ?? "",
      gpayNumber: data.kitchen.gpayNumber ?? "",
      phoneNumber: data.kitchen.phoneNumber ?? "",
    })
  }, [data, form, form.formState.isDirty])

  const saveMutation = useMutation({
    mutationFn: (data: BankFormData) => updateKitchenBankDetails(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Bank details saved successfully")
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to save bank details")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const settlements = useMemo<SettlementRow[]>(() => data?.settlements ?? [], [data])

  const monthlyRevenue = useMemo<{ period: string; revenue: number; orders: number }[]>(
    () => data?.monthlyRevenue ?? [],
    [data]
  )

  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]
  const revGrowth = getGrowthPct(currentMonth?.revenue ?? 0, previousMonth?.revenue ?? 0)

  const paidAmount = useMemo(
    () => settlements.filter((s) => s.status === "Paid").reduce((sum, s) => sum + s.net, 0),
    [settlements]
  )
  const pendingAmount = useMemo(
    () => settlements.filter((s) => s.status === "Pending").reduce((sum, s) => sum + s.net, 0),
    [settlements]
  )

  const stats = data?.stats
  const revenue = stats?.monthRevenue || 0
  const commission = Math.round(revenue * 0.1)
  const net = Math.round(revenue * 0.9)

  const totalSettlementsAmount = useMemo(() => settlements.reduce((sum, s) => sum + s.net, 0), [settlements])
  const settlementsCount = settlements.length
  const firstSettlementPeriod = settlements.length > 0 ? settlements[settlements.length - 1].period : null

  const isVerified = kyc?.status === "APPROVED" || kyc?.status === "ACTIVE"

  const earningsTotal = paidAmount + pendingAmount
  const earningsData = [
    { type: "Paid", amount: paidAmount, fill: "var(--color-paid)" },
    { type: "Pending", amount: pendingAmount, fill: "var(--color-pending)" },
  ]
  const earningsConfig = {
    amount: { label: "Amount (₹)" },
    paid: { label: "Paid", color: "#10B981" },
    pending: { label: "Pending", color: "#F97316" },
  } satisfies ChartConfig

  const earningsPct = (amount: number) =>
    earningsTotal > 0 ? `${Math.round((amount / earningsTotal) * 100)}%` : "0%"

  const filteredSettlements = useMemo(() => settlements, [settlements])
  const totalPages = Math.max(1, Math.ceil(filteredSettlements.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const columns = useMemo<ColumnDef<SettlementRow>[]>(
    () => [
      { accessorKey: "period", header: "Period", cell: ({ row }) => <span className="text-[13px] font-medium text-gray-600">{row.original.period}</span> },
      { accessorKey: "gross", header: "Gross Earnings", cell: ({ row }) => <span className="text-[13px] font-bold text-gray-900">₹{row.original.gross.toLocaleString()}</span> },
      { accessorKey: "commission", header: "Commission (10%)", cell: ({ row }) => <span className="text-[13px] font-medium text-gray-600">₹{row.original.commission.toLocaleString()}</span> },
      { accessorKey: "net", header: "Net Payout", cell: ({ row }) => <span className="text-[13px] font-bold text-gray-900">₹{row.original.net.toLocaleString()}</span> },
      { accessorKey: "payoutDate", header: "Payout Date", cell: ({ row }) => <span className="text-[13px] font-medium text-gray-600">{row.original.payoutDate || "—"}</span> },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isPaid = row.original.status === "Paid"
          return (
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
              isPaid ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FFF7ED] text-[#EA580C]"
            }`}>
              {isPaid ? "Paid" : "Pending"}
            </span>
          )
        },
      },
      { accessorKey: "transactionId", header: "Transaction ID", cell: ({ row }) => <span className="text-[13px] font-medium text-gray-600">{row.original.transactionId || "—"}</span> },
    ],
    []
  )

  const table = useReactTable({
    data: filteredSettlements,
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

  const downloadStatement = () => {
    if (settlements.length === 0) return
    const header = ["Period", "Gross Earnings (₹)", "Commission (₹)", "Net Payout (₹)", "Payout Date", "Status", "Transaction ID"]
    const rows = settlements.map((s) => [
      s.period,
      String(s.gross),
      String(s.commission),
      String(s.net),
      s.payoutDate ?? "",
      s.status,
      s.transactionId ?? "",
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `settlement-statement-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const scrollToBankDetails = () => {
    document.getElementById("bank-details")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (!data) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-56 rounded" />
              <Skeleton className="h-5 w-72 rounded mt-1" />
            </div>
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>

        <div className="flex overflow-x-auto pb-4 lg:pb-0 lg:grid lg:grid-cols-5 gap-4 hide-scrollbar snap-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 p-5 flex flex-col items-center justify-center text-center space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <Skeleton className="h-12 w-full lg:w-72 rounded-xl" />
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Skeleton className="h-11 flex-1 lg:flex-none w-28 rounded-xl" />
                  <Skeleton className="h-11 flex-1 lg:flex-none w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-3 w-full">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 flex flex-col items-start justify-center h-[180px] space-y-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-56" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
          <div className="p-6 space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6">
                <Skeleton className="h-3.5 w-24 flex-1" />
                <Skeleton className="h-3.5 w-20 flex-1" />
                <Skeleton className="h-3.5 w-20 flex-1" />
                <Skeleton className="h-3.5 w-20 flex-1" />
                <Skeleton className="h-3.5 w-24 flex-1" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-28 flex-1" />
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <Skeleton className="h-3.5 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = (data: BankFormData) => {
    saveMutation.mutate(data)
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-green-600 hidden sm:block" />
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Payments & Settlements <Wallet className="h-6 w-6 text-green-600 sm:hidden" />
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-0.5">Track your earnings, manage bank details and view settlement history.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-green-200 text-green-700 bg-white hover:bg-green-50 rounded-xl h-11 px-4 shadow-sm font-bold transition-colors" onClick={scrollToBankDetails}>
            <Settings className="h-4 w-4" /> Payout Settings
          </Button>
        </div>
      </div>

      {/* Top Summary Cards (Horizontal scroll on mobile) */}
      <div className="flex overflow-x-auto pb-4 lg:pb-0 lg:grid lg:grid-cols-5 gap-4 hide-scrollbar snap-x">
        {/* Total Revenue */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-1">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Total Revenue</span>
              <div className="text-[22px] font-bold text-gray-900 leading-none">₹{revenue.toLocaleString()}</div>
              {revGrowth !== null && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                  <ArrowUpRight className="h-3 w-3" /> {revGrowth}% <span className="text-gray-400 font-medium normal-case">vs last month</span>
                </div>
              )}
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 25" className="w-full h-10 overflow-visible mt-2">
              <path d="M0 20 Q 15 10, 25 15 T 50 10 T 75 15 T 100 5 L 100 25 L 0 25 Z" fill="url(#green-grad)" opacity="0.3" />
              <path d="M0 20 Q 15 10, 25 15 T 50 10 T 75 15 T 100 5" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </CardContent>
        </Card>

        {/* Platform Commission */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mb-1">
                <Percent className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Platform Commission (10%)</span>
              <div className="text-[22px] font-bold text-gray-900 leading-none">₹{commission.toLocaleString()}</div>
              {revGrowth !== null && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#FF6B00]">
                  <ArrowDownRight className="h-3 w-3" /> {revGrowth}% <span className="text-gray-400 font-medium normal-case">vs last month</span>
                </div>
              )}
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 25" className="w-full h-10 overflow-visible mt-2">
              <path d="M0 10 Q 20 15, 30 10 T 60 15 T 80 5 T 100 10 L 100 25 L 0 25 Z" fill="url(#orange-grad)" opacity="0.2" />
              <path d="M0 10 Q 20 15, 30 10 T 60 15 T 80 5 T 100 10" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </CardContent>
        </Card>

        {/* Net Payable */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-1">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Net Payable</span>
              <div className="text-[22px] font-bold text-gray-900 leading-none">₹{net.toLocaleString()}</div>
              {revGrowth !== null && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                  <ArrowUpRight className="h-3 w-3" /> {revGrowth}% <span className="text-gray-400 font-medium normal-case">vs last month</span>
                </div>
              )}
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 25" className="w-full h-10 overflow-visible mt-2">
              <path d="M0 15 Q 15 5, 30 10 T 55 5 T 80 15 T 100 5 L 100 25 L 0 25 Z" fill="url(#blue-grad)" opacity="0.2" />
              <path d="M0 15 Q 15 5, 30 10 T 55 5 T 80 15 T 100 5" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </CardContent>
        </Card>

        {/* Pending Payout */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase mb-2">Pending Payout</span>
            <div className="text-[22px] font-bold text-gray-900 leading-none mb-3">₹{net.toLocaleString()}</div>
            <p className="text-[11px] text-gray-500 font-medium mb-3">Payout every Monday</p>
            <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">
              Next: {getNextMonday().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </CardContent>
        </Card>

        {/* Total Settlements */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
              <Landmark className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase mb-2">Total Settlements</span>
            <div className="text-[22px] font-bold text-gray-900 leading-none mb-3">₹{totalSettlementsAmount.toLocaleString()}</div>
            <p className="text-[11px] text-gray-500 font-medium mb-3">{settlementsCount} Settlements completed</p>
            {firstSettlementPeriod && (
              <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                Since {firstSettlementPeriod}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        
        {/* Left Column: Bank Details */}
        <Card className="rounded-2xl border-none shadow-sm h-fit">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-[16px] font-bold text-gray-900">Bank & Payment Details</CardTitle>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Add or update your bank account and payment details for settlements.</p>
              </div>
            </div>
            {isVerified && (
              <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[11px] font-bold">Verified</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-[13px] font-bold text-gray-700">Bank Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="bankName" {...form.register("bankName")} placeholder="e.g. Indian Bank" className="pl-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                  </div>
                </div>

                {/* Account Holder */}
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName" className="text-[13px] font-bold text-gray-700">Account Holder Name</Label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="accountHolderName" {...form.register("accountHolderName")} placeholder="e.g. Lakshmi S" className="pl-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber" className="text-[13px] font-bold text-gray-700">Account Number</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="bankAccountNumber" {...form.register("bankAccountNumber")} placeholder="e.g. 1234 5678 9012" className="pl-9 pr-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <Label htmlFor="ifscCode" className="text-[13px] font-bold text-gray-700">IFSC Code</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="ifscCode" {...form.register("ifscCode")} placeholder="e.g. IDIB000T123" className="pl-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="space-y-2">
                  <Label htmlFor="upiId" className="text-[13px] font-bold text-gray-700">UPI ID</Label>
                  <div className="relative">
                    <SmartphoneNfc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="upiId" {...form.register("upiId")} placeholder="e.g. lakshmi.kitchen@upi" className="pl-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                  </div>
                </div>

                {/* GPay Number */}
                <div className="space-y-2">
                  <Label htmlFor="gpayNumber" className="text-[13px] font-bold text-gray-700">GPay / PhonePe Number</Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex gap-1 items-center z-10 bg-white">
                      <span className="h-4 w-4 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-[8px] font-bold">G</span>
                    </div>
                    <Input id="gpayNumber" {...form.register("gpayNumber")} placeholder="e.g. +91 98765 43210" className="pl-10 h-11 rounded-xl border-gray-200 text-[13px] font-medium w-full" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-[13px] font-bold text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="e.g. +91 98765 43210" className="pl-9 h-11 rounded-xl border-gray-200 text-[13px] font-medium" />
                  </div>
                </div>
              </div>

              {/* Security Banner & Buttons */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-3 rounded-xl border border-[#DCFCE7] w-full lg:w-auto">
                  <ShieldCheck className="h-5 w-5 text-[#166534]" />
                  <span className="text-[12px] font-bold text-[#166534]">Your payment details are secure and encrypted</span>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Button type="button" variant="outline" onClick={() => form.reset()} className="flex-1 lg:flex-none h-11 px-6 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 shadow-sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending} className="flex-1 lg:flex-none h-11 px-6 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold shadow-sm">
                    {saveMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
              
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Information Widgets */}
        <div className="space-y-6">
          
          {/* Payout Information */}
          <Card className="rounded-2xl border-none shadow-sm h-fit">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <CardTitle className="text-[16px] font-bold text-gray-900">Payout Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" /> <span className="text-[12px] font-medium">Settlement Cycle</span>
                </div>
                <span className="text-[12px] font-bold text-gray-900">Weekly (Every Monday)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <IndianRupee className="h-4 w-4" /> <span className="text-[12px] font-medium">Minimum Payout</span>
                </div>
                <span className="text-[12px] font-bold text-gray-900">₹500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Landmark className="h-4 w-4" /> <span className="text-[12px] font-medium">Payout Method</span>
                </div>
                <span className="text-[12px] font-bold text-gray-900">Bank Transfer / UPI</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" /> <span className="text-[12px] font-medium">Processing Time</span>
                </div>
                <span className="text-[12px] font-bold text-gray-900">1-2 Business Days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <FileText className="h-4 w-4" /> <span className="text-[12px] font-medium">TDS Deduction</span>
                </div>
                <span className="text-[12px] font-bold text-gray-900">As per government rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Overview Donut Chart */}
          <Card className="rounded-2xl border-none shadow-sm h-fit flex flex-col">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-green-100 rounded flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                </div>
                <CardTitle className="text-[16px] font-bold text-gray-900">Earnings Overview</CardTitle>
              </div>
              <div className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1 cursor-pointer">
                This Month <ChevronDown className="h-3 w-3" />
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 shrink-0">
                 <ChartPieDonut
                  data={earningsData}
                  config={earningsConfig}
                  title=""
                  description=""
                  dataKey="amount"
                  nameKey="type"
                />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Paid
                  </div>
                  <div className="font-bold text-gray-900 flex items-center gap-1">
                    ₹{paidAmount.toLocaleString()} <span className="text-gray-400 font-medium">({earningsPct(paidAmount)})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#F97316]" /> Pending
                  </div>
                  <div className="font-bold text-gray-900 flex items-center gap-1">
                    ₹{pendingAmount.toLocaleString()} <span className="text-gray-400 font-medium">({earningsPct(pendingAmount)})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Card */}
          <div className="bg-gradient-to-br from-[#F0FDF4] to-white rounded-2xl p-6 border border-[#DCFCE7] shadow-sm relative overflow-hidden flex flex-col items-start justify-center h-[180px]">
             <div className="w-[60%] z-10 relative">
               <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-2">
                 Get paid on time,<br/>every time!
               </h3>
               <p className="text-[11px] text-gray-600 font-medium mb-4 leading-relaxed">
                 Keep your bank details updated to receive payments without delay.
               </p>
               <Button onClick={scrollToBankDetails} className="bg-[#166534] hover:bg-[#14532D] text-white h-9 px-4 rounded-lg text-[11px] font-bold shadow-sm">
                  Learn More <ChevronRight className="h-3 w-3 ml-1" />
               </Button>
             </div>
             
             {/* Decorative Graphic */}
             <div className="absolute -right-4 -bottom-4 z-0">
               <div className="relative">
                 {/* Leaves */}
                 <div className="absolute top-10 -left-6 w-8 h-12 bg-[#86EFAC] rounded-full origin-bottom-right -rotate-45" />
                 <div className="absolute top-16 -left-12 w-8 h-16 bg-[#166534] rounded-full origin-bottom-right -rotate-45" />
                 <div className="absolute top-10 -right-2 w-8 h-12 bg-[#86EFAC] rounded-full origin-bottom-left rotate-45" />
                 <div className="absolute top-16 -right-8 w-8 h-16 bg-[#166534] rounded-full origin-bottom-left rotate-45" />
                 
                 {/* Phone */}
                 <div className="w-20 h-40 bg-white border-4 border-gray-900 rounded-3xl relative z-10 shadow-lg flex flex-col items-center justify-center p-2">
                   <div className="w-8 h-1 bg-gray-200 rounded-full absolute top-2" />
                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                     <IndianRupee className="h-5 w-5 text-green-600" />
                   </div>
                   <div className="w-12 h-1.5 bg-gray-100 rounded-full mb-2" />
                   <div className="w-8 h-1.5 bg-gray-100 rounded-full" />
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: Settlement History */}
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-[16px] font-bold text-gray-900">Settlement History</CardTitle>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">View your past settlements and payout details.</p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadStatement} disabled={settlements.length === 0} className="border-green-200 text-green-700 bg-white hover:bg-green-50 h-10 px-4 rounded-xl font-bold text-[12px] shadow-sm w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" /> Download Statement
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 bg-white overflow-x-auto">
          {settlements.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <Receipt className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-[14px] font-medium text-gray-500">No settlements yet.</p>
            </div>
          ) : (
            <>
              <Table className="w-full min-w-[900px]">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`font-bold text-[12px] text-gray-600 h-12 ${header.id === "period" ? "px-6" : ""}`}
                        >
                          {header.isPlaceholder ? null : (
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1 uppercase tracking-wide ${
                                header.column.getCanSort() ? "cursor-pointer select-none" : ""
                              }`}
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
                        <TableCell key={cell.id} className={cell.column.id === "period" || cell.column.id === "transactionId" ? "px-6 py-4" : "py-4"}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-50 flex-col sm:flex-row gap-4">
                <span className="text-[12px] font-medium text-gray-500 px-2">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, settlements.length)} of {settlements.length} settlements
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 p-0 rounded-lg font-bold ${
                        currentPage === i + 1
                          ? "bg-[#166534] text-white hover:text-white hover:bg-[#14532D]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
