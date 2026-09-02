"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BellRing, BellOff, LogOut, HelpCircle, ChevronRight, SlidersHorizontal, FileText, ScrollText, Smartphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useSession, signOut } from "@/lib/auth-client"
import { toast } from "sonner"
import Image from "next/image"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
type PushState = "checking" | "unsupported" | "off" | "on"

function SettingsSkeleton() {
  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-6 md:pt-8">
      
      {/* BREADCRUMB */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-10 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>

      {/* HEADER (Non-banner) */}
      <div className="mb-6 md:mb-8 text-center md:text-left mt-2 flex flex-col items-center md:items-start gap-2">
        <Skeleton className="h-[34px] md:h-[42px] w-40 rounded" />
        <Skeleton className="h-[18px] w-64 rounded" />
      </div>

      {/* PURPLE BANNER */}
      <div className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-8 border border-[#EDE8FC] shadow-sm bg-[#F6F3FF]">
        <div className="relative z-10 flex-1 w-full text-center md:text-left flex flex-col md:flex-row items-center gap-5 md:gap-6">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0" />
          <div className="flex flex-col items-center md:items-start gap-2 w-full">
            <Skeleton className="h-[24px] md:h-[28px] w-64 rounded" />
            <Skeleton className="h-[18px] w-full max-w-sm rounded" />
            <Skeleton className="h-[18px] w-3/4 max-w-xs rounded md:hidden" />
          </div>
        </div>
        <div className="relative z-10 mt-8 md:mt-0 w-[220px] h-[160px] md:w-[320px] md:h-[180px] flex-shrink-0 flex justify-center items-center">
           <Skeleton className="w-[180px] h-[140px] md:w-[260px] md:h-[160px] rounded-[24px]" />
        </div>
      </div>

      {/* PREFERENCES CARD */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-sm overflow-hidden mb-6">
        <div className="p-5 md:p-6 flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="h-[18px] w-24 rounded" />
            <Skeleton className="h-[14px] w-48 rounded" />
          </div>
        </div>
        <div className="h-px w-full bg-[#EEF0F2]" />
        <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="h-[18px] w-32 rounded" />
              <Skeleton className="h-[14px] w-56 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
            <Skeleton className="w-[42px] h-[24px] rounded-full" />
            <Skeleton className="w-[20px] h-[20px] rounded" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </div>
      </div>

      {/* APP CARD */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-sm overflow-hidden mb-6">
        <div className="p-5 md:p-6 flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="h-[18px] w-32 rounded" />
            <Skeleton className="h-[14px] w-56 rounded" />
          </div>
        </div>
        <div className="h-px w-full bg-[#EEF0F2]" />
        <div className="p-5 md:p-6 bg-[#FDFEFD] flex flex-col gap-1.5">
          <Skeleton className="h-[14px] w-full rounded" />
          <Skeleton className="h-[14px] w-4/5 rounded" />
        </div>
      </div>

      {/* LOGOUT CARD */}
      <div className="bg-gradient-to-r from-[#FFF5F5] to-[#FEF0F0] rounded-[18px] border border-[#FCE8E7] shadow-sm overflow-hidden mb-6 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative">
        <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="h-[18px] w-16 rounded" />
            <Skeleton className="h-[14px] w-40 rounded" />
          </div>
        </div>
        <Skeleton className="h-[44px] w-full md:w-[120px] rounded-[10px] self-end md:self-auto" />
      </div>

      {/* LEGAL */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#EEF0F2]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="h-[16px] w-32 rounded" />
              </div>
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

export function SettingsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const [pushState, setPushState] = useState<PushState>("checking")
  const [pushBusy, setPushBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !window.isSecureContext
      ) {
        if (!cancelled) setPushState("unsupported")
        return
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) {
          if (!cancelled) setPushState("unsupported")
          return
        }
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setPushState(sub ? "on" : "off")
      } catch {
        if (!cancelled) setPushState("unsupported")
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  const togglePush = async () => {
    setPushBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()

      if (existing) {
        const endpoint = existing.endpoint
        await existing.unsubscribe()
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {})
        setPushState("off")
        toast.success("Push notifications turned off")
        return
      }

      if ("Notification" in window && Notification.permission === "denied") {
        toast.error("Notifications are blocked. Allow them in your browser settings and try again.")
        return
      }

      const res = await fetch("/api/push/vapid-public-key")
      const { publicKey } = await res.json()
      if (!publicKey) {
        toast.error("Push notifications are not available on this browser")
        setPushState("unsupported")
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })
      const json = sub.toJSON()
      const subscribeRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      })
      if (!subscribeRes.ok) throw new Error("Failed to subscribe")
      setPushState("on")
      toast.success("Push notifications turned on")
    } catch {
      toast.error("Could not update push notification settings")
    } finally {
      setPushBusy(false)
    }
  }

  if (isPending) {
    return <SettingsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const handleLogout = async () => {
    await Promise.race([
      signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]).catch(() => {})
    router.push("/")
  }

  const pushSupported = pushState === "on" || pushState === "off"
  const pushEnabled = pushState === "on"

  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-6 md:pt-8">
      
      {/* BREADCRUMB */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-[#64748B] hover:text-[#0F172A] font-semibold text-[13px]">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account/profile" className="text-[#64748B] hover:text-[#0F172A] font-semibold text-[13px]">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[#1E293B] font-bold text-[13px]">Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER (Non-banner) */}
      <div className="mb-6 md:mb-8 text-center md:text-left mt-2">
        <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#142036] leading-tight mb-2 tracking-tight">
          Settings
        </h1>
        <p className="text-[14px] md:text-[15px] text-[#4F5C70] font-medium">
          Manage your account, preferences and security
        </p>
      </div>

      {/* PURPLE BANNER */}
      <div 
        className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-8 border border-[#EDE8FC] shadow-[0_8px_30px_rgba(104,68,216,0.06)]"
        style={{
          background: `
            radial-gradient(circle at 88% 50%, rgba(255, 255, 255, 0.4), transparent 30%),
            linear-gradient(135deg, #F6F3FF 0%, #EDE8FC 100%)
          `
        }}
      >
        <div className="relative z-10 flex-1 w-full text-center md:text-left flex flex-col md:flex-row items-center gap-5 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#7B54E8] flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(123,84,232,0.25)]">
            <SlidersHorizontal className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div>
            <h2 className="text-[20px] md:text-[24px] font-extrabold text-[#142036] mb-2 tracking-tight">
              Customize Your Experience
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#4F5C70] font-medium max-w-sm mx-auto md:mx-0 leading-[1.6]">
              Personalize your app experience and stay in control of your preferences.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[220px] h-[160px] md:w-[320px] md:h-[180px] flex-shrink-0">
          <Image 
            src="/account/settings.webp" 
            alt="Settings Illustration" 
            fill 
            className="object-contain drop-shadow-[0_10px_30px_rgba(123,84,232,0.15)]"
          />
        </div>
      </div>

      {/* PREFERENCES CARD */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-[0_4px_12px_rgba(20,30,30,0.03)] overflow-hidden mb-6">
        {/* Header Row */}
        <div className="p-5 md:p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#F6F3FF] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5 text-[#6844D8]" />
          </div>
          <div>
            <h3 className="text-[16px] font-extrabold text-[#142036]">Preferences</h3>
            <p className="text-[13px] text-[#667085] font-medium mt-0.5">Manage your app preferences</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-[#EEF0F2]" />

        {/* Push Notifications Row */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white group hover:bg-[#FDFEFD] transition-colors">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-[#E7F6E8] flex items-center justify-center shrink-0">
              {pushEnabled ? <BellRing className="w-6 h-6 text-[#09762D]" /> : <BellOff className="w-6 h-6 text-[#71B280]" />}
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-extrabold text-[#142036]">Push Notifications</h4>
              <p className="text-[13px] text-[#667085] font-medium mt-0.5">
                {pushState === "checking"
                  ? "Checking support on this device..."
                  : pushState === "unsupported"
                    ? "Not available on this device"
                    : "Get order updates and important alerts"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
            {pushState === "checking" && (
              <span className="text-[11px] text-[#AAB1BC] font-medium uppercase tracking-wider">Checking…</span>
            )}
            <Switch
              checked={pushEnabled}
              disabled={!pushSupported || pushBusy}
              onCheckedChange={() => togglePush()}
              className="data-[state=checked]:bg-[#09762D]"
            />
            <span className="text-[14px] font-bold text-[#142036] min-w-[24px]">
              {pushEnabled ? "On" : "Off"}
            </span>
            <ChevronRight className="w-5 h-5 text-[#AAB1BC] group-hover:text-[#667085] transition-colors" />
          </div>
        </div>
      </div>

      {/* APP CARD (Kept for functionality, styled similarly) */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-[0_4px_12px_rgba(20,30,30,0.03)] overflow-hidden mb-6">
        <div className="p-5 md:p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#F2F5FF] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#1453F2]" />
          </div>
          <div>
            <h3 className="text-[16px] font-extrabold text-[#142036]">App Installation</h3>
            <p className="text-[13px] text-[#667085] font-medium mt-0.5">Install RRC Kitchen on your device</p>
          </div>
        </div>
        <div className="h-px w-full bg-[#EEF0F2]" />
        <div className="p-5 md:p-6 bg-[#FDFEFD]">
          <p className="text-[13px] md:text-[14px] text-[#4F5C70] font-medium leading-[1.6]">
            Use your browser&apos;s &quot;Add to Home Screen&quot; option (or the install icon in the address bar) to
            install RRC Kitchen and get push updates for the best experience.
          </p>
        </div>
      </div>

      {/* LOGOUT CARD */}
      <div className="bg-gradient-to-r from-[#FFF5F5] to-[#FEF0F0] rounded-[18px] border border-[#FCE8E7] shadow-[0_4px_12px_rgba(215,8,6,0.04)] overflow-hidden mb-6 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative">
        {/* Faint pattern overlay simulation using radial gradient on the right */}
        <div className="absolute inset-0 bg-[radial-gradient(#FCE8E7_2px,transparent_2px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-[#FCE8E7] flex items-center justify-center shrink-0 text-[#D70806]">
            <LogOut className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-extrabold text-[#142036]">Logout</h3>
            <p className="text-[13px] text-[#667085] font-medium mt-0.5">Sign out from your account</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="relative z-10 flex items-center justify-center gap-2 px-6 h-[44px] rounded-[10px] border border-[#F0A39F] bg-white/50 hover:bg-[#FCE8E7] text-[#D70806] text-[14px] font-bold transition-colors w-full md:w-auto self-end md:self-auto"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* LEGAL (Kept for functionality, styled minimally) */}
      <div className="bg-[#FEFEFE] rounded-[18px] border border-[#E4E8E4] shadow-[0_4px_12px_rgba(20,30,30,0.03)] overflow-hidden">
        <div className="divide-y divide-[#EEF0F2]">
          {[
            { icon: FileText, label: "Privacy Policy", href: "/privacy-policy" },
            { icon: ScrollText, label: "Terms & Conditions", href: "/terms-of-use" },
            { icon: HelpCircle, label: "Help & FAQs", href: "/help" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-4 p-5 hover:bg-[#FDFEFD] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F6F8F3] flex items-center justify-center text-[#4F5C70] group-hover:text-[#277C36] group-hover:bg-[#E7F6E8] transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[14px] font-extrabold text-[#263247]">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#AAB1BC] group-hover:text-[#667085] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  )
}