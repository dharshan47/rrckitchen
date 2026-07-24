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

export function getTodayKey(): string {
  const day = new Date().getDay()
  return DAYS[day === 0 ? 6 : day - 1]
}

export type KitchenStatus = {
  isOpen: boolean;
  closeTime: string | null;
  opensNextAt: { time: string; day: string } | null;
};

export function getKitchenStatus(hours: OperatingHours | null): KitchenStatus {
  if (!hours || Object.keys(hours).length === 0) {
    return { isOpen: true, closeTime: null, opensNextAt: null };
  }

  const now = new Date();
  const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr: string) => {
    if (timeStr.toLowerCase() === "midnight") return 24 * 60;
    const [hourStr, minStr] = timeStr.replace(/\s?[APap][Mm]/g, "").split(":");
    let hour = parseInt(hourStr, 10);
    const min = minStr ? parseInt(minStr, 10) : 0;
    const isPM = timeStr.toUpperCase().includes("PM");
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const todayKey = DAYS[currentDayIndex];
  const todayHours = hours[todayKey];

  let isOpen = false;
  let closeTime: string | null = null;

  if (todayHours) {
    const openMinutes = parseTime(todayHours.open);
    const closeMinutes = parseTime(todayHours.close);
    
    // Handle wrap-around (e.g. 10 AM to 2 AM)
    if (closeMinutes < openMinutes) {
      if (nowMinutes >= openMinutes || nowMinutes < closeMinutes) {
        isOpen = true;
        closeTime = todayHours.close;
      }
    } else {
      if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
        isOpen = true;
        closeTime = todayHours.close;
      }
    }
  }

  if (isOpen) {
    return { isOpen: true, closeTime, opensNextAt: null };
  }

  // Find next open time
  let opensNextAt: { time: string; day: string } | null = null;
  
  for (let i = 0; i <= 7; i++) {
    const checkDayIndex = (currentDayIndex + i) % 7;
    const checkDayKey = DAYS[checkDayIndex];
    const checkHours = hours[checkDayKey];
    
    if (checkHours) {
      const openMinutes = parseTime(checkHours.open);
      
      if (i === 0) {
        // Today
        if (nowMinutes < openMinutes) {
          opensNextAt = { time: checkHours.open, day: "Today" };
          break;
        }
      } else if (i === 1) {
        // Tomorrow
        opensNextAt = { time: checkHours.open, day: "Tomorrow" };
        break;
      } else {
        // Later this week
        opensNextAt = { time: checkHours.open, day: `on ${DAY_LABELS[checkDayKey]}` };
        break;
      }
    }
  }

  return { isOpen: false, closeTime: null, opensNextAt };
}

interface Props {
  operatingHours: OperatingHours | null
}

export function KitchenTimingDisplay({ operatingHours }: Props) {
  const [open, setOpen] = useState(false)

  if (!operatingHours || Object.keys(operatingHours).length === 0) return null

  const status = getKitchenStatus(operatingHours)
  const todayKey = getTodayKey()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-0 text-left cursor-pointer py-0.5"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
        >
          {status.isOpen ? (
            <span className="text-[14px] font-bold text-[#3AB757]">Open now</span>
          ) : (
            <span className="text-[14px] font-bold text-[#E23744]">Closed</span>
          )}
          <span className="text-[#93959f] text-[14px] mx-2">·</span>
          <span className="text-[14px] font-normal text-[#93959f]">
            {status.isOpen && status.closeTime
              ? `Closes ${status.closeTime}`
              : status.opensNextAt
                ? `Opens ${status.opensNextAt.time}`
                : "See timings"}
          </span>
          <ChevronDown className="h-3 w-3 text-[#E23744] ml-1 group-hover:translate-y-0.5 transition-transform" />
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
