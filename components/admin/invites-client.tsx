"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Shield,
  ShieldCheck,
  User,
  Users,
  Mail,
  Link as LinkIcon,
  Calendar,
  Eye,
  Copy,
  Trash2,
  FileText,
  ShieldAlert,
  UserCheck,
  FileCheck,
  LayoutDashboard,
  CreditCard,
  Banknote,
  Tags,
  PieChart,
  Headphones,
  Ban,
  Loader2,
  Check,
  Link2,
  Plus,
  X,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import type { AdminPermission } from "@/lib/generated/prisma/client";
import {
  useAdminInvitesQuery,
  useActiveAdminsQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useDeleteInviteMutation,
  useDeactivateAdminMutation,
  useReactivateAdminMutation,
} from "@/stores/adminInvitesStore";
import type {
  AdminInviteRow,
  ActiveAdminRow,
} from "@/stores/adminInvitesStore";

const PERMISSION_CONFIG: {
  key: AdminPermission;
  label: string;
  icon: typeof UserCheck;
}[] = [
  { key: "MANAGE_ADMINS", label: "Manage Admins", icon: UserCheck },
  { key: "APPROVE_KYC", label: "Approve KYC", icon: FileCheck },
  { key: "MANAGE_CATALOG", label: "Manage Catalog", icon: LayoutDashboard },
  { key: "ISSUE_REFUNDS", label: "Issue Refunds", icon: CreditCard },
  { key: "MANAGE_PAYOUTS", label: "Manage Payouts", icon: Banknote },
  { key: "MANAGE_COUPONS", label: "Manage Coupons", icon: Tags },
  { key: "VIEW_FINANCIALS", label: "View Financials", icon: PieChart },
  { key: "MANAGE_SUPPORT", label: "Manage Support", icon: Headphones },
  { key: "BAN_USERS", label: "Ban Users", icon: Ban },
  { key: "MANAGE_CMS", label: "Manage CMS", icon: FileText },
];

const permConfigOf = (key: AdminPermission) =>
  PERMISSION_CONFIG.find((p) => p.key === key) ?? {
    key,
    label: key,
    icon: ShieldCheck,
  };

function formatDate(iso: string | null | undefined) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000)
    return `${Math.floor(diff / 3_600_000)} hour${Math.floor(diff / 3_600_000) !== 1 ? "s" : ""} ago`;
  if (diff < 7 * 86_400_000)
    return `${Math.floor(diff / 86_400_000)} day${Math.floor(diff / 86_400_000) !== 1 ? "s" : ""} ago`;
  return formatDate(iso);
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

type InviteStatus =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRING_TODAY"
  | "USED"
  | "REVOKED"
  | "EXPIRED";

function getInviteStatus(invite: AdminInviteRow): InviteStatus {
  if (invite.revokedAt) return "REVOKED";
  if (invite.consumedAt) return "USED";
  if (new Date(invite.expiresAt).getTime() < Date.now()) return "EXPIRED";
  const days = daysUntil(invite.expiresAt);
  if (days <= 0) return "EXPIRING_TODAY";
  if (days <= 3) return "EXPIRING_SOON";
  return "ACTIVE";
}

const statusStyle: Record<InviteStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  EXPIRING_SOON: "bg-orange-50 text-orange-700 border-orange-200",
  EXPIRING_TODAY: "bg-red-50 text-red-700 border-red-200",
  USED: "bg-gray-100 text-gray-600 border-gray-200",
  REVOKED: "bg-gray-100 text-gray-600 border-gray-200",
  EXPIRED: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabel: Record<InviteStatus, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRING_TODAY: "Expiring Today",
  USED: "Used",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
};

function isNewThisMonth(joinedOn: string) {
  return Date.now() - new Date(joinedOn).getTime() < 30 * 86_400_000;
}

function isPendingInvite(invite: AdminInviteRow) {
  const s = getInviteStatus(invite);
  return s === "ACTIVE" || s === "EXPIRING_SOON" || s === "EXPIRING_TODAY";
}

function countExpiringSoon(invites: AdminInviteRow[]) {
  return invites.filter((i) => getInviteStatus(i) !== "ACTIVE").length;
}

function computeAvgJoinDays(invites: AdminInviteRow[]) {
  const usedInvites = invites.filter((i) => i.consumedAt);
  if (usedInvites.length === 0) return null;
  const totalMs = usedInvites.reduce(
    (acc, i) =>
      acc +
      (new Date(i.consumedAt!).getTime() - new Date(i.createdAt).getTime()),
    0,
  );
  return totalMs / usedInvites.length / 86_400_000;
}

function countUsedPermissions(admins: ActiveAdminRow[]) {
  const usedPermissionSet = new Set<AdminPermission>();
  for (const a of admins) {
    if (a.status !== "ACTIVE") continue;
    for (const p of a.permissions) usedPermissionSet.add(p);
  }
  return usedPermissionSet.size;
}

function buildInviteUrl(token: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/invite/${token}`;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Copy failed — select the link manually");
  }
}

function PermissionBadges({
  permissions,
  size = "sm",
}: {
  permissions: AdminPermission[];
  size?: "sm" | "md";
}) {
  const visible = permissions.slice(0, size === "sm" ? 4 : 5);
  const rest = permissions.length - visible.length;
  return (
    <div className="flex items-center gap-1.5">
      {visible.map((p) => {
        const Icon = permConfigOf(p).icon;
        return (
          <div
            key={p}
            title={permConfigOf(p).label}
            className={`${size === "sm" ? "h-7 w-7" : "h-6 w-6"} rounded bg-gray-100 border border-gray-200 flex items-center justify-center`}
          >
            <Icon
              className={`${size === "sm" ? "h-3.5 w-3.5" : "h-3 w-3"} text-gray-600`}
            />
          </div>
        );
      })}
      {rest > 0 && (
        <div
          className={`${size === "sm" ? "h-7 w-7" : "h-6 w-6"} rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600`}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}

function InviteAvatar({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ------------------------------ Skeletons ------------------------------ */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm h-[120px] flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function CreateInviteSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div className="p-6 border-b border-gray-100 space-y-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[86px] rounded-xl" />
          ))}
        </div>
        <div className="mt-auto space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingInvitesSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
      <div className="flex-1 p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 pl-6 border-b border-gray-50"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-52" />
            </div>
            <Skeleton className="h-7 w-28 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminsTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-[280px] rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-6 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3 w-56">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  );
}

/* ------------------------------ Main page ------------------------------ */

export default function AdminInvitesClient() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const invitesQuery = useAdminInvitesQuery();
  const adminsQuery = useActiveAdminsQuery();

  const invites = useMemo(() => invitesQuery.data ?? [], [invitesQuery.data]);
  const admins = useMemo(() => adminsQuery.data ?? [], [adminsQuery.data]);
  const isLoading = invitesQuery.isLoading || adminsQuery.isLoading;

  /* Create invite state */
  const [selectedPermissions, setSelectedPermissions] = useState<
    AdminPermission[]
  >([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const createInviteMutation = useCreateInviteMutation();

  /* Invite row actions */
  const revokeMutation = useRevokeInviteMutation();
  const deleteMutation = useDeleteInviteMutation();
  const [inviteToDelete, setInviteToDelete] = useState<AdminInviteRow | null>(
    null,
  );
  const [inviteToView, setInviteToView] = useState<AdminInviteRow | null>(null);

  /* Admin table state */
  const [adminSearch, setAdminSearch] = useState("");
  const [adminPermissionFilter, setAdminPermissionFilter] = useState("all");
  const [adminPage, setAdminPage] = useState(0);
  const [adminPageSize, setAdminPageSize] = useState(5);
  const [adminToManage, setAdminToManage] = useState<ActiveAdminRow | null>(
    null,
  );
  const deactivateMutation = useDeactivateAdminMutation();
  const reactivateMutation = useReactivateAdminMutation();

  const togglePermission = (key: AdminPermission) => {
    setGeneratedLink(null);
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const toggleAllPermissions = () => {
    setGeneratedLink(null);
    setSelectedPermissions((prev) =>
      prev.length === PERMISSION_CONFIG.length
        ? []
        : PERMISSION_CONFIG.map((p) => p.key),
    );
  };

  const resetPermissions = () => {
    setSelectedPermissions([]);
    setGeneratedLink(null);
  };

  const handleGenerateInvite = async () => {
    if (selectedPermissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }
    try {
      const url = await createInviteMutation.mutateAsync(selectedPermissions);
      setGeneratedLink(url);
      toast.success("Invite link generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate invite");
    }
  };

  /* Stats */
  const stats = useMemo(() => {
    const activeAdminCount = admins.filter((a) => a.status === "ACTIVE").length;
    const newThisMonth = admins.filter(
      (a) => a.status === "ACTIVE" && isNewThisMonth(a.joinedOn),
    ).length;
    const pendingCount = invites.filter(isPendingInvite).length;
    const expiringSoon = countExpiringSoon(invites);
    const avgJoinDays = computeAvgJoinDays(invites);
    const usedPermCount = countUsedPermissions(admins);
    return {
      activeAdminCount,
      newThisMonth,
      pendingCount,
      expiringSoon,
      avgJoinDays,
      usedPermCount,
      permPct: Math.round((usedPermCount / PERMISSION_CONFIG.length) * 100),
    };
  }, [admins, invites]);

  /* Admin table filtering + pagination */
  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    return admins.filter((a) => {
      if (q && !`${a.name} ${a.email}`.toLowerCase().includes(q)) return false;
      if (
        adminPermissionFilter !== "all" &&
        !a.permissions.includes(adminPermissionFilter as AdminPermission)
      )
        return false;
      return true;
    });
  }, [admins, adminSearch, adminPermissionFilter]);

  const adminTotalPages = Math.max(
    1,
    Math.ceil(filteredAdmins.length / adminPageSize),
  );
  const safeAdminPage = Math.min(adminPage, adminTotalPages - 1);
  const pagedAdmins = filteredAdmins.slice(
    safeAdminPage * adminPageSize,
    safeAdminPage * adminPageSize + adminPageSize,
  );

  const exportAdminsCSV = () => {
    const header = [
      "Name",
      "Email",
      "Permissions",
      "Invited By",
      "Joined On",
      "Last Active",
      "Status",
    ];
    const rows = filteredAdmins.map((a) => [
      a.name,
      a.email,
      a.permissions.join(", "),
      a.invitedBy ?? "",
      formatDate(a.joinedOn),
      formatDate(a.lastActive),
      a.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "active-admins.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Admins exported");
  };

  const handleRevokeInvite = async (invite: AdminInviteRow) => {
    const res = await revokeMutation.mutateAsync(invite.id);
    if (res.ok) toast.success("Invite revoked");
    else toast.error(res.error ?? "Failed to revoke invite");
  };

  const handleDeleteInvite = async () => {
    if (!inviteToDelete) return;
    const res = await deleteMutation.mutateAsync(inviteToDelete.id);
    if (res.ok) {
      toast.success("Invite deleted");
      setInviteToDelete(null);
    } else {
      toast.error(res.error ?? "Failed to delete invite");
    }
  };

  const handleManageAdmin = (admin: ActiveAdminRow) => {
    const action =
      admin.status === "ACTIVE" ? deactivateMutation : reactivateMutation;
    action.mutateAsync(admin.id).then((res) => {
      if (res.ok) {
        toast.success(
          admin.status === "ACTIVE" ? "Admin deactivated" : "Admin reactivated",
        );
        setAdminToManage(null);
      } else {
        toast.error(res.error ?? "Action failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight">
                Admin Invites & Access Management
              </h1>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Invite new administrators and manage their access permissions
            </p>
          </div>
          <a
            href="#create-invite"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create New Invite
          </a>
        </div>

        {/* Stats Row */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[140px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Active Admins
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {stats.activeAdminCount}
                  </h3>
                </div>
              </div>
              <div className="text-[11px] font-medium text-green-600 relative z-10 pb-8">
                {stats.newThisMonth > 0
                  ? `↑ ${stats.newThisMonth} new this month`
                  : "No new admins this month"}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
                <svg
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  className="h-full w-full stroke-violet-400 fill-none"
                  strokeWidth="1.5"
                >
                  <path
                    d="M0 10 Q 10 20, 20 10 T 40 10 T 60 10 T 80 10 T 100 10"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[140px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Pending Invites
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {stats.pendingCount}
                  </h3>
                </div>
              </div>
              <div className="text-[11px] font-medium text-orange-500 relative z-10 pb-8">
                {stats.expiringSoon > 0
                  ? `${stats.expiringSoon} expiring soon`
                  : "No invites expiring"}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
                <svg
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  className="h-full w-full stroke-blue-400 fill-none"
                  strokeWidth="1.5"
                >
                  <path
                    d="M0 15 Q 15 5, 30 15 T 60 15 T 90 15 T 100 15"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Permissions Used
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {stats.usedPermCount} / {PERMISSION_CONFIG.length}
                  </h3>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-1.5 w-full">
                <span className="text-[11px] font-medium text-gray-500">
                  {stats.permPct}% of available
                </span>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.permPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[140px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <LinkIcon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Invites Sent
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {invites.length}
                  </h3>
                </div>
              </div>
              <div className="text-[11px] font-medium text-gray-500 relative z-10 pb-8">
                All time
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
                <svg
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  className="h-full w-full stroke-orange-400 fill-none"
                  strokeWidth="1.5"
                >
                  <path
                    d="M0 12 Q 10 22, 20 12 T 40 12 T 60 12 T 80 12 T 100 12"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[140px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Avg. Join Time
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {stats.avgJoinDays === null
                      ? "—"
                      : stats.avgJoinDays >= 1
                        ? `${stats.avgJoinDays.toFixed(1)} days`
                        : `${Math.round(stats.avgJoinDays * 24)} hours`}
                  </h3>
                </div>
              </div>
              <div className="text-[11px] font-medium text-gray-500 relative z-10 pb-8">
                From invite to join
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
                <svg
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  className="h-full w-full stroke-pink-400 fill-none"
                  strokeWidth="1.5"
                >
                  <path
                    d="M0 18 Q 15 8, 30 18 T 60 18 T 90 18 T 100 18"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Middle Section */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          {isLoading ? (
            <CreateInviteSkeleton />
          ) : (
            <div
              id="create-invite"
              className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col scroll-mt-6"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Create New Admin Invite
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select permissions for the admin you want to invite
                </p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Select Permissions
                  </h3>
                  <button
                    className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={toggleAllPermissions}
                  >
                    {selectedPermissions.length === PERMISSION_CONFIG.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-3 mb-8">
                  {PERMISSION_CONFIG.map(({ key, label, icon: Icon }) => {
                    const selected = selectedPermissions.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => togglePermission(key)}
                        className={`border rounded-xl p-3 relative cursor-pointer transition-colors group ${
                          selected
                            ? "border-violet-200 bg-violet-50/40 hover:border-violet-300"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 h-4 w-4 bg-violet-600 rounded flex items-center justify-center">
                            <Check
                              className="h-3 w-3 text-white"
                              strokeWidth={3.5}
                            />
                          </div>
                        )}
                        <div className="flex flex-col items-center justify-center h-full gap-2 py-2">
                          <Icon
                            className={`h-5 w-5 ${selected ? "text-violet-600" : "text-gray-400 group-hover:text-gray-500"}`}
                          />
                          <span
                            className={`text-[11px] font-medium text-center ${selected ? "text-violet-900" : "text-gray-600"}`}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto">
                  <h3 className="text-sm font-bold text-gray-900">
                    Invite Link Preview
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    A secure, one-time link will be generated
                  </p>

                  {generatedLink ? (
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-violet-50 text-violet-800 text-xs font-medium px-4 py-3 rounded-lg border border-violet-100 w-full">
                        <Link2 className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{generatedLink}</span>
                        <button
                          className="p-1.5 rounded-md hover:bg-violet-100 text-violet-700 transition-colors shrink-0"
                          onClick={() => copyText(generatedLink, "Invite link")}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] font-medium text-gray-500">
                        Link expires in 48 hours or after first use.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-violet-50 text-violet-700 text-xs font-medium px-4 py-3 rounded-lg flex items-center gap-2 w-full mb-4 border border-violet-100">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      This invite link will expire in 48 hours or after first
                      use.
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={resetPermissions}
                    >
                      Reset
                    </button>
                    <button
                      className="px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleGenerateInvite}
                      disabled={
                        createInviteMutation.isPending ||
                        selectedPermissions.length === 0
                      }
                    >
                      {createInviteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LinkIcon className="h-4 w-4" />
                      )}
                      Generate Invite Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {isLoading ? (
            <PendingInvitesSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Invites</h2>
                <span className="text-xs font-medium text-gray-500">
                  {invites.length} total
                </span>
              </div>
              <ScrollArea className="p-0 flex-1 w-full">
                {invites.length === 0 ? (
                  <div className="text-center py-16">
                    <LinkIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-500">
                      No invites yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Generate your first invite link to get started
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[640px]">
                    <tbody>
                      {invites.map((invite) => {
                        const status = getInviteStatus(invite);
                        const isDone =
                          status === "USED" ||
                          status === "REVOKED" ||
                          status === "EXPIRED";
                        return (
                          <tr
                            key={invite.id}
                            className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isDone ? "opacity-70" : ""}`}
                          >
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-4">
                                <InviteAvatar
                                  label={invite.id}
                                  className={`h-10 w-10 ${isDone ? "bg-gray-100 text-gray-500" : "bg-violet-100 text-violet-700"}`}
                                />
                                <div>
                                  <p
                                    className={`text-sm font-bold text-gray-900 ${status === "REVOKED" ? "line-through text-gray-400" : ""}`}
                                  >
                                    Invite #
                                    {invite.id.slice(0, 4).toUpperCase()}-
                                    {invite.id.slice(-4).toUpperCase()}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Created by {invite.createdBy ?? "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {formatDate(invite.createdAt)}
                                    {status === "USED" && invite.consumedAt
                                      ? ` • Used on ${formatDate(invite.consumedAt)}`
                                      : status === "REVOKED"
                                        ? " • Revoked"
                                        : status === "EXPIRED"
                                          ? " • Expired"
                                          : ` • Expires in ${daysUntil(invite.expiresAt)} day${daysUntil(invite.expiresAt) !== 1 ? "s" : ""}`}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <PermissionBadges
                                permissions={invite.permissions}
                              />
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 border rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle[status]}`}
                              >
                                {statusLabel[status]}
                              </span>
                            </td>
                            <td className="p-4 pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                  onClick={() => setInviteToView(invite)}
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                                  disabled={isDone || revokeMutation.isPending}
                                  onClick={() =>
                                    copyText(
                                      buildInviteUrl(invite.token),
                                      "Invite link",
                                    )
                                  }
                                  title="Copy link"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                                    isDone
                                      ? "border-gray-200 text-gray-400 hover:bg-gray-100"
                                      : "border-red-200 text-red-500 hover:bg-red-50"
                                  }`}
                                  onClick={() => setInviteToDelete(invite)}
                                  title={
                                    isDone ? "Delete invite" : "Revoke invite"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col 2xl:flex-row gap-6">
          {/* Active Admins Table */}
          {isLoading ? (
            <AdminsTableSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                  Active Admins{" "}
                  <span className="text-gray-400 font-normal">
                    ({admins.length})
                  </span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search admins by name or email..."
                      value={adminSearch}
                      onChange={(e) => {
                        setAdminSearch(e.target.value);
                        setAdminPage(0);
                      }}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 h-9"
                    />
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer h-9"
                      value={adminPermissionFilter}
                      onChange={(e) => {
                        setAdminPermissionFilter(e.target.value);
                        setAdminPage(0);
                      }}
                    >
                      <option value="all">All Permissions</option>
                      {PERMISSION_CONFIG.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap h-9"
                    onClick={exportAdminsCSV}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <ScrollArea className="w-full">
                {filteredAdmins.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-500">
                      No admins found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-6 font-semibold text-gray-900">
                          Admin
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Contact
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Permissions
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Invited By
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Joined On
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Last Active
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="py-3 px-6 font-semibold text-gray-900 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedAdmins.map((admin) => (
                        <tr
                          key={admin.id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {admin.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={admin.image}
                                  alt={admin.name}
                                  className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                                />
                              ) : (
                                <InviteAvatar
                                  label={admin.name}
                                  className="h-8 w-8 bg-violet-100 text-violet-700"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  {admin.name}
                                </span>
                                {admin.userId === currentUserId && (
                                  <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {admin.email || "—"}
                          </td>
                          <td className="py-4 px-4">
                            <PermissionBadges permissions={admin.permissions} />
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {admin.invitedBy ?? "—"}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(admin.joinedOn)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${admin.lastActive ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className="text-gray-900 font-medium">
                                {timeAgo(admin.lastActive)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 border rounded-full text-xs font-semibold ${admin.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                            >
                              {admin.status === "ACTIVE"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                onClick={() => setAdminToManage(admin)}
                                title="View permissions"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                              <button
                                className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                onClick={() => setAdminToManage(admin)}
                                title="More actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-gray-50/30">
                <span className="text-gray-500">
                  Showing{" "}
                  {filteredAdmins.length === 0
                    ? 0
                    : safeAdminPage * adminPageSize + 1}{" "}
                  to{" "}
                  {Math.min(
                    (safeAdminPage + 1) * adminPageSize,
                    filteredAdmins.length,
                  )}{" "}
                  of {filteredAdmins.length} admins
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={safeAdminPage === 0}
                      onClick={() => setAdminPage(safeAdminPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: adminTotalPages })
                      .slice(0, 5)
                      .map((_, i) => (
                        <button
                          key={i}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg font-medium transition-colors ${
                            i === safeAdminPage
                              ? "bg-violet-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => setAdminPage(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    {adminTotalPages > 5 && (
                      <span className="text-[13px] font-bold text-gray-500 px-1">
                        ...
                      </span>
                    )}
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={safeAdminPage >= adminTotalPages - 1}
                      onClick={() => setAdminPage(safeAdminPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative border-l border-gray-200 pl-4 hidden sm:block">
                    <select
                      className="appearance-none bg-transparent text-gray-700 text-sm py-1 pr-6 focus:outline-none cursor-pointer font-medium"
                      value={adminPageSize}
                      onChange={(e) => {
                        setAdminPageSize(Number(e.target.value));
                        setAdminPage(0);
                      }}
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Sidebar */}
          <div className="w-full 2xl:w-[320px] shrink-0 flex flex-col gap-6">
            {/* Security Tips */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Security Tips
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-md bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Link2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      Share invite links securely
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Anyone with the link can join
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-md bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      Review permissions regularly
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Ensure least privilege access
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-md bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      Revoke unused invites
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Keep your system secure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite details dialog */}
      <Dialog
        open={!!inviteToView}
        onOpenChange={(open) => !open && setInviteToView(null)}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Invite Details</DialogTitle>
            <DialogDescription>
              {inviteToView
                ? `Invite #${inviteToView.id.slice(0, 4).toUpperCase()}-${inviteToView.id.slice(-4).toUpperCase()} · ${statusLabel[getInviteStatus(inviteToView)]}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {inviteToView && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-500">
                    Invite Link
                  </p>
                  <p className="text-[13px] font-semibold text-gray-900 truncate mt-0.5">
                    {buildInviteUrl(inviteToView.token)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 text-[12px] font-bold"
                  onClick={() =>
                    copyText(buildInviteUrl(inviteToView.token), "Invite link")
                  }
                  disabled={
                    getInviteStatus(inviteToView) !== "ACTIVE" &&
                    getInviteStatus(inviteToView) !== "EXPIRING_SOON" &&
                    getInviteStatus(inviteToView) !== "EXPIRING_TODAY"
                  }
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    Created By
                  </p>
                  <p className="font-bold text-gray-900 mt-1 truncate">
                    {inviteToView.createdBy ?? "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    Created At
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatDateTime(inviteToView.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    Expires At
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatDateTime(inviteToView.expiresAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    {inviteToView.consumedAt
                      ? "Used At"
                      : inviteToView.revokedAt
                        ? "Revoked At"
                        : "Status"}
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {inviteToView.consumedAt
                      ? formatDateTime(inviteToView.consumedAt)
                      : inviteToView.revokedAt
                        ? formatDateTime(inviteToView.revokedAt)
                        : statusLabel[getInviteStatus(inviteToView)]}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-2">
                  Permissions ({inviteToView.permissions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {inviteToView.permissions.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="bg-violet-50/60 text-violet-700 border-violet-200 font-bold text-[11px] px-2.5 py-1 rounded-md"
                    >
                      {permConfigOf(p).label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke / Delete invite confirm dialog */}
      <Dialog
        open={!!inviteToDelete}
        onOpenChange={(open) => !open && setInviteToDelete(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {inviteToDelete &&
              (getInviteStatus(inviteToDelete) === "USED" ||
                getInviteStatus(inviteToDelete) === "REVOKED" ||
                getInviteStatus(inviteToDelete) === "EXPIRED")
                ? "Delete invite?"
                : "Revoke invite?"}
            </DialogTitle>
            <DialogDescription>
              {inviteToDelete &&
              (getInviteStatus(inviteToDelete) === "USED" ||
                getInviteStatus(inviteToDelete) === "REVOKED" ||
                getInviteStatus(inviteToDelete) === "EXPIRED")
                ? "This invite will be permanently removed."
                : "This invite link will stop working immediately and cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending || revokeMutation.isPending}
              onClick={() => {
                if (!inviteToDelete) return;
                const done =
                  getInviteStatus(inviteToDelete) === "USED" ||
                  getInviteStatus(inviteToDelete) === "REVOKED" ||
                  getInviteStatus(inviteToDelete) === "EXPIRED";
                if (done) handleDeleteInvite();
                else handleRevokeInvite(inviteToDelete);
              }}
            >
              {deleteMutation.isPending || revokeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {inviteToDelete &&
              (getInviteStatus(inviteToDelete) === "USED" ||
                getInviteStatus(inviteToDelete) === "REVOKED" ||
                getInviteStatus(inviteToDelete) === "EXPIRED")
                ? "Delete"
                : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin manage dialog */}
      <Dialog
        open={!!adminToManage}
        onOpenChange={(open) => !open && setAdminToManage(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Manage Admin</DialogTitle>
            <DialogDescription>{adminToManage?.name}</DialogDescription>
          </DialogHeader>
          {adminToManage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                {adminToManage.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={adminToManage.image}
                    alt={adminToManage.name}
                    className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <InviteAvatar
                    label={adminToManage.name}
                    className="h-11 w-11 bg-violet-100 text-violet-700"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-gray-900 truncate">
                    {adminToManage.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 truncate">
                    {adminToManage.email || "No email"}
                  </p>
                </div>
                <Badge
                  className={`ml-auto ${adminToManage.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"} border-0 font-bold`}
                >
                  {adminToManage.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-2">
                  Permissions ({adminToManage.permissions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {adminToManage.permissions.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="bg-violet-50/60 text-violet-700 border-violet-200 font-bold text-[11px] px-2.5 py-1 rounded-md"
                    >
                      {permConfigOf(p).label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    Invited By
                  </p>
                  <p className="font-bold text-gray-900 mt-1 truncate">
                    {adminToManage.invitedBy ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-gray-500">
                    Joined On
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatDate(adminToManage.joinedOn)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3.5 col-span-2">
                  <p className="text-[11px] font-bold text-gray-500">
                    Last Active
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {timeAgo(adminToManage.lastActive)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setAdminToManage(null)}>
              <X className="h-4 w-4 mr-1.5" /> Close
            </Button>
            {adminToManage && adminToManage.userId !== currentUserId && (
              <Button
                variant={
                  adminToManage.status === "ACTIVE" ? "destructive" : "default"
                }
                disabled={
                  deactivateMutation.isPending || reactivateMutation.isPending
                }
                onClick={() => handleManageAdmin(adminToManage)}
              >
                {deactivateMutation.isPending ||
                reactivateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                {adminToManage.status === "ACTIVE"
                  ? "Deactivate Admin"
                  : "Reactivate Admin"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
