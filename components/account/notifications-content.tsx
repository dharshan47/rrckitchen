"use client"

import { useRouter } from "next/navigation"
import { Bell, BellRing, ShieldAlert } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

interface AppNotification {
  id: string;
  channel: string;
  templateKey: string | null;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

function NotificationsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[160px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="space-y-3 mt-6">
        <div className="h-[80px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[80px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[80px] rounded-[20px] bg-[#F3F4F6]" />
      </div>
    </div>
  )
}

export function NotificationsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      if (!res.ok) return []
      return res.json() as Promise<AppNotification[]>
    },
    enabled: isLoggedIn,
  })

  if (isPending) {
    return <NotificationsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* HEADER */}
      <div className="relative w-full h-[150px] md:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-2">
            Notifications
          </h1>
          <p className="text-[14px] md:text-[15px] font-medium text-gray-700">
            Updates on your orders, offers and rewards
          </p>
        </div>
        <div className="absolute right-[-16px] md:right-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[190px] md:h-[190px] bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <BellRing className="w-12 h-12 md:w-16 md:h-16 text-[#F97316]" />
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-6 animate-pulse">
            <div className="h-[70px] rounded-[16px] bg-[#F3F4F6]" />
            <div className="h-[70px] rounded-[16px] bg-[#F3F4F6]" />
            <div className="h-[70px] rounded-[16px] bg-[#F3F4F6]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-[#FFF7ED] rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#F97316]" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-[13px] text-gray-500 font-medium">
              Order updates, offers and reward alerts will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((n) => {
              const failed = n.status === "FAILED"
              return (
                <li key={n.id} className="flex items-start gap-4 p-5 hover:bg-[#FAFAFA] transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    failed ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#15803D]"
                  }`}>
                    {failed ? <ShieldAlert className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-0.5">
                      <h4 className="text-[14px] font-bold text-gray-900 truncate">{n.title}</h4>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {n.body && <p className="text-[12px] text-gray-600 font-medium leading-relaxed">{n.body}</p>}
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase">
                      {n.channel === "PUSH" ? "Push" : n.channel}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}