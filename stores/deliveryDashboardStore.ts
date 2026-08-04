import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { getDeliveryDashboardData } from "@/actions/admin/dashboard";
import type { getDeliveryPaymentsData } from "@/actions/delivery/payments";
import type { getDeliveryReviewsData } from "@/actions/delivery/reviews";
import type { getDeliveryProfileData } from "@/actions/delivery/profile";

type DeliveryDashboardData = Awaited<ReturnType<typeof getDeliveryDashboardData>>;
type DeliveryPaymentsData = Awaited<ReturnType<typeof getDeliveryPaymentsData>>;
type DeliveryReviewsData = Awaited<ReturnType<typeof getDeliveryReviewsData>>;
type DeliveryProfileData = Awaited<ReturnType<typeof getDeliveryProfileData>>;

export interface DeliverySupportMessage {
  id: string
  senderId: string | null
  message: string
  mediaUrls: string[]
  createdAt: string
}

export interface DeliverySupportTicket {
  id: string
  userId: string
  orderId: string | null
  subject: string
  description: string
  status: "OPEN" | "INPROGRESS" | "RESOLVED" | "CLOSED" | "URGENT"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  createdAt: string
  updatedAt: string
  messages: DeliverySupportMessage[]
}

interface DeliveryDashboardState {
  data: DeliveryDashboardData | null;
  payments: DeliveryPaymentsData | null;
  reviews: DeliveryReviewsData | null;
  profile: DeliveryProfileData | null;
  supportTickets: DeliverySupportTicket[] | null;
  isOnline: boolean;
  setData: (data: DeliveryDashboardData | null) => void;
  setPayments: (payments: DeliveryPaymentsData | null) => void;
  setReviews: (reviews: DeliveryReviewsData | null) => void;
  setProfile: (profile: DeliveryProfileData | null) => void;
  setSupportTickets: (tickets: DeliverySupportTicket[] | null) => void;
  setOnline: (online: boolean) => void;
  reset: () => void;
}

export const deliveryDashboardStore = create<DeliveryDashboardState>()((set) => ({
  data: null,
  payments: null,
  reviews: null,
  profile: null,
  supportTickets: null,
  isOnline: false,
  setData: (data) => set({ data }),
  setPayments: (payments) => set({ payments }),
  setReviews: (reviews) => set({ reviews }),
  setProfile: (profile) => set({ profile }),
  setSupportTickets: (supportTickets) => set({ supportTickets }),
  setOnline: (online) => set({ isOnline: online }),
  reset: () => set({
    data: null,
    payments: null,
    reviews: null,
    profile: null,
    supportTickets: null,
    isOnline: false,
  }),
}));

const selectDeliveryData = (s: DeliveryDashboardState) => s.data;
const selectDeliveryPayments = (s: DeliveryDashboardState) => s.payments;
const selectDeliveryReviews = (s: DeliveryDashboardState) => s.reviews;
const selectDeliveryProfile = (s: DeliveryDashboardState) => s.profile;
const selectDeliverySupportTickets = (s: DeliveryDashboardState) => s.supportTickets;
const selectDeliveryIsOnline = (s: DeliveryDashboardState) => s.isOnline;
const selectDeliveryActions = (s: DeliveryDashboardState) => ({
  setData: s.setData,
  setPayments: s.setPayments,
  setReviews: s.setReviews,
  setProfile: s.setProfile,
  setSupportTickets: s.setSupportTickets,
  setOnline: s.setOnline,
  reset: s.reset,
});

/** Reactive dashboard payload for sidebar widgets + dashboard page. */
export function useDeliveryData() {
  return deliveryDashboardStore(selectDeliveryData);
}
/** Reactive payments payload for the payments page. */
export function useDeliveryPayments() {
  return deliveryDashboardStore(selectDeliveryPayments);
}
/** Reactive reviews payload for the reviews page. */
export function useDeliveryReviews() {
  return deliveryDashboardStore(selectDeliveryReviews);
}
/** Reactive profile payload for the profile page. */
export function useDeliveryProfile() {
  return deliveryDashboardStore(selectDeliveryProfile);
}
/** Reactive support tickets payload for the support page. */
export function useDeliverySupportTickets() {
  return deliveryDashboardStore(selectDeliverySupportTickets);
}
export function useDeliveryIsOnline() {
  return deliveryDashboardStore(selectDeliveryIsOnline);
}
export function useDeliveryActions() {
  return deliveryDashboardStore(useShallow(selectDeliveryActions));
}