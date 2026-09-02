"use client"

import { useRouter } from "next/navigation"
import { CreditCard, Landmark, Wallet, CheckCircle2, XCircle, Clock3, ShieldCheck, Lock, ChevronRight, Download, ChevronDown, ShoppingBag, FileText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"
import {
  useUserOrdersQuery,
  useUserOrders,
} from "@/stores/userProfileStore"
import Image from "next/image"
import Link from "next/link"
import { UpiIcon } from "@/components/icons/upi"
import { Skeleton } from "@/components/ui/skeleton"

function PaymentsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12 pt-6 md:pt-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-2 px-4 md:px-0">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* HEADER Skeleton */}
      <div className="relative w-full rounded-[24px] overflow-hidden border border-[#FDEAD7] flex flex-col md:flex-row items-center px-6 md:px-12 py-8 md:py-10 mx-4 md:mx-0 bg-white shadow-sm"
           style={{ width: "calc(100% - 32px)", marginLeft: "16px", marginRight: "16px" }}>
        
        <div className="relative z-10 flex flex-col gap-6 w-full md:w-[60%] shrink-0">
          <div>
            <Skeleton className="h-[36px] md:h-[44px] w-3/4 rounded-lg mb-2" />
            <Skeleton className="h-[20px] w-1/2 rounded-md" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <Skeleton className="h-[14px] w-24 rounded" />
                  <Skeleton className="h-[12px] w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full h-[180px] mt-8 md:mt-0 md:ml-auto md:w-[360px] md:h-[200px] shrink-0">
          <Skeleton className="w-[180px] h-[180px] md:w-[320px] md:h-[180px] rounded-[16px] mx-auto md:ml-auto md:mr-0" />
        </div>
      </div>

      {/* METHODS Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[16px] p-5 border border-[#E5E7EB] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-[16px] w-16 rounded" />
                <Skeleton className="h-[14px] w-20 rounded" />
                <Skeleton className="h-[14px] w-16 rounded" />
              </div>
            </div>
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 px-4 md:px-0 text-center flex-wrap">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-[14px] w-full max-w-[400px] rounded" />
      </div>

      {/* PAYMENT HISTORY Skeleton */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden mx-4 md:mx-0">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB]">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 pt-0.5">
              <Skeleton className="h-[20px] w-40 rounded" />
              <Skeleton className="h-[14px] w-64 rounded" />
            </div>
          </div>
          <Skeleton className="h-[42px] w-[180px] rounded-lg shrink-0" />
        </div>

        <div className="w-full">
          <div className="min-w-[600px] w-full overflow-hidden">
            <div className="bg-[#F8FAFC] h-12 border-b border-[#E5E7EB] flex items-center px-6 md:px-8">
              <Skeleton className="h-[14px] w-full rounded" />
            </div>
            <div className="flex flex-col">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[72px] border-b border-[#F1F5F9] flex items-center px-6 md:px-8">
                  <div className="flex items-center gap-3 w-1/5">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <Skeleton className="h-[16px] w-16 rounded" />
                  </div>
                  <div className="w-1/5 pl-4"><Skeleton className="h-[16px] w-24 rounded" /></div>
                  <div className="w-1/5 pl-4 flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-[16px] w-20 rounded" />
                  </div>
                  <div className="w-1/5 pl-4"><Skeleton className="h-[24px] w-20 rounded-full" /></div>
                  <div className="w-1/5 flex justify-end"><Skeleton className="h-[16px] w-16 rounded" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center py-6 bg-white border-t border-[#E5E7EB]">
          <Skeleton className="h-[38px] w-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function PaymentsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const { isLoading: ordersLoading } = useUserOrdersQuery(isLoggedIn)
  const orders = useUserOrders()

  if (isPending || ordersLoading) {
    return <PaymentsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const paymentHistory = orders
    .filter((o) => o.paymentStatus)
    .map((o) => ({
      id: o.id,
      publicCode: o.publicCode,
      provider: o.paymentProvider,
      status: o.paymentStatus,
      amount: o.totalAmount,
      createdAt: o.createdAt,
    }))

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12 pt-6 md:pt-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] mb-2 px-4 md:px-0">
        <Link href="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account/profile" className="hover:text-[#0F172A] transition-colors">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A]">Payments</span>
      </div>

      {/* HEADER */}
      <div className="relative w-full rounded-[24px] overflow-hidden border border-[#FDEAD7] flex flex-col md:flex-row items-center px-6 md:px-12 py-8 md:py-10 mx-4 md:mx-0"
           style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 55%, #FFF3E8 100%)", width: "calc(100% - 32px)", marginLeft: "16px", marginRight: "16px" }}>
        
        <div className="relative z-10 flex flex-col gap-6 w-full md:w-[60%] shrink-0">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] leading-tight mb-2">
              Payment Methods
            </h1>
            <p className="text-[14px] md:text-[16px] font-medium text-[#475569]">
              Pay securely with your favourite option
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">100% Secure</span>
                <span className="text-[11px] font-medium text-[#64748B]">Safe & encrypted</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">Trusted Payments</span>
                <span className="text-[11px] font-medium text-[#64748B]">Powered by Razorpay</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">24/7 Protection</span>
                <span className="text-[11px] font-medium text-[#64748B]">We&apos;ve got you covered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[180px] mt-8 md:mt-0 md:ml-auto md:w-[360px] md:h-[200px] shrink-0">
          <Image 
            src="/account/digital-payment.webp" 
            alt="Digital Payments" 
            fill 
            className="object-contain md:object-right"
          />
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .banner-full-width {
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
      `}</style>
      <div className="banner-full-width" />

      {/* METHODS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
        <div className="bg-white rounded-[16px] p-5 border border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors cursor-pointer flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
              <UpiIcon className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-[#0F172A]">UPI</h3>
              <p className="text-[12px] text-[#64748B] font-medium leading-snug mt-0.5">GPay, PhonePe,<br/>Paytm & more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#16A34A]" />
        </div>

        <div className="bg-white rounded-[16px] p-5 border border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors cursor-pointer flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-[#0F172A]">Cards</h3>
              <p className="text-[12px] text-[#64748B] font-medium leading-snug mt-0.5">Credit &<br/>debit cards</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#2563EB]" />
        </div>

        <div className="bg-white rounded-[16px] p-5 border border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors cursor-pointer flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-[#0F172A]">Net Banking</h3>
              <p className="text-[12px] text-[#64748B] font-medium leading-snug mt-0.5">All major<br/>banks</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#7C3AED]" />
        </div>

        <div className="bg-white rounded-[16px] p-5 border border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors cursor-pointer flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-[#F97316]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-[#0F172A]">Wallets</h3>
              <p className="text-[12px] text-[#64748B] font-medium leading-snug mt-0.5">Paytm, Amazon<br/>Pay & more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#F97316]" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 px-4 md:px-0 text-center flex-wrap">
        <ShieldCheck className="w-4 h-4 text-[#15803D]" />
        <p className="text-[12px] text-[#64748B] font-medium">
          All payments are processed securely through <span className="text-[#15803D] font-bold">Razorpay</span>. We never store your card details.
        </p>
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden mx-4 md:mx-0">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0 border border-[#DCFCE7]">
              <FileText className="w-5 h-5 text-[#15803D]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-[#0F172A]">Payment History</h2>
              <p className="text-[13px] text-[#64748B] font-medium mt-0.5">View your recent payment transactions</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-bold text-[13px] hover:bg-[#DCFCE7] transition-colors shrink-0">
            Download Statement
            <Download className="w-4 h-4" />
          </button>
        </div>

        {paymentHistory.length === 0 ? (
          <p className="text-[13px] text-gray-500 text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl m-8">
            No payments yet. Place your first order to see your payment history here.
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="w-max min-w-full">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                    <TableHead className="font-bold text-[11px] text-[#64748B] h-12 uppercase tracking-wider pl-6 md:pl-8">Order</TableHead>
                    <TableHead className="font-bold text-[11px] text-[#64748B] h-12 uppercase tracking-wider">Date</TableHead>
                    <TableHead className="font-bold text-[11px] text-[#64748B] h-12 uppercase tracking-wider">Method</TableHead>
                    <TableHead className="font-bold text-[11px] text-[#64748B] h-12 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-[11px] text-[#64748B] h-12 uppercase tracking-wider text-right pr-6 md:pr-8">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((p) => {
                    const success = p.status === "SUCCESS"
                    const pending = p.status === "PENDING"
                    return (
                      <TableRow key={p.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <TableCell className="pl-6 md:pl-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4 text-[#15803D]" />
                            </div>
                            <span className="font-bold text-[#0F172A] text-[14px]">
                              {p.publicCode ?? `#${p.id.slice(0, 8).toUpperCase()}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-[#64748B] text-[14px]">
                          {format(new Date(p.createdAt), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {p.provider === "UPI_COLLECT" ? (
                              <UpiIcon className="w-5 h-5 text-[#16A34A] shrink-0" />
                            ) : (p.provider?.toLowerCase().includes("net") || p.provider?.toLowerCase().includes("bank")) ? (
                              <Landmark className="w-5 h-5 text-[#7C3AED] shrink-0" />
                            ) : p.provider?.toLowerCase().includes("wallet") ? (
                              <Wallet className="w-5 h-5 text-[#F97316] shrink-0" />
                            ) : (
                              <CreditCard className="w-5 h-5 text-[#2563EB] shrink-0" />
                            )}
                            <span className="font-semibold text-[#475569] text-[14px] capitalize">
                              {p.provider === "UPI_COLLECT" ? "UPI Collect" : `Razorpay${p.provider ? ` (${p.provider})` : ''}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1.5 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 ${
                            success ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]" : pending ? "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]" : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                          }`}>
                            {success ? <CheckCircle2 className="w-3.5 h-3.5" /> : pending ? <Clock3 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {p.status === "SUCCESS" ? "Paid" : p.status === "PENDING" ? "Pending" : p.status === "REFUNDED" ? "Refunded" : "Failed"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6 md:pr-8">
                          <span className="font-bold text-[#0F172A] text-[14px]">
                            ₹{parseFloat(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
        {paymentHistory.length > 0 && (
          <div className="w-full flex justify-center py-6 bg-white border-t border-[#E5E7EB]">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#334155] font-bold text-[13px] hover:bg-[#F8FAFC] transition-colors shadow-sm">
              View More Transactions
              <ChevronDown className="w-4 h-4 text-[#0F172A]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}