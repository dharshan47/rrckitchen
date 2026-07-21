"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type OperatingHours = Record<string, { open: string; close: string }>

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

function getTodayKey(): string {
  const day = new Date().getDay()
  return DAYS[day === 0 ? 6 : day - 1]
}

function isCurrentlyOpen(hours: OperatingHours): { open: boolean; closeTime: string } {
  const todayKey = getTodayKey()
  const today = hours[todayKey]
  if (!today) return { open: false, closeTime: "" }

  const now = new Date()
  const [openHour, openMin] = today.open.replace(/\s?[APap][Mm]/g, "").split(":").map(Number)
  const openIsPM = today.open.toUpperCase().includes("PM")
  const open24 = openIsPM && openHour !== 12 ? openHour + 12 : !openIsPM && openHour === 12 ? 0 : openHour

  const closeIsMidnight = today.close.toLowerCase() === "midnight"

  if (closeIsMidnight) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = open24 * 60 + (openMin || 0)
    return { open: nowMinutes >= openMinutes, closeTime: "Midnight" }
  }

  const [closeHour, closeMin] = today.close.replace(/\s?[APap][Mm]/g, "").split(":").map(Number)
  const closeIsPM = today.close.toUpperCase().includes("PM")
  const close24 = closeIsPM && closeHour !== 12 ? closeHour + 12 : !closeIsPM && closeHour === 12 ? 0 : closeHour

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = open24 * 60 + (openMin || 0)
  const closeMinutes = close24 * 60 + (closeMin || 0)

  if (closeMinutes > openMinutes) {
    return { open: nowMinutes >= openMinutes && nowMinutes < closeMinutes, closeTime: today.close }
  }
  return { open: nowMinutes >= openMinutes || nowMinutes < closeMinutes, closeTime: today.close }
}

interface Props {
  operatingHours: OperatingHours | null
}

export function KitchenTimingDisplay({ operatingHours }: Props) {
  const [open, setOpen] = useState(false)

  if (!operatingHours || Object.keys(operatingHours).length === 0) return null

  const status = isCurrentlyOpen(operatingHours)
  const todayKey = getTodayKey()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm">
          {status.open ? (
            <span className="text-green-600 font-semibold">Open now</span>
          ) : (
            <span className="text-red-500 font-semibold">Closed</span>
          )}
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {status.closeTime ? `Closes ${status.closeTime}` : "See timings"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Outlet timings</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {DAYS.map((day) => {
            const hours = operatingHours[day]
            const isToday = day === todayKey
            return (
              <div
                key={day}
                className={`flex items-center justify-between py-1.5 px-2 rounded-md ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {DAY_LABELS[day]}
                </span>
                <span
                  className={`text-sm ${
                    isToday ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {hours ? `${hours.open} - ${hours.close}` : "Closed"}
                </span>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
