"use client";

import dynamic from "next/dynamic";

const DashboardPageClient = dynamic(
  () => import("./dashboard-page-client"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] animate-pulse rounded-2xl bg-[#F9FAFB]" />
    ),
  },
);

export default function DashboardPageClientLazy() {
  return <DashboardPageClient />;
}