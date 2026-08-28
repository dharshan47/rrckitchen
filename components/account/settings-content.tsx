"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BellRing, BellOff, LogOut, HelpCircle, ChevronRight, SlidersHorizontal, FileText, ScrollText, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSession, signOut } from "@/lib/auth-client"
import { toast } from "sonner"

type PushState = "checking" | "unsupported" | "off" | "on"

function SettingsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[150px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="h-[180px] rounded-[20px] bg-[#F3F4F6] mt-6" />
      <div className="h-[160px] rounded-[20px] bg-[#F3F4F6] mt-6" />
      <div className="h-[120px] rounded-[20px] bg-[#F3F4F6] mt-6" />
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
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* HEADER */}
      <div className="relative w-full h-[150px] md:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-2">
            Settings
          </h1>
          <p className="text-[14px] md:text-[15px] font-medium text-gray-700">
            Manage your notifications and app preferences
          </p>
        </div>
        <div className="absolute right-[-16px] md:right-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[190px] md:h-[190px] bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <SlidersHorizontal className="w-12 h-12 md:w-16 md:h-16 text-[#F97316]" />
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
            <BellRing className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900">Notifications</h2>
        </div>
        <p className="text-[13px] text-gray-500 font-medium mb-6">
          Choose what updates you want to receive
        </p>

        <div className="divide-y divide-gray-50 rounded-[16px] border border-gray-100 overflow-hidden">
          {/* Push */}
          <div className="flex items-center justify-between gap-4 p-5 bg-white">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                {pushEnabled ? <BellRing className="w-5 h-5 text-[#15803D]" /> : <BellOff className="w-5 h-5 text-[#9CA3AF]" />}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">Push Notifications</p>
                <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                  {pushState === "checking"
                    ? "Checking support on this device..."
                    : pushState === "unsupported"
                      ? "Not available on this device or browser. Install the app to enable push updates."
                      : pushEnabled
                        ? "Order updates and offers will be sent to this device"
                        : "Enable to receive order updates and offers on this device"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Switch
                checked={pushEnabled}
                disabled={!pushSupported || pushBusy}
                onCheckedChange={() => togglePush()}
              />
              {pushState === "checking" && (
                <span className="text-[10px] text-gray-400 font-medium">Checking…</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 font-medium mt-4">
          You can change or revoke push permissions anytime from your browser settings.
        </p>
      </div>

      {/* APP PREFERENCES */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900">App</h2>
        </div>
        <p className="text-[13px] text-gray-500 font-medium mb-6">
          Install RRC Kitchen on your device for the best experience
        </p>

        <div className="rounded-[16px] border border-[#DCFCE7] bg-[#F0FDF4] p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white border border-[#DCFCE7] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-gray-900">Install App</p>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
              Use your browser&apos;s &quot;Add to Home Screen&quot; option (or the install icon in the address bar) to
              install RRC Kitchen and get push updates.
            </p>
          </div>
        </div>
      </div>

      {/* ACCOUNT ACTIONS */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-6">Account Actions</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/account/support" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl border-[#E5E7EB] text-[13px] font-semibold h-11">
              <HelpCircle className="w-4 h-4 mr-2 text-[#15803D]" /> Contact Support
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            className="flex-1 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold h-11"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* LEGAL */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-4">About & Legal</h2>
        <div className="divide-y divide-gray-50 rounded-[16px] border border-gray-100 overflow-hidden">
          {[
            { icon: FileText, label: "Privacy Policy", href: "/privacy-policy" },
            { icon: ScrollText, label: "Terms & Conditions", href: "/terms-of-use" },
            { icon: HelpCircle, label: "Help & FAQs", href: "/help" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-3 p-4 hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#15803D]" />
                <span className="text-[13px] font-semibold text-gray-800">{item.label}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}