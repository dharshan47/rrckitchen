import { Metadata } from "next";
import { ReviewsContent } from "@/components/account/reviews-content";

export const metadata: Metadata = {
  title: "My Reviews",
  description: "Reviews you have given for orders",
};

export default function ReviewsPage() {
  return <ReviewsContent />;
}