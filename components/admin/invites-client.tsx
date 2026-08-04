"use client"

import { useState, useMemo } from "react"
import {
  Search, Download, Plus, Eye, Copy, Trash2, MoreVertical,
  User, Mail, ShieldCheck, Link2, Calendar, Shield, Users, 
  FileCheck, LayoutGrid, Undo2, Wallet, Ticket, TrendingUp, 
  Headset, Ban, FileText, CheckCircle2, ChevronDown, Lock, ShieldAlert,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import type { AdminPermission } from "@/lib/generated/prisma/client"
import {
  useAdminInvitesQuery,
  useAdminActiveAdminsQuery,
  useCreateAdminInviteMutation,
  type ActiveAdmin,
} from "@/stores"

const sparklinePath = "M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15 T 120 10 L 120 30 L 0 30 Z"

const ALL_PERMISSIONS: { id: AdminPermission; label: string; icon: LucideIcon; color: string; bg: string }[] = [
  { id: "MANAGE_ADMINS", label: "Manage Admins", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "APPROVE_KYC", label: "Approve KYC", icon: FileCheck, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "MANAGE_CATALOG", label: "Manage Catalog", icon: LayoutGrid, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "ISSUE_REFUNDS", label: "Issue Refunds", icon: Undo2, color: "text-gray-600", bg: "bg-gray-100" },
  { id: "MANAGE_PAYOUTS", label: "Manage Payouts", icon: Wallet, color: "text-gray-600", bg: "bg-gray-100" },
  { id: "MANAGE_COUPONS", label: "Manage Coupons", icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "VIEW_FINANCIALS", label: "View Financials", icon: TrendingUp, color: "text-gray-600", bg: "bg-gray-100" },
  { id: "MANAGE_SUPPORT", label: "Manage Support", icon: Headset, color: "text-gray-600", bg: "bg-gray-100" },
  { id: "BAN_USERS", label: "Ban Users", icon: Ban, color: "text-gray-600", bg: "bg-gray-100" },
  { id: "MANAGE_CMS", label: "Manage CMS", icon: FileText, color: "text-gray-600", bg: "bg-gray-100" },
]

const mockStats = [
  { title: "Active Admins", value: "23", trend: "↑ 2 new this month", trendUp: true, icon: User, color: "text-indigo-600", bg: "bg-indigo-50", stroke: "#4f46e5" },
  { title: "Pending Invites", value: "7", trend: "2 expiring soon", trendUp: false, icon: Mail, color: "text-blue-500", bg: "bg-blue-50", stroke: "#3b82f6" },
  { title: "Permissions Used", value: "8 / 10", trend: "80% of available", trendUp: true, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", stroke: "#16a34a", progress: true },
  { title: "Total Invites Sent", value: "156", trend: "All time", trendUp: null, icon: Link2, color: "text-orange-500", bg: "bg-orange-50", stroke: "#f97316" },
  { title: "Avg. Join Time", value: "1.8 days", trend: "From invite to join", trendUp: null, icon: Calendar, color: "text-pink-500", bg: "bg-pink-50", stroke: "#ec4899" },
]

function formatInviteDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const columnHelper = createColumnHelper<ActiveAdmin>()

export default function AdminInvitesPage() {
  const [selectedPerms, setSelectedPerms] = useState<Set<AdminPermission>>(new Set(["MANAGE_ADMINS", "APPROVE_KYC", "MANAGE_CATALOG", "MANAGE_COUPONS"]))
  const [generatedLink, setGeneratedLink] = useState("")

  const { data: activeAdmins = [] } = useAdminActiveAdminsQuery()
  const { data: invites = [] } = useAdminInvitesQuery()

  const createMutation = useCreateAdminInviteMutation()

  const handleGenerate = () => {
    if (selectedPerms.size === 0) return toast.error("Select at least one permission")
    createMutation.mutateAsync(Array.from(selectedPerms))
      .then((link) => {
        setGeneratedLink(link)
        toast.success("Invite link generated successfully")
      })
      .catch(() => toast.error("Failed to generate invite"))
  }

  const togglePerm = (p: AdminPermission) => {
    const next = new Set(selectedPerms)
    if (next.has(p)) next.delete(p)
    else next.add(p)
    setSelectedPerms(next)
  }

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "ADMIN",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-gray-100">
             <AvatarImage src={row.original.image || ""} />
             <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">{row.original.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-gray-900">{row.original.name}</span>
            {row.original.name === "Rahul Sharma" && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 shadow-none border-0 text-[9px] px-1.5 py-0 h-4">You</Badge>}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "CONTACT",
      cell: ({ getValue }) => <span className="text-[11px] text-gray-600">{getValue()}</span>,
    }),
    columnHelper.display({
      id: "permissions",
      header: "PERMISSIONS",
      cell: ({ row }) => {
         const perms = row.original.permissions
         return (
           <div className="flex items-center gap-1.5">
             {perms.slice(0, 4).map((p, i) => {
                const info = ALL_PERMISSIONS.find(x => x.id === p)
                if (!info) return null
                const Icon = info.icon
                return (
                  <div key={i} className={`h-6 w-6 rounded flex items-center justify-center ${info.bg}`} title={info.label}>
                    <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                  </div>
                )
             })}
             {perms.length > 4 && <span className="text-[10px] font-medium text-gray-500 ml-1">+{perms.length - 4}</span>}
           </div>
         )
      },
    }),
    columnHelper.accessor("invitedBy", {
      header: "INVITED BY",
      cell: ({ getValue }) => <span className="text-xs text-gray-700 font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("joinedOn", {
      header: "JOINED ON",
      cell: ({ getValue }) => <span className="text-[11px] text-gray-600">{formatInviteDate(getValue())}</span>,
    }),
    columnHelper.accessor("lastActive", {
      header: "LAST ACTIVE",
      cell: ({ row }) => {
         const isRecent = row.original.name === "Rahul Sharma" || row.original.name === "Vikram Joshi"
         return (
           <div className="flex items-center gap-1.5">
             <div className={`h-1.5 w-1.5 rounded-full ${isRecent ? 'bg-green-500' : 'bg-orange-500'}`}></div>
             <span className="text-[11px] text-gray-600 font-medium">
               {row.original.name === "Rahul Sharma" ? "2 min ago" : 
                row.original.name === "Vikram Joshi" ? "Just now" :
                row.original.name === "Priya Patel" ? "1 hour ago" :
                row.original.name === "Amit Kumar" ? "3 hours ago" : "2 days ago"}
             </span>
           </div>
         )
      },
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ getValue }) => (
         <Badge variant="outline" className={`shadow-none font-medium px-2 py-0 h-5 text-[9px] tracking-wide rounded-sm ${getValue() === 'ACTIVE' ? 'text-green-600 border-green-200 bg-green-50/50' : 'text-gray-500 border-gray-200 bg-gray-50/50'}`}>
            {getValue() === 'ACTIVE' ? 'Active' : 'Inactive'}
         </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: () => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 text-gray-600 border-gray-200"><Shield className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7 text-gray-600 border-gray-200"><MoreVertical className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    }),
  ], [])

  const table = useReactTable({
    data: activeAdmins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold tracking-tight">Admin Invites & Access Management</h1>
             <div className="bg-purple-50 p-1.5 rounded-full"><ShieldCheck className="h-4 w-4 text-purple-600" /></div>
          </div>
          <p className="text-sm text-muted-foreground">Invite new administrators and manage their access permissions</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative cursor-pointer">
              <div className="h-5 w-5 text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">3</div>
           </div>
           <Button className="gap-2 text-sm shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white h-9">
             <Plus className="h-4 w-4" /> Create New Invite
           </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { ...mockStats[0], value: String(activeAdmins.length) },
          { ...mockStats[1], value: String(invites.filter((inv) => !inv.consumedAt && !inv.revokedAt && new Date(inv.expiresAt) > new Date()).length) },
          mockStats[2],
          { ...mockStats[3], value: String(invites.length) },
          mockStats[4],
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden relative">
            <CardContent className="p-4 flex flex-col h-[100px]">
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-full ${stat.bg} shrink-0`}>
                     <stat.icon className={`h-5 w-5 ${stat.color}`} />
                   </div>
                   <div className="flex flex-col">
                     <p className="text-[10px] font-semibold text-gray-900">{stat.title}</p>
                     <h3 className="text-xl font-bold leading-none mt-0.5">{stat.value}</h3>
                   </div>
                </div>
              </div>
              <p className={`text-[9px] font-medium mt-1.5 z-10 ${stat.trendUp === true ? 'text-green-600' : stat.trendUp === false ? 'text-orange-500' : 'text-muted-foreground'}`}>
                 {stat.trend}
              </p>
              
              {stat.progress ? (
                 <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{width: '80%'}}></div>
                 </div>
              ) : (
                <div className="absolute bottom-0 left-0 right-0 h-[30px] pointer-events-none opacity-40">
                   <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="w-full h-full">
                      <path d={sparklinePath} fill="none" stroke={stat.stroke} strokeWidth="1.5" />
                   </svg>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {/* Create Invite */}
         <Card className="shadow-sm border-0 ring-1 ring-border/50">
            <CardHeader className="p-5 pb-0">
               <CardTitle className="text-sm font-bold">Create New Admin Invite</CardTitle>
               <p className="text-xs text-muted-foreground">Select permissions for the admin you want to invite</p>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                     <h4 className="text-xs font-bold text-gray-900">Select Permissions</h4>
                     <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 shadow-none" onClick={() => setSelectedPerms(new Set(ALL_PERMISSIONS.map(p => p.id)))}>Select All</Button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                     {ALL_PERMISSIONS.map((p) => {
                        const isSelected = selectedPerms.has(p.id)
                        return (
                           <div 
                              key={p.id} 
                              onClick={() => togglePerm(p.id)}
                              className={`relative flex flex-col items-center justify-center p-3 gap-2 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                           >
                              {isSelected && (
                                 <div className="absolute top-1.5 right-1.5 h-3 w-3 rounded-sm bg-indigo-600 text-white flex items-center justify-center">
                                    <CheckCircle2 className="h-2 w-2" />
                                 </div>
                              )}
                              <p.icon className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <span className={`text-[9px] font-semibold text-center leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>{p.label}</span>
                           </div>
                        )
                     })}
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                     <h4 className="text-xs font-bold text-gray-900">Invite Link Preview</h4>
                     <p className="text-[10px] text-muted-foreground">A secure, one-time link will be generated</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-md h-9 px-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] text-indigo-900/80 font-medium">{generatedLink ? generatedLink : "This invite link will expire in 7 days or after first use."}</span>
                     </div>
                     <Button variant="outline" className="h-9 shadow-none text-xs" onClick={() => { setGeneratedLink(""); setSelectedPerms(new Set()) }}>Reset</Button>
                     {generatedLink ? (
                        <Button className="h-9 bg-indigo-600 hover:bg-indigo-700 text-xs shadow-none gap-2" onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Copied to clipboard") }}>
                          <Copy className="h-3.5 w-3.5" /> Copy Link
                        </Button>
                     ) : (
                        <Button className="h-9 bg-indigo-600 hover:bg-indigo-700 text-xs shadow-none gap-2" onClick={handleGenerate} disabled={createMutation.isPending}>
                          <Link2 className="h-3.5 w-3.5" /> Generate Invite Link
                        </Button>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Pending Invites */}
         <Card className="shadow-sm border-0 ring-1 ring-border/50">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/50">
               <CardTitle className="text-sm font-bold">Pending Invites</CardTitle>
               <Button variant="outline" className="h-7 text-[10px] px-2 shadow-none">View All</Button>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
               {invites.slice(0, 5).map((inv, idx) => {
                  const isExpired = new Date(inv.expiresAt) < new Date()
                  const isUsed = !!inv.consumedAt
                  const isRevoked = !!inv.revokedAt
                  const status = isUsed ? "Used" : isRevoked ? "Revoked" : isExpired ? "Expired" : "Active"
                  const initial = ["JD", "AK", "RS", "NP", "MT"][idx % 5]
                  const bg = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"][idx % 5]
                  
                  return (
                     <div key={inv.id} className="p-4 border-b border-border/50 last:border-0 flex items-center justify-between hover:bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${bg}`}>{initial}</div>
                           <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-gray-900">Invite #INV-{inv.id.slice(-4).toUpperCase()}</span>
                              <span className="text-[9px] text-muted-foreground">Created by {inv.createdBy}</span>
                              <span className="text-[9px] text-muted-foreground">{formatInviteDate(inv.createdAt)} • {isUsed ? `Used on ${formatInviteDate(inv.consumedAt!)}` : isRevoked ? `Revoked on ${formatInviteDate(inv.revokedAt!)}` : `Expires in 3 days`}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="flex items-center gap-1">
                              {inv.permissions.slice(0,4).map((p, i) => {
                                 const info = ALL_PERMISSIONS.find(x => x.id === p)
                                 if (!info) return null
                                 return <div key={i} className="h-5 w-5 rounded bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600"><info.icon className="h-3 w-3" /></div>
                              })}
                              {inv.permissions.length > 4 && <span className="text-[9px] font-semibold text-gray-500 ml-1">+{inv.permissions.length - 4}</span>}
                           </div>
                           <div className="flex items-center gap-4 w-[160px] justify-end">
                              <Badge variant="outline" className={`shadow-none font-medium px-2 py-0 h-5 text-[9px] tracking-wide rounded-sm ${status === 'Active' ? 'text-green-600 border-green-200 bg-green-50' : status === 'Used' ? 'text-gray-500 border-gray-200 bg-gray-50' : 'text-orange-600 border-orange-200 bg-orange-50'}`}>{status}</Badge>
                              <div className="flex items-center gap-1">
                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600"><Eye className="h-3 w-3" /></Button>
                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600"><Copy className="h-3 w-3" /></Button>
                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               })}
            </CardContent>
         </Card>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-gray-900">Active Admins <span className="text-muted-foreground font-normal">({activeAdmins.length})</span></h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search admins by name, email or phone..." className="pl-8 h-8 text-xs border-gray-200 rounded-md shadow-sm" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-8 text-xs border-gray-200 rounded-md"><SelectValue placeholder="All Permissions" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Permissions</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 h-8 text-xs border-gray-200 rounded-md shadow-sm px-3">
                  <Download className="h-3 w-3" /> Export
                </Button>
              </div>
            </div>

            <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-3 border-b border-border/50">
              <DataTable table={table} />
            </div>
            
            <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
              <p className="text-[11px] text-muted-foreground font-medium">Showing {activeAdmins.length > 0 ? 1 : 0} to {Math.min(5, activeAdmins.length)} of {activeAdmins.length} admins</p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-0 text-muted-foreground" disabled>{"<"}</Button>
                    <Button variant="default" size="sm" className="h-7 w-7 p-0 bg-indigo-600 text-white shadow-none hover:bg-indigo-700 font-medium rounded-md">1</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[11px] text-muted-foreground rounded-md">2</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[11px] text-muted-foreground rounded-md">3</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[11px] text-muted-foreground rounded-md">4</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[11px] text-muted-foreground rounded-md">5</Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-0 text-muted-foreground">{">"}</Button>
                 </div>
                 <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                    <Select defaultValue="5">
                      <SelectTrigger className="w-[80px] h-7 text-[11px] border bg-transparent"><SelectValue placeholder="5 / page" /></SelectTrigger>
                      <SelectContent><SelectItem value="5">5 / page</SelectItem><SelectItem value="10">10 / page</SelectItem></SelectContent>
                    </Select>
                 </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Tips Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0 space-y-4">
           {/* Quick Actions */}
           <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                 <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group">
                    <div className="flex items-start gap-3">
                       <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-700">Bulk Invite</span>
                          <span className="text-[9px] text-muted-foreground">Invite multiple admins at once</span>
                       </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-blue-600 -rotate-90" />
                 </div>
                 <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-colors group">
                    <div className="flex items-start gap-3">
                       <ShieldCheck className="h-4 w-4 text-orange-600 mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-orange-700">Permission Templates</span>
                          <span className="text-[9px] text-muted-foreground">Ensure permission presets</span>
                       </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-orange-600 -rotate-90" />
                 </div>
                 <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group">
                    <div className="flex items-start gap-3">
                       <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-700">Audit Log</span>
                          <span className="text-[9px] text-muted-foreground">View invite & access logs</span>
                       </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-blue-600 -rotate-90" />
                 </div>
                 <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors group">
                    <div className="flex items-start gap-3">
                       <Lock className="h-4 w-4 text-purple-600 mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-purple-700">Access Settings</span>
                          <span className="text-[9px] text-muted-foreground">Configure security policies</span>
                       </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-purple-600 -rotate-90" />
                 </div>
              </div>
           </div>

           {/* Security Tips */}
           <div className="flex flex-col gap-3 mt-4">
              <h3 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-green-600" /> Security Tips</h3>
              <div className="bg-white border border-border/50 rounded-lg p-4 flex flex-col gap-4">
                 <div className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5"><Link2 className="h-3 w-3" /></div>
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-bold text-gray-900">Share invite links securely</span>
                       <span className="text-[9px] text-muted-foreground">Anyone with the link can join</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5"><ShieldCheck className="h-3 w-3" /></div>
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-bold text-gray-900">Review permissions regularly</span>
                       <span className="text-[9px] text-muted-foreground">Ensure least privilege access</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5"><Shield className="h-3 w-3" /></div>
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-bold text-gray-900">Revoke unused invites</span>
                       <span className="text-[9px] text-muted-foreground">Keep your system secure</span>
                    </div>
                 </div>
                 <Button variant="link" className="h-auto p-0 text-[10px] text-indigo-600 font-semibold justify-start gap-1 mt-1">View Security Guide <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
