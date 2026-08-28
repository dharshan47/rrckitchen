"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(
  () => import("./dashboard-client"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] animate-pulse rounded-2xl bg-[#F9FAFB]" />
    ),
  },
);

export default function DashboardClientLazy() {
  return <DashboardClient />;
}