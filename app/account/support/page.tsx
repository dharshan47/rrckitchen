"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket, AlertCircle, Clock, CheckCircle2, HelpCircle,
  Plus, ChevronRight, Package, Truck, ChefHat, CreditCard,
  User, AlertTriangle,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SupportTicket {
  id: string;
  userId: string;
  orderId: string | null;
  subject: string;
  description: string;
  status: "OPEN" | "INPROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "Open", color: "text-blue-600 bg-blue-100", icon: AlertCircle },
  INPROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-100", icon: Clock },
  RESOLVED: { label: "Resolved", color: "text-green-600 bg-green-100", icon: CheckCircle2 },
  CLOSED: { label: "Closed", color: "text-gray-600 bg-gray-100", icon: CheckCircle2 },
};

const categories = [
  { id: "order", label: "Order Issue", icon: Package },
  { id: "delivery", label: "Delivery Issue", icon: Truck },
  { id: "food", label: "Food Quality", icon: ChefHat },
  { id: "payment", label: "Payment Issue", icon: CreditCard },
  { id: "account", label: "Account Issue", icon: User },
  { id: "kitchen", label: "Kitchen Partner", icon: ChefHat },
  { id: "delivery-partner", label: "Delivery Partner", icon: Truck },
  { id: "safety", label: "Safety Report", icon: AlertTriangle },
  { id: "other", label: "Other", icon: HelpCircle },
];

function TicketSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-4 shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24 ml-auto" />
      </div>
    </div>
  );
}

export default function AccountSupportPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<SupportTicket[]>;
    },
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Ticket className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Login to view Support Tickets</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to see your support ticket history.</p>
          </div>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Support Tickets</h1>
              <p className="text-sm text-muted-foreground">Track and manage your support requests</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/support">
                <Plus className="h-4 w-4 mr-1.5" /> New Ticket
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/help">
                <HelpCircle className="h-4 w-4 mr-1.5" /> Help
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <TicketSkeleton key={i} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-semibold">No support tickets yet</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create a ticket and we&apos;ll get back to you</p>
              <Button asChild>
                <Link href="/support">
                  <Plus className="h-4 w-4 mr-1.5" /> Create Ticket
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status];
              const StatusIcon = statusInfo.icon;
              const catInfo = categories.find((c) => c.id === ticket.category);
              const CatIcon = catInfo?.icon || HelpCircle;
              return (
                <Link
                  key={ticket.id}
                  href={`/support?ticket=${ticket.id}`}
                  className="block rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <CatIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={cn("text-xs", statusInfo.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" /> {statusInfo.label}
                    </Badge>
                    {ticket.orderId && <span className="text-[10px] text-muted-foreground">Order #{ticket.orderId.slice(0, 8)}</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
