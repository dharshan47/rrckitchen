import type { Metadata } from "next"
import { KitchensClient } from "@/components/admin/kitchens/kitchens-client"

export const metadata: Metadata = {
  title: "Kitchen Partners",
  description: "Manage, review and update all kitchen partners",
}

export default function KitchensPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kitchen Partners</h1>
        <p className="text-muted-foreground">Manage, review and update all kitchen partners</p>
      </div>
      <KitchensClient />
    </div>
  )
}
