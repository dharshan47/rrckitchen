"use client";

import { CheckCircle2, Circle, Utensils, Bike, PackageCheck, XCircle } from "lucide-react";

const statusSteps = [
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PREPARING", label: "Preparing", icon: Utensils },
  { key: "READYFORPICKUP", label: "Ready for Pickup", icon: PackageCheck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Bike },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
] as const;

const statusOrder = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "OUT_FOR_DELIVERY", "COMPLETED"];

function getCurrentStepIndex(currentStatus: string): number {
  const idx = statusOrder.indexOf(currentStatus);
  if (idx === -1) {
    if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") return -1;
    return 0;
  }
  return idx;
}

interface OrderTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{ status: string; changedAt: string; note?: string | null }>;
}

export function OrderTimeline({ currentStatus, statusHistory }: OrderTimelineProps) {
  const isCancelled = currentStatus === "CANCELLED" || currentStatus === "REFUNDED";
  const currentStep = getCurrentStepIndex(currentStatus);

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-semibold">
            {currentStatus === "CANCELLED" ? "Order Cancelled" : "Order Refunded"}
          </span>
        </div>
        {statusHistory && statusHistory.length > 0 && (
          <div className="mt-3 space-y-2">
            {statusHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span>{new Date(h.changedAt).toLocaleString()}</span>
                <span className="font-medium">{h.status}</span>
                {h.note && <span className="italic">- {h.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {statusSteps.map((step, index) => {
        const isActive = currentStep >= index;
        const isLast = index === statusSteps.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {isActive ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${isActive ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </p>
              {isActive && statusHistory && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {statusHistory.find((h) => h.status === step.key)?.changedAt
                    ? new Date(statusHistory.find((h) => h.status === step.key)!.changedAt).toLocaleString()
                    : "Processing..."}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
