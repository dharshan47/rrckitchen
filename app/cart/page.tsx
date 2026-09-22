import { Metadata } from "next";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { CartContent } from "@/components/cart/cart-content";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your cart, apply coupons and proceed to secure checkout.",
};

export default function CartPage() {
  return (
    <ErrorBoundary>
      <CartContent />
    </ErrorBoundary>
  );
}
