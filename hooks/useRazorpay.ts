"use client";

import { useCallback, useState } from "react";
import type { CartItem } from "@/stores/cartStore";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  localOrderId: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: {
    ondismiss: () => void;
  };
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; orderId?: string } | null>(null);

  const createOrder = useCallback(async (items: CartItem[]): Promise<CreateOrderResponse> => {
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, qty: i.qty, price: i.price })),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create order");
    }

    return res.json();
  }, []);

  const initiateCheckout = useCallback(async (items: CartItem[], total: number, phoneNumber: string) => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const order = await createOrder(items);

      const options: RazorpayCheckoutOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_T73mnMj6Sm4Zvi",
        amount: order.amount,
        currency: order.currency,
        name: "RrcKitchen",
        description: `Order for ${items.length} item(s)`,
        order_id: order.orderId,
        prefill: {
          contact: phoneNumber,
        },
        theme: {
          color: "#f97316",
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyRes.json();
            setPaymentResult({
              success: true,
              orderId: result.orderId,
            });
          } catch {
            setPaymentResult({ success: false });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentResult(null);
          },
        },
      };

      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).Razorpay) {
        const RazorpayConstructor = (window as unknown as Record<string, new (options: RazorpayCheckoutOptions) => { open: () => void }>).Razorpay;
        const razorpay = new RazorpayConstructor(options);
        razorpay.open();
      } else {
        console.log("[Razorpay] SDK not loaded.");
        setPaymentResult({ success: false });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("[Razorpay] Checkout failed:", error);
      setPaymentResult({ success: false });
      setIsProcessing(false);
    }
  }, [createOrder]);

  const resetPayment = useCallback(() => {
    setPaymentResult(null);
  }, []);

  return {
    initiateCheckout,
    isProcessing,
    paymentResult,
    resetPayment,
  };
}
