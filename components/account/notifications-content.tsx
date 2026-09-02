"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  BellRing, 
  ShieldAlert,
  ShoppingBag,
  Tag,
  Gift,
  User,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

interface AppNotification {
  id: string;
  channel: string;
  templateKey: string | null;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

function NotificationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 md:gap-5 p-4 md:p-6">
      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
      <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 py-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Skeleton className="h-[16px] w-48 rounded" />
            <Skeleton className="h-[14px] w-20 rounded-[6px]" />
          </div>
          <Skeleton className="hidden md:block h-[12px] w-16 rounded" />
        </div>
        <Skeleton className="h-[14px] w-full max-w-xl rounded" />
        <Skeleton className="hidden md:block h-[12px] w-12 rounded mt-1" />
        <div className="flex md:hidden items-center justify-between mt-1">
          <Skeleton className="h-[10px] w-10 rounded" />
          <Skeleton className="h-[11px] w-16 rounded" />
        </div>
      </div>
      <Skeleton className="hidden md:block w-5 h-5 rounded" />
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0">
      {/* Breadcrumb Section */}
      <div className="pt-6 pb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>

      {/* BANNER */}
      <div className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-6 border border-[#E4E8E4] shadow-sm bg-[#F9FBF8]">
        <div className="relative z-10 flex-1 w-full flex flex-col items-center md:items-start">
          <Skeleton className="h-[38px] md:h-[48px] w-64 rounded mb-2" />
          <Skeleton className="h-[16px] w-80 rounded mb-8" />
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 w-full md:w-fit shadow-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-[14px] w-24 rounded" />
                  <Skeleton className="h-[12px] w-16 rounded" />
                </div>
                {i < 3 && <div className="hidden md:block w-px h-10 bg-[#E4E8E4] mx-2"></div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] flex-shrink-0 flex items-center justify-center">
          <Skeleton className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-[24px]" />
        </div>
      </div>

      {/* FILTERS & SORT */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full md:w-auto md:max-w-[70%] overflow-hidden">
          <div className="flex items-center gap-2 pb-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-[36px] w-24 rounded-[10px]" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden md:block h-[36px] w-32 rounded-[10px]" />
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#EEF0F2]">
          {[1, 2, 3, 4].map(i => <NotificationRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}

export function NotificationsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user
  
  const [activeTab, setActiveTab] = useState('all')

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      if (!res.ok) return []
      return res.json() as Promise<AppNotification[]>
    },
    enabled: isLoggedIn,
    refetchInterval: 5000, // Real-time polling
  })

  if (isPending) {
    return <NotificationsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length, icon: null },
    { id: 'orders', label: 'Orders', count: notifications.filter(n => n.title.toLowerCase().includes('order') || n.templateKey?.includes('order')).length, icon: ShoppingBag },
    { id: 'offers', label: 'Offers', count: notifications.filter(n => n.title.toLowerCase().includes('offer') || n.title.toLowerCase().includes('off ')).length, icon: Tag },
    { id: 'rewards', label: 'Rewards', count: notifications.filter(n => n.title.toLowerCase().includes('reward') || n.title.toLowerCase().includes('point')).length, icon: Gift },
    { id: 'account', label: 'Account', count: notifications.filter(n => n.title.toLowerCase().includes('payment') || n.title.toLowerCase().includes('account')).length, icon: User },
  ]

  // Filter logic based on tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    const title = n.title.toLowerCase()
    const tempKey = n.templateKey?.toLowerCase() || ''
    if (activeTab === 'orders') return title.includes('order') || tempKey.includes('order')
    if (activeTab === 'offers') return title.includes('offer') || title.includes('off ') || title.includes('discount')
    if (activeTab === 'rewards') return title.includes('reward') || title.includes('point')
    if (activeTab === 'account') return title.includes('payment') || title.includes('account') || title.includes('failed')
    return true
  })

  const getNotificationStyles = (n: AppNotification) => {
    const title = n.title.toLowerCase()
    const failed = n.status === "FAILED" || title.includes('failed') || title.includes('error')
    const isOffer = title.includes('offer') || title.includes('off ') || title.includes('discount')
    const isReward = title.includes('reward') || title.includes('point')
    const isSpecial = title.includes('weekend') || title.includes('special')
    
    if (failed) {
      return {
        iconBg: "bg-[#FCE8E7]", iconColor: "text-[#D70806]", dotColor: "bg-[#FB130F]", 
        badgeBg: "bg-[#FDECEA]", badgeColor: "text-[#C93631]", badgeText: "Action Required",
        Icon: ShieldAlert
      }
    }
    if (isSpecial) {
      return {
        iconBg: "bg-[#DEE7FE]", iconColor: "text-[#1453F2]", dotColor: "bg-[#09762D]", 
        badgeBg: "bg-[#EDF3FF]", badgeColor: "text-[#245BC6]", badgeText: "New Offer",
        Icon: BellRing
      }
    }
    if (isOffer) {
      return {
        iconBg: "bg-[#FBF1E0]", iconColor: "text-[#ED6409]", dotColor: "bg-[#09762D]", 
        badgeBg: "bg-[#FFF1E3]", badgeColor: "text-[#D9640A]", badgeText: "Special Offer",
        Icon: Tag
      }
    }
    if (isReward) {
      return {
        iconBg: "bg-[#EDE8FC]", iconColor: "text-[#6844D8]", dotColor: "bg-[#09762D]", 
        badgeBg: "bg-[#F0EBFF]", badgeColor: "text-[#6844D8]", badgeText: "Reward Update",
        Icon: Gift
      }
    }
    // Default / Order
    return {
      iconBg: "bg-[#E7F6E8]", iconColor: "text-[#065F11]", dotColor: "bg-[#09762D]", 
      badgeBg: "bg-[#EAF5EC]", badgeColor: "text-[#277C36]", badgeText: "Order Update",
      Icon: ShoppingBag
    }
  }

  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0">
      
      {/* Breadcrumb Section */}
      <div className="pt-6 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-[#555555] font-medium text-[13px] hover:text-[#111111]">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#AAAAAA]" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/account/profile" className="text-[#555555] font-medium text-[13px] hover:text-[#111111]">Account</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#AAAAAA]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#166534] font-bold text-[13px]">Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* BANNER */}
      <div 
        className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-6 border border-[#E4E8E4] shadow-[0_12px_40px_rgba(30,40,35,0.06)]"
        style={{
          background: `
            radial-gradient(circle at 88% 75%, rgba(255, 204, 121, 0.38), transparent 24%),
            radial-gradient(circle at 70% 30%, rgba(181, 224, 184, 0.18), transparent 30%),
            linear-gradient(135deg, #FFFFFF 0%, #F9FBF8 55%, #FFF8EB 100%)
          `
        }}
      >
        <div className="relative z-10 flex-1 w-full text-center md:text-left">
          <h1 className="text-[28px] md:text-[38px] font-extrabold text-[#142036] leading-tight mb-2 tracking-tight">
            Notifications
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#4F5C70] font-medium mb-8 max-w-md mx-auto md:mx-0">
            Stay updated with your orders, <br className="hidden md:block" />offers and rewards
          </p>
          
          {/* Info chips container */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 w-full md:w-fit mx-auto md:mx-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E7F6E8] text-[#065F11] flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#1E293B]">Real-time Alerts</p>
                <p className="text-[11px] font-medium text-[#667085]">Instant updates</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-[#E4E8E4]"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBF1E0] text-[#ED6409] flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#1E293B]">Exclusive Offers</p>
                <p className="text-[11px] font-medium text-[#667085]">Don&apos;t miss out</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-[#E4E8E4]"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EDE8FC] text-[#6844D8] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#1E293B]">Reward Updates</p>
                <p className="text-[11px] font-medium text-[#667085]">Track your benefits</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Banner Illustration */}
        <div className="relative z-10 mt-8 md:mt-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] flex-shrink-0">
          <Image 
            src="/account/bell.webp" 
            alt="Notifications" 
            fill 
            className="object-contain drop-shadow-[0_10px_30px_rgba(39,124,54,0.15)]"
          />
        </div>
      </div>

      {/* FILTERS & SORT */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <ScrollArea className="w-full md:w-auto md:max-w-[70%]">
          <div className="flex items-center gap-2 pb-3">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] whitespace-nowrap font-semibold text-[14px] transition-all duration-200 border ${
                    isActive 
                      ? "bg-[#F3FAF4] border-[#C4DFC8] text-[#16632A] shadow-sm" 
                      : "bg-[#FFFFFF] border-[#E7EBEF] text-[#4F5C70] hover:bg-[#F7FAF8] hover:border-[#D8E3DA]"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                    isActive ? "bg-[#E5F2E7] text-[#277C36]" : "bg-[#F3F4F6] text-[#8C96A5]"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" className="hidden md:flex" />
        </ScrollArea>

        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-[#E7EBEF] rounded-[10px] text-[#4F5C70] font-semibold text-[13px] hover:bg-[#F7FAF8] transition-colors">
          Newest First
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-[0_8px_30px_rgba(25,40,35,0.05)] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[#EEF0F2]">
             {[1, 2, 3, 4].map(i => <NotificationRowSkeleton key={i} />)}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] border border-dashed border-[#B8D9BF] rounded-[16px] m-6">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Image src="/account/notification.webp" alt="Empty" fill className="object-contain opacity-80" />
            </div>
            <h3 className="text-[18px] font-bold text-[#263247] mb-2">No notifications yet</h3>
            <p className="text-sm text-[#64748B] mb-6">You don&apos;t have any notifications yet. When you receive updates about your orders, promos, or account, they will appear here.</p>
            <button className="px-6 py-2.5 bg-[#FFFFFF] border border-[#277C36] text-[#16632A] rounded-[9px] font-semibold text-[14px] hover:bg-[#F2F9F3] transition-colors shadow-[0_4px_12px_rgba(20,30,30,0.05)]">
              Stay Tuned
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#EEF0F2]">
            {filteredNotifications.map((n) => {
              const styles = getNotificationStyles(n)
              const { Icon } = styles
              return (
                <li key={n.id} className="flex items-center gap-3 md:gap-5 p-4 md:p-6 hover:bg-[#FDFEFD] transition-colors group cursor-pointer">
                  {/* Unread Dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${styles.dotColor}`} />
                  
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor} shadow-[0_6px_18px_rgba(30,40,35,0.06)]`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <h4 className="text-[15px] md:text-[16px] font-bold text-[#263247] truncate">{n.title}</h4>
                        <span className={`px-2 py-0.5 rounded-[6px] text-[10px] md:text-[11px] font-bold uppercase tracking-wide ${styles.badgeBg} ${styles.badgeColor}`}>
                          {styles.badgeText}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#8C96A5] font-semibold shrink-0 hidden md:block">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {n.body && <p className="text-[13px] md:text-[14px] text-[#4F5C70] font-medium leading-relaxed mb-2 md:mb-0 line-clamp-2">{n.body}</p>}
                    
                    {/* Mobile Time & Channel */}
                    <div className="flex md:hidden items-center justify-between mt-2">
                      <p className="text-[10px] text-[#AAB1BC] font-bold uppercase tracking-wider">
                        {n.channel === "PUSH" ? "Push" : n.channel}
                      </p>
                      <span className="text-[11px] text-[#8C96A5] font-semibold">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="hidden md:block text-[11px] text-[#AAB1BC] font-bold mt-2 uppercase tracking-wider">
                      {n.channel === "PUSH" ? "Push" : n.channel}
                    </p>
                  </div>

                  {/* Right Arrow */}
                  <div className="shrink-0 text-[#AAB1BC] group-hover:text-[#667085] transition-colors hidden md:block">
                    <ChevronRight className="w-5 h-5" />
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