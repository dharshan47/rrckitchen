"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket,
  MessageSquare,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Send,
  User,
  Package,
  ChefHat,
  Truck,
  CreditCard,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { Button, Badge, Input } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const replySchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

interface TicketMessage {
  id: string;
  senderId: string | null;
  message: string;
  mediaUrls: string[];
  createdAt: string;
}

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
  messages: TicketMessage[];
  user?: { name: string | null; email: string | null; phoneNumber: string | null };
}

const statusColors: Record<string, string> = {
  OPEN: "text-blue-600 bg-blue-100",
  INPROGRESS: "text-amber-600 bg-amber-100",
  RESOLVED: "text-green-600 bg-green-100",
  CLOSED: "text-gray-600 bg-gray-100",
};

const priorityColors: Record<string, string> = {
  LOW: "text-gray-600 bg-gray-100",
  MEDIUM: "text-blue-600 bg-blue-100",
  HIGH: "text-red-600 bg-red-100",
  URGENT: "text-red-600 bg-red-100 animate-pulse",
};

const categoryIcons: Record<string, typeof HelpCircle> = {
  order: Package,
  delivery: Truck,
  food: ChefHat,
  payment: CreditCard,
  account: User,
  kitchen: ChefHat,
  "delivery-partner": Truck,
  safety: AlertTriangle,
  other: HelpCircle,
};

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ message: string }>({
    resolver: zodResolver(replySchema),
    defaultValues: { message: "" },
  });

  const { data: tickets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<SupportTicket[]>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await fetch(`/api/admin/support`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success("Ticket updated");
    },
    onError: () => toast.error("Failed to update ticket"),
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await fetch(`/api/admin/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      reset();
      toast.success("Reply sent");
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const filtered = tickets
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter)
    .filter(
      (t) =>
        !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">{tickets.length} total tickets</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "OPEN", "INPROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-destructive">Failed to load tickets</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No tickets found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => setSelectedTicket(ticket)}
              className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", statusColors[ticket.status] || "")}>
                    {ticket.status}
                  </Badge>
                  <Badge className={cn("text-[10px]", priorityColors[ticket.priority] || "")}>
                    {ticket.priority}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="font-semibold text-sm">{ticket.subject}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <span>#{ticket.id.slice(0, 8)}</span>
                {ticket.orderId && <span>· Order #{ticket.orderId.slice(0, 8)}</span>}
                <span>· {ticket.messages.length} messages</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) { setSelectedTicket(null); reset(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn("text-xs", statusColors[selectedTicket.status] || "")}>
                    {selectedTicket.status}
                  </Badge>
                  <Badge className={cn("text-[10px]", priorityColors[selectedTicket.priority] || "")}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                <DialogDescription>
                  Created {new Date(selectedTicket.createdAt).toLocaleString("en-IN")}
                  {selectedTicket.orderId && <> · Order #{selectedTicket.orderId.slice(0, 8)}</>}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedTicket.user && (
                  <div className="rounded-lg border border-border p-3 space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3 w-3" /> User Info
                    </h4>
                    {selectedTicket.user.name && <p className="text-sm font-medium">{selectedTicket.user.name}</p>}
                    {selectedTicket.user.email && <p className="text-xs text-muted-foreground">{selectedTicket.user.email}</p>}
                    {selectedTicket.user.phoneNumber && <p className="text-xs text-muted-foreground">{selectedTicket.user.phoneNumber}</p>}
                  </div>
                )}

                {selectedTicket.category && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {(() => { const Ci = categoryIcons[selectedTicket.category] || HelpCircle; return <Ci className="h-3.5 w-3.5" />; })()}
                    <span className="capitalize">{selectedTicket.category.replace("-", " ")}</span>
                  </div>
                )}

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="text-muted-foreground">{selectedTicket.description}</p>
                </div>

                {selectedTicket.messages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Messages
                    </h4>
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className="rounded-lg border border-border p-3 text-sm">
                        <p>{msg.message}</p>
                        {msg.mediaUrls?.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {msg.mediaUrls.map((url, i) => (
                              <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                                <Image src={url} alt={`Media ${i + 1}`} fill className="object-cover" sizes="80px" />
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedTicket.status === "INPROGRESS" ? "default" : "outline"}
                      onClick={() => updateMutation.mutate({ ticketId: selectedTicket.id, status: "INPROGRESS" })}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1" /> In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTicket.status === "RESOLVED" ? "default" : "outline"}
                      onClick={() => updateMutation.mutate({ ticketId: selectedTicket.id, status: "RESOLVED" })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ ticketId: selectedTicket.id, status: "CLOSED" })}
                    >
                      Close
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit((data) => replyMutation.mutate({ ticketId: selectedTicket.id, message: data.message }))} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        {...register("message")}
                        placeholder="Type your reply..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit((data) => replyMutation.mutate({ ticketId: selectedTicket.id, message: data.message }))();
                          }
                        }}
                      />
                      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                    </div>
                    <Button
                      type="submit"
                      disabled={replyMutation.isPending}
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}