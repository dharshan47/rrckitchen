"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { XIcon, Utensils } from "lucide-react";

interface CravingsData {
  show: boolean;
  message: string;
  kitchenId: string | null;
  timeSlot: string | null;
}

export function CravingsBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data } = useQuery<CravingsData>({
    queryKey: ["cravings-banner"],
    queryFn: async () => {
      const res = await fetch("/api/cravings-banner");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60_000,
  });

  if (!data?.show || dismissed) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-300 mb-4 px-4">
      <div className="relative rounded-xl bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 pr-10">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <XIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <Utensils className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">{data.message}</p>
            <Link href="/menu" className="text-xs text-primary font-semibold hover:underline mt-0.5 inline-block">
              View today&apos;s menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
