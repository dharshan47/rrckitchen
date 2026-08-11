import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Shape of a ticket message as returned by the admin support API. */
export interface AdminSupportTicketMessage {
  id: string;
  senderId: string | null;
  message: string;
  mediaUrls: string[];
  createdAt: string;
}

/** Shape of a support ticket as returned by the admin support API. */
export interface AdminSupportTicket {
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
  messages: AdminSupportTicketMessage[];
  user?: {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    image: string | null;
  };
  order?: {
    id: string;
    publicCode: string | null;
    totalAmount: string;
    status: string;
    createdAt: string;
    orderItems: {
      id: string;
      quantity: number;
      unitPrice: string;
      menuItem: { name: string };
    }[];
  } | null;
}

async function fetchSupportTickets(): Promise<AdminSupportTicket[]> {
  const res = await fetch("/api/admin/support");
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json() as Promise<AdminSupportTicket[]>;
}

async function updateSupportTicketStatus(ticketId: string, status: string) {
  const res = await fetch("/api/admin/support", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId, status }),
  });
  if (!res.ok) throw new Error("Failed to update ticket");
  return res.json();
}

async function replyToSupportTicket(ticketId: string, message: string) {
  const res = await fetch("/api/admin/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId, message }),
  });
  if (!res.ok) throw new Error("Failed to send reply");
  return res.json();
}

/** State shape for the admin support store. */
interface AdminSupportState {
  tickets: AdminSupportTicket[];
  selectedTicket: AdminSupportTicket | null;
  setTickets: (tickets: AdminSupportTicket[]) => void;
  setSelectedTicket: (ticket: AdminSupportTicket | null) => void;
  resetAdminSupportState: () => void;
}

/** Selector returning the tickets list. */
export const selectAdminSupportTickets = (s: AdminSupportState) => s.tickets;
/** Selector returning the ticket open in the details panel. */
export const selectAdminSelectedSupportTicket = (s: AdminSupportState) => s.selectedTicket;
/** Selector returning all support actions in a single object (stable via shallow). */
export const selectAdminSupportActions = (s: AdminSupportState) => ({
  setTickets: s.setTickets,
  setSelectedTicket: s.setSelectedTicket,
  resetAdminSupportState: s.resetAdminSupportState,
});

/**
 * Zustand store for the admin support page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the ticket open in the details
 * panel lives here too.
 */
export const adminSupportStore = create<AdminSupportState>()((set) => ({
  tickets: [],
  selectedTicket: null,
  setTickets: (tickets: AdminSupportTicket[]) => set({ tickets }),
  setSelectedTicket: (selectedTicket: AdminSupportTicket | null) => set({ selectedTicket }),
  resetAdminSupportState: () => set({ tickets: [], selectedTicket: null }),
}));

/** Hook returning the tickets list. */
export function useAdminSupportTickets() {
  return adminSupportStore(selectAdminSupportTickets);
}
/** Hook returning the ticket open in the details panel. */
export function useAdminSelectedSupportTicket() {
  return adminSupportStore(selectAdminSelectedSupportTicket);
}
/** Hook returning all support actions (stable reference). */
export function useAdminSupportActions() {
  return adminSupportStore(useShallow(selectAdminSupportActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin support tickets via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminSupportTicketsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: fetchSupportTickets,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminSupportStore.getState().setTickets(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Updates a support ticket's status. Invalidates the tickets query on
 * success and patches the ticket open in the details panel for immediate
 * UI feedback.
 */
export function useAdminUpdateTicketStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      updateSupportTicketStatus(ticketId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      const current = adminSupportStore.getState().selectedTicket;
      if (current && current.id === variables.ticketId) {
        adminSupportStore
          .getState()
          .setSelectedTicket({
            ...current,
            status: variables.status as AdminSupportTicket["status"],
          });
      }
    },
  });
}

/**
 * Sends an admin reply to a support ticket. Invalidates the tickets
 * query on success.
 */
export function useAdminReplyToTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      replyToSupportTicket(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });
}
