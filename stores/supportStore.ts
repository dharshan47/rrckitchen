import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** A message inside a support ticket. */
export interface TicketMessage {
  id: string;
  senderId: string | null;
  message: string;
  mediaUrls: string[];
  createdAt: string;
}

/** A support ticket row as returned by /api/support. */
export interface SupportTicket {
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
}

/** Valid ticket priorities. */
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** Payload used to create a new support ticket. */
export interface CreateTicketInput {
  subject: string;
  description: string;
  orderId?: string;
  category: string;
  priority: string;
  mediaUrls: string[];
}

/** State shape for the support store. */
interface SupportState {
  tickets: SupportTicket[];
  activeTab: string;
  selectedCategory: string;
  priority: TicketPriority;
  uploadedImages: string[];
  uploading: boolean;
  setTickets: (tickets: SupportTicket[]) => void;
  setActiveTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setPriority: (priority: TicketPriority) => void;
  setUploadedImages: (images: string[] | ((prev: string[]) => string[])) => void;
  setUploading: (uploading: boolean) => void;
  resetSupportState: () => void;
}

/** Selector returning the tickets list. */
export const selectSupportTickets = (s: SupportState) => s.tickets;
/** Selector returning the active ticket filter tab. */
export const selectSupportActiveTab = (s: SupportState) => s.activeTab;
/** Selector returning the selected ticket category. */
export const selectSupportCategory = (s: SupportState) => s.selectedCategory;
/** Selector returning the ticket priority. */
export const selectSupportPriority = (s: SupportState) => s.priority;
/** Selector returning the uploaded image URLs. */
export const selectSupportUploadedImages = (s: SupportState) => s.uploadedImages;
/** Selector returning whether an image upload is in progress. */
export const selectSupportUploading = (s: SupportState) => s.uploading;
/** Selector returning all support actions in a single object (stable via shallow). */
export const selectSupportActions = (s: SupportState) => ({
  setTickets: s.setTickets,
  setActiveTab: s.setActiveTab,
  setSelectedCategory: s.setSelectedCategory,
  setPriority: s.setPriority,
  setUploadedImages: s.setUploadedImages,
  setUploading: s.setUploading,
  resetSupportState: s.resetSupportState,
});

/**
 * Zustand store for the support page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the ticket form UI state
 * lives here too.
 */
export const supportStore = create<SupportState>()((set) => ({
  tickets: [],
  activeTab: "All",
  selectedCategory: "",
  priority: "MEDIUM",
  uploadedImages: [],
  uploading: false,
  setTickets: (tickets: SupportTicket[]) => set({ tickets }),
  setActiveTab: (activeTab: string) => set({ activeTab }),
  setSelectedCategory: (selectedCategory: string) => set({ selectedCategory }),
  setPriority: (priority: TicketPriority) => set({ priority }),
  setUploadedImages: (uploadedImages) =>
    set((state) => ({
      uploadedImages:
        typeof uploadedImages === "function"
          ? uploadedImages(state.uploadedImages)
          : uploadedImages,
    })),
  setUploading: (uploading: boolean) => set({ uploading }),
  resetSupportState: () =>
    set({
      tickets: [],
      activeTab: "All",
      selectedCategory: "",
      priority: "MEDIUM",
      uploadedImages: [],
      uploading: false,
    }),
}));

/** Hook returning the tickets list. */
export function useSupportTickets() {
  return supportStore(selectSupportTickets);
}
/** Hook returning the active ticket filter tab. */
export function useSupportActiveTab() {
  return supportStore(selectSupportActiveTab);
}
/** Hook returning the selected ticket category. */
export function useSupportCategory() {
  return supportStore(selectSupportCategory);
}
/** Hook returning the ticket priority. */
export function useSupportPriority() {
  return supportStore(selectSupportPriority);
}
/** Hook returning the uploaded image URLs. */
export function useSupportUploadedImages() {
  return supportStore(selectSupportUploadedImages);
}
/** Hook returning whether an image upload is in progress. */
export function useSupportUploading() {
  return supportStore(selectSupportUploading);
}
/** Hook returning all support actions (stable reference). */
export function useSupportActions() {
  return supportStore(useShallow(selectSupportActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the user's support tickets via TanStack Query and syncs the
 * result into the zustand store. Runs only when the user is logged in.
 */
export function useSupportTicketsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<SupportTicket[]>;
    },
    enabled,
  });

  useEffect(() => {
    supportStore.getState().setTickets(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Creates a new support ticket. Invalidates the tickets query, resets
 * the ticket form UI state and shows a toast on success.
 * @param onSuccess Optional callback (e.g. to reset the form) invoked
 * after the tickets query has been invalidated.
 */
export function useCreateSupportTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create ticket" }));
        throw new Error(err.error || "Failed to create ticket");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      toast.success("Support ticket created successfully!");
      supportStore.getState().setSelectedCategory("");
      supportStore.getState().setPriority("MEDIUM");
      supportStore.getState().setUploadedImages([]);
      supportStore.getState().setActiveTab("Open");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    },
  });
}
