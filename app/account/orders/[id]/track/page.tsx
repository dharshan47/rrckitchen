import { Metadata } from "next";
import { TrackOrderClient } from "@/components/order/track-order-client";

export const metadata: Metadata = {
  title: "Track Order | RRC Kitchen",
  description: "Track your RRC Kitchen order in real time.",
};

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <TrackOrderClient orderId={id} />;
}
