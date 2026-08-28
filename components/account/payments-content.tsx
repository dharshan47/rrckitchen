"use client"

import { useRouter } from "next/navigation"
import { CreditCard, Smartphone, Landmark, Wallet, CheckCircle2, XCircle, Clock3 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"
import {
  useUserOrdersQuery,
  useUserOrders,
} from "@/stores/userProfileStore"

function PaymentsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[160px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="h-[110px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[110px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[110px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[110px] rounded-[20px] bg-[#F3F4F6]" />
      </div>
      <div className="h-[300px] rounded-[20px] bg-[#F3F4F6] mt-6" />
    </div>
  )
}

const METHODS = [
  { icon: Smartphone, title: "UPI", desc: "GPay, PhonePe, Paytm & more" },
  { icon: CreditCard, title: "Cards", desc: "Credit & debit cards" },
  { icon: Landmark, title: "Net Banking", desc: "All major banks" },
  { icon: Wallet, title: "Wallets", desc: "Paytm, Amazon Pay & more" },
]

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
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* HEADER */}
      <div className="relative w-full h-[150px] md:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-2">
            Payment Methods
          </h1>
          <p className="text-[14px] md:text-[15px] font-medium text-gray-700">
            Pay securely with your favourite option
          </p>
        </div>
        <div className="absolute right-[-16px] md:right-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[190px] md:h-[190px] bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-[#F97316]" />
        </div>
      </div>

      {/* METHODS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METHODS.map((m) => (
          <div key={m.title} className="bg-white rounded-[20px] p-5 border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center">
              <m.icon className="w-6 h-6 text-[#15803D]" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">{m.title}</h3>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-gray-500 font-medium -mt-4">
        All payments are processed securely through Razorpay. We never store your card details.
      </p>

      {/* PAYMENT HISTORY */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-6">Payment History</h2>

        {paymentHistory.length === 0 ? (
          <p className="text-[13px] text-gray-500 text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl">
            No payments yet. Place your first order to see your payment history here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Order</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Date</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Method</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Status</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((p) => {
                const success = p.status === "SUCCESS"
                const pending = p.status === "PENDING"
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-gray-900">
                      {p.publicCode ?? `#${p.id.slice(0, 8).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="font-medium text-gray-500">
                      {format(new Date(p.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 capitalize">
                      {p.provider === "UPI_COLLECT" ? "UPI Collect" : "Razorpay"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                        success ? "bg-[#F0FDF4] text-[#15803D]" : pending ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}>
                        {success ? <CheckCircle2 className="w-3 h-3" /> : pending ? <Clock3 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {p.status === "SUCCESS" ? "Paid" : p.status === "PENDING" ? "Pending" : p.status === "REFUNDED" ? "Refunded" : "Failed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-gray-900">
                      ₹{parseFloat(p.amount).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}