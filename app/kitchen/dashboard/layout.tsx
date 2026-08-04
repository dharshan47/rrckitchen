import DashboardLayoutClient from "@/components/kitchen/dashboard/dashboard-layout-client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
