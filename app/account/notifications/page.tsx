import { Metadata } from "next";
import { NotificationsContent } from "@/components/account/notifications-content";

export const metadata: Metadata = {
  title: "Notifications | RRC Kitchen",
  description: "Order updates, offers and reward alerts",
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}