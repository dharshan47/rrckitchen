"use client"

import { useMemo, useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
  WalletCards, Settings, IndianRupee, BadgePercent, CalendarDays, Landmark, 
  Check, ShieldCheck, Download,
  User, LockKeyhole, FileText, AtSign, Phone, ArrowUp, ArrowDown, ArrowUpDown,
  CalendarClock, WalletMinimal, MapPin, Clock3, ChevronDown, Save
} from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"

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

  const stats = data?.stats
  const revenue = stats?.monthRevenue || 0
  const commission = Math.round(revenue * 0.1)
  const net = Math.round(revenue * 0.9)

  const totalSettlementsAmount = useMemo(() => settlements.reduce((sum, s) => sum + s.net, 0), [settlements])
  const settlementsCount = settlements.length
  const firstSettlementPeriod = settlements.length > 0 ? settlements[settlements.length - 1].period : null

  const isVerified = kyc?.status === "APPROVED" || kyc?.status === "ACTIVE"

  const earningsTotal = revenue
  const foodOrders = earningsTotal
  const deliveryCharges = 0
  const otherEarnings = earningsTotal - foodOrders - deliveryCharges

  const earningsData = [
    { type: "Food Orders", amount: foodOrders, fill: "#087A2B" },
    ...(deliveryCharges > 0 ? [{ type: "Delivery Charges", amount: deliveryCharges, fill: "#FF5A00" }] : []),
    ...(otherEarnings > 0 ? [{ type: "Other Earnings", amount: otherEarnings, fill: "#2385F5" }] : []),
  ]
  
  const earningsConfig = {
    amount: { label: "Amount (₹)" },
    "Food Orders": { label: "Food Orders", color: "#087A2B" },
    "Delivery Charges": { label: "Delivery Charges", color: "#FF5A00" },
    "Other Earnings": { label: "Other Earnings", color: "#2385F5" },
  } satisfies ChartConfig

  const earningsPct = (amount: number) =>
    earningsTotal > 0 ? `${(amount / earningsTotal * 100).toFixed(1)}%` : "0%"

  const filteredSettlements = useMemo(() => settlements, [settlements])
  const totalPages = Math.max(1, Math.ceil(filteredSettlements.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const columns = useMemo<ColumnDef<SettlementRow>[]>(
    () => [
      { accessorKey: "period", header: "Period", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">{row.original.period}</span> },
      { accessorKey: "gross", header: "Gross Earnings", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">₹{row.original.gross.toLocaleString()}</span> },
      { accessorKey: "commission", header: "Commission (10%)", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">₹{row.original.commission.toLocaleString()}</span> },
      { accessorKey: "net", header: "Net Payout", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">₹{row.original.net.toLocaleString()}</span> },
      { accessorKey: "payoutDate", header: "Payout Date", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">{row.original.payoutDate || "—"}</span> },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isPaid = row.original.status === "Paid"
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              isPaid ? "bg-[#EAF6ED] text-[#287844]" : "bg-[#FFF3E4] text-[#F57C00]"
            }`}>
              {isPaid ? "Paid" : "Pending"}
            </span>
          )
        },
      },
      { accessorKey: "transactionId", header: "Transaction ID", cell: ({ row }) => <span className="text-[12px] font-medium text-[#374151]">{row.original.transactionId || "—"}</span> },
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
      <div className="space-y-6 pb-20 animate-in fade-in duration-500 bg-[#FCFCFC] min-h-screen p-6">
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
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[10px]" />
          ))}
        </div>
      </div>
    )
  }

  const handleSave = (data: BankFormData) => {
    saveMutation.mutate(data)
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 bg-[#FCFCFC] min-h-screen p-2 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <WalletCards className="h-7 w-7 text-[#16833A] hidden sm:block" />
          <div>
            <h1 className="text-[24px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              Payments & Settlements <WalletCards className="h-6 w-6 text-[#16833A] sm:hidden" />
            </h1>
            <p className="text-[13px] text-[#4B5563] mt-0.5">Track your earnings, manage bank details and view settlement history.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-[#FFFFFF] border-[#A8D3B3] text-[#16702E] hover:bg-[#F3FAF5] rounded-[8px] h-9 px-4 shadow-[0_1px_2px_rgba(16,24,40,.02)] font-medium transition-colors" 
          onClick={scrollToBankDetails}
        >
          <Settings className="h-4 w-4" /> Payout Settings
        </Button>
      </div>

      {/* Top Summary Cards */}
      <ScrollArea className="w-full pb-4 lg:pb-0 whitespace-nowrap lg:whitespace-normal">
        <div className="flex w-max lg:w-auto lg:grid lg:grid-cols-5 gap-4">
          
          {/* Total Revenue */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-full bg-[#DDF1E2] flex items-center justify-center shrink-0">
                <IndianRupee className="h-6 w-6 text-[#16833A]" />
              </div>
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] mb-0.5">Total Revenue</div>
                <div className="text-[20px] font-semibold text-[#111827] leading-none">₹{revenue.toLocaleString()}</div>
                {revGrowth !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                    <span className="flex items-center text-[#16833A]"><ArrowUp className="h-3 w-3 mr-0.5" /> {revGrowth}%</span> 
                    <span className="text-[#68727D]">vs last month</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-auto relative h-12 w-full -ml-1">
              <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-[110%] h-full">
                <path d="M0 20 Q 15 10, 25 15 T 50 10 T 75 15 T 100 5 L 100 25 L 0 25 Z" fill="url(#green-fade)" opacity="1" />
                <path d="M0 20 Q 15 10, 25 15 T 50 10 T 75 15 T 100 5" fill="none" stroke="#16833A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="green-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(22, 131, 58, 0.08)" />
                    <stop offset="100%" stopColor="rgba(22, 131, 58, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Platform Commission */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-full bg-[#FFE4D6] flex items-center justify-center shrink-0">
                <BadgePercent className="h-6 w-6 text-[#FF4D00]" />
              </div>
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] mb-0.5">Platform Commission (10%)</div>
                <div className="text-[20px] font-semibold text-[#111827] leading-none">₹{commission.toLocaleString()}</div>
                {revGrowth !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                    <span className="flex items-center text-[#FF2D20]"><ArrowDown className="h-3 w-3 mr-0.5" /> {revGrowth}%</span> 
                    <span className="text-[#68727D]">vs last month</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-auto relative h-12 w-full -ml-1">
              <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-[110%] h-full">
                <path d="M0 10 Q 20 15, 30 10 T 60 15 T 80 5 T 100 10 L 100 25 L 0 25 Z" fill="url(#orange-fade)" opacity="1" />
                <path d="M0 10 Q 20 15, 30 10 T 60 15 T 80 5 T 100 10" fill="none" stroke="#FF4D00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="orange-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 77, 0, 0.06)" />
                    <stop offset="100%" stopColor="rgba(255, 77, 0, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Net Payable */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-between overflow-hidden">
          <CardContent className="p-5 pb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-full bg-[#DCEBFF] flex items-center justify-center shrink-0">
                <WalletCards className="h-6 w-6 text-[#1677FF]" />
              </div>
              <div>
                <div className="text-[12px] font-medium text-[#4B5563] mb-0.5">Net Payable</div>
                <div className="text-[20px] font-semibold text-[#111827] leading-none">₹{net.toLocaleString()}</div>
                {revGrowth !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                    <span className="flex items-center text-[#16833A]"><ArrowUp className="h-3 w-3 mr-0.5" /> {revGrowth}%</span> 
                    <span className="text-[#68727D]">vs last month</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-auto relative h-12 w-full -ml-1">
              <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-[110%] h-full">
                <path d="M0 15 Q 15 5, 30 10 T 55 5 T 80 15 T 100 5 L 100 25 L 0 25 Z" fill="url(#blue-fade)" opacity="1" />
                <path d="M0 15 Q 15 5, 30 10 T 55 5 T 80 15 T 100 5" fill="none" stroke="#1677FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="blue-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(22, 119, 255, 0.06)" />
                    <stop offset="100%" stopColor="rgba(22, 119, 255, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payout */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#E9DEFF] flex items-center justify-center shrink-0">
              <CalendarDays className="h-6 w-6 text-[#7956D8]" />
            </div>
            <div className="flex flex-col h-full w-full">
              <div className="text-[12px] font-medium text-[#4B5563] mb-0.5">Pending Payout</div>
              <div className="text-[20px] font-semibold text-[#111827] leading-none mb-2">₹{net.toLocaleString()}</div>
              <p className="text-[11px] text-[#68727D] mb-3">Payout every Monday</p>
              <div className="bg-[#F0E9FF] text-[#7956D8] px-2.5 py-1 rounded-[6px] text-[10px] font-medium w-fit">
                Next: {getNextMonday().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Settlements */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FFE9C7] flex items-center justify-center shrink-0">
              <Landmark className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <div className="flex flex-col h-full w-full">
              <div className="text-[12px] font-medium text-[#4B5563] mb-0.5">Total Settlements</div>
              <div className="text-[20px] font-semibold text-[#111827] leading-none mb-2">₹{totalSettlementsAmount.toLocaleString()}</div>
              <p className="text-[11px] text-[#68727D] mb-3">{settlementsCount} Settlements completed</p>
              <div className="bg-[#FFF3DE] text-[#C87900] px-2.5 py-1 rounded-[6px] text-[10px] font-medium w-fit">
                Since {firstSettlementPeriod || "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* Middle Section */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        
        {/* Left Column: Bank Details */}
        <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] h-fit" id="bank-details">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-[#EEF0F2] flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Landmark className="h-6 w-6 text-[#16833A]" />
              <div>
                <CardTitle className="text-[16px] font-bold text-[#111827]">Bank & Payment Details</CardTitle>
                <p className="text-[12px] text-[#4B5563] mt-0.5">Add or update your bank account and payment details for settlements.</p>
              </div>
            </div>
            {isVerified && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#EAF6ED] text-[#287844] px-2.5 py-1 rounded-[6px]">
                <Check className="h-4 w-4" />
                <span className="text-[11px] font-semibold">Verified</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Bank Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="bankName" className="text-[11px] font-medium text-[#18212B]">Bank Name</Label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="bankName" {...form.register("bankName")} placeholder="Indian Bank" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>

                {/* Account Holder Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="accountHolderName" className="text-[11px] font-medium text-[#18212B]">Account Holder Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="accountHolderName" {...form.register("accountHolderName")} placeholder="Lakshmi S" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="bankAccountNumber" className="text-[11px] font-medium text-[#18212B]">Account Number</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="bankAccountNumber" {...form.register("bankAccountNumber")} placeholder="1234 5678 9012" className="pl-9 pr-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                    <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#16833A]" />
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="ifscCode" className="text-[11px] font-medium text-[#18212B]">IFSC Code</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="ifscCode" {...form.register("ifscCode")} placeholder="IDIB000T123" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="upiId" className="text-[11px] font-medium text-[#18212B]">UPI ID</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="upiId" {...form.register("upiId")} placeholder="lakshmi.kitchen@upi" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>

                {/* GPay Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="gpayNumber" className="text-[11px] font-medium text-[#18212B]">GPay / PhonePe Number</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                       <span className="font-bold text-[#EA4335] text-[12px] leading-none" style={{fontFamily: 'sans-serif'}}>G</span>
                    </div>
                    <Input id="gpayNumber" {...form.register("gpayNumber")} placeholder="+91 98765 43210" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-[11px] font-medium text-[#18212B]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#68727D]" />
                    <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="+91 98765 43210" className="pl-9 h-[36px] rounded-[7px] border-[#E1E5E9] text-[13px] text-[#18212B] placeholder:text-[#8A939D]" />
                  </div>
                </div>
              </div>

              {/* Security Banner & Buttons */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6">
                <div className="flex items-center gap-2 bg-[#F1F8F2] px-4 h-10 rounded-[8px] w-full lg:w-auto">
                  <ShieldCheck className="h-[18px] w-[18px] text-[#287844]" />
                  <span className="text-[12px] font-medium text-[#287844]">Your payment details are secure and encrypted</span>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Button type="button" variant="outline" onClick={() => form.reset()} className="flex-1 lg:flex-none h-[36px] px-6 rounded-[7px] border-[#D9DEE3] text-[#374151] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending} className="flex-1 lg:flex-none h-[36px] px-6 rounded-[7px] bg-[#FF4D00] hover:bg-[#E94300] text-[#FFFFFF] font-medium shadow-[0_1px_3px_rgba(255,77,0,.12)] gap-2">
                    <Save className="h-[14px] w-[14px]" />
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
          <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] h-fit">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-3">
              <div className="h-6 w-6 rounded-full border border-[#A8D3B3] flex items-center justify-center">
                <IndianRupee className="h-3.5 w-3.5 text-[#16833A]" />
              </div>
              <CardTitle className="text-[16px] font-bold text-[#111827]">Payout Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#4B5563]">
                  <CalendarClock className="h-4 w-4 text-[#68727D]" /> <span className="text-[12px]">Settlement Cycle</span>
                </div>
                <span className="text-[12px] font-medium text-[#374151]">Weekly (Every Monday)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#4B5563]">
                  <WalletMinimal className="h-4 w-4 text-[#68727D]" /> <span className="text-[12px]">Minimum Payout</span>
                </div>
                <span className="text-[12px] font-medium text-[#374151]">₹500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#4B5563]">
                  <MapPin className="h-4 w-4 text-[#68727D]" /> <span className="text-[12px]">Payout Method</span>
                </div>
                <span className="text-[12px] font-medium text-[#374151]">Bank Transfer / UPI</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#4B5563]">
                  <Clock3 className="h-4 w-4 text-[#68727D]" /> <span className="text-[12px]">Processing Time</span>
                </div>
                <span className="text-[12px] font-medium text-[#374151]">1-2 Business Days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#4B5563]">
                  <BadgePercent className="h-4 w-4 text-[#68727D]" /> <span className="text-[12px]">TDS Deduction</span>
                </div>
                <span className="text-[12px] font-medium text-[#374151]">As per government rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Overview Donut Chart */}
          <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] h-fit flex flex-col">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <WalletCards className="h-5 w-5 text-[#16833A]" />
                <CardTitle className="text-[16px] font-bold text-[#111827]">Earnings Overview</CardTitle>
              </div>
              <div className="text-[11px] font-medium text-[#4B5563] bg-[#FFFFFF] px-2.5 py-1.5 rounded-[7px] border border-[#E1E5E9] flex items-center gap-1.5 cursor-pointer">
                This Month <ChevronDown className="h-3 w-3 text-[#68727D]" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-row items-center gap-6">
              <div className="w-28 h-28 shrink-0 relative">
                 <ChartPieDonut
                  data={earningsData}
                  config={earningsConfig}
                  title=""
                  description=""
                  dataKey="amount"
                  nameKey="type"
                />
                <div className="absolute inset-0 bg-[#FFFFFF] rounded-full m-[18px] pointer-events-none"></div>
              </div>
              <div className="flex-1 space-y-3.5 w-full">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 text-[#374151]">
                    <span className="h-2 w-2 rounded-full bg-[#087A2B]" /> Food Orders
                  </div>
                  <div className="font-medium text-[#374151] flex items-center gap-1.5">
                    ₹{foodOrders.toLocaleString()} <span className="text-[#68727D]">({earningsPct(foodOrders)})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 text-[#374151]">
                    <span className="h-2 w-2 rounded-full bg-[#FF5A00]" /> Delivery Charges
                  </div>
                  <div className="font-medium text-[#374151] flex items-center gap-1.5">
                    ₹{deliveryCharges.toLocaleString()} <span className="text-[#68727D]">({earningsPct(deliveryCharges)})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 text-[#374151]">
                    <span className="h-2 w-2 rounded-full bg-[#2385F5]" /> Other Earnings
                  </div>
                  <div className="font-medium text-[#374151] flex items-center gap-1.5">
                    ₹{otherEarnings.toLocaleString()} <span className="text-[#68727D]">({earningsPct(otherEarnings)})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Card */}
          <div className="bg-[#F3FAF5] rounded-[10px] p-6 border-none shadow-[0_1px_2px_rgba(16,24,40,.025)] relative overflow-hidden flex flex-col items-start justify-center min-h-[160px]">
             <div className="w-[65%] z-10 relative">
               <h3 className="text-[18px] font-bold text-[#111827] leading-tight mb-2">
                 Get paid on time,<br/>every time!
               </h3>
               <p className="text-[12px] text-[#4B5563] font-medium mb-4 leading-relaxed">
                 Keep your bank details updated to receive payments without delay.
               </p>
               <Button onClick={scrollToBankDetails} className="bg-[#006B2B] hover:bg-[#00551F] text-[#FFFFFF] h-[32px] px-4 rounded-[7px] text-[12px] font-medium shadow-none">
                  Learn More <ArrowUp className="h-3 w-3 ml-1 rotate-45" />
               </Button>
             </div>
             
             <Image src="/kitchen/smartphone.webp" alt="Smartphone" width={192} height={192} className="absolute right-0 -bottom-6 h-48 w-48 object-contain z-0" />
          </div>

        </div>
      </div>

      {/* Bottom Section: Settlement History */}
      <Card className="rounded-[10px] border border-[#E5E8EB] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(16,24,40,.025),_0_3px_8px_rgba(16,24,40,.015)] overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-[#EEF0F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <WalletCards className="h-6 w-6 text-[#16833A]" />
            <div>
              <CardTitle className="text-[16px] font-bold text-[#111827]">Settlement History</CardTitle>
              <p className="text-[12px] text-[#4B5563] mt-0.5">View your past settlements and payout details.</p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadStatement} disabled={settlements.length === 0} className="border-[#A8D3B3] text-[#16702E] bg-[#FFFFFF] hover:bg-[#F3FAF5] h-[36px] px-4 rounded-[7px] font-medium text-[12px] shadow-[0_1px_2px_rgba(16,24,40,.02)] w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" /> Download Statement
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 bg-white">
          {settlements.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#8A939D]">
              <WalletCards className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-[13px] font-medium">No settlements yet.</p>
            </div>
          ) : (
            <>
              <ScrollArea className="w-full">
                <Table className="w-full min-w-[900px]">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-[#FFFFFF] hover:bg-[#FFFFFF] border-b border-[#EEF0F2]">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`font-medium text-[12px] text-[#374151] h-[44px] ${header.id === "period" ? "px-6" : ""}`}
                        >
                          {header.isPlaceholder ? null : (
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1 ${
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
                    <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors border-b border-[#EEF0F2]">
                      {row.getVisibleCells().map((cell) => (
                         <TableCell key={cell.id} className={cell.column.id === "period" || cell.column.id === "transactionId" ? "px-6 py-3.5" : "py-3.5"}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
              </ScrollArea>
              
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-[#EEF0F2] flex-col sm:flex-row gap-4 bg-white">
                <span className="text-[12px] font-medium text-[#68727D] px-2 whitespace-nowrap">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, settlements.length)} of {settlements.length}
                </span>
                <Pagination className="w-auto mx-0 sm:mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) setPage((p) => p - 1)
                        }}
                        className={`h-7 px-2 rounded-[6px] border border-[#E1E5E9] text-[12px] font-medium text-[#374151] hover:bg-gray-50 bg-[#FFFFFF] ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
                        text="Prev"
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(i + 1)
                          }}
                          isActive={currentPage === i + 1}
                          className={`h-7 w-7 p-0 rounded-[6px] font-medium text-[12px] ${
                            currentPage === i + 1
                              ? "bg-[#006B2B] text-white hover:text-white hover:bg-[#00551F] border-[#006B2B]"
                              : "border border-[#E1E5E9] text-[#374151] hover:bg-gray-50 bg-[#FFFFFF]"
                          }`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) setPage((p) => p + 1)
                        }}
                        className={`h-7 px-2 rounded-[6px] border border-[#E1E5E9] text-[12px] font-medium text-[#374151] hover:bg-gray-50 bg-[#FFFFFF] ${currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                        text="Next"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
