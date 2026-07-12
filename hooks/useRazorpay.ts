"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  config?: {
    display: {
      blocks: Record<string, { name: string; instruments: { method: string }[] }>;
      sequence: string[];
      preferences: {
        show_default_blocks?: boolean;
      };
    };
  };
}

type RazorpayInstance = new (options: RazorpayCheckoutOptions) => { open: () => void };

async function loadRazorpaySdk(): Promise<RazorpayInstance | null> {
  if (typeof window === "undefined") return null;

  if ((window as unknown as Record<string, unknown>).Razorpay) {
    return (window as unknown as Record<string, RazorpayInstance>).Razorpay;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve((window as unknown as Record<string, RazorpayInstance>).Razorpay ?? null);
    };
    script.onerror = () => {
      console.error("[Razorpay] Failed to load SDK.");
      resolve(null);
    };
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; orderId?: string; error?: string } | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async (input: { items: CartItem[]; couponCode?: string }): Promise<CreateOrderResponse> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      try {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: input.items.map((i) => ({ id: i.id, qty: i.qty, price: i.price })),
            couponCode: input.couponCode,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
          throw new Error(err.error || `Request failed (${res.status})`);
        }

        return res.json();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new Error("Request timed out. Please try again.");
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const initiateCheckout = useCallback(async (items: CartItem[], total: number, phoneNumber: string, couponCode?: string) => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const order = await createOrderMutation.mutateAsync({ items, couponCode });

      const options: RazorpayCheckoutOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "RRC Kitchen",
        description: `Order for ${items.length} item(s)`,
        order_id: order.orderId,
        prefill: {
          contact: phoneNumber,
        },
        theme: {
          color: "#EE7005",
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI — Google Pay, PhonePe, Paytm",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
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
          ondismiss: async () => {
            try {
              await fetch("/api/payment/fail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ razorpay_order_id: order.orderId }),
              });
            } catch {
              // silent
            }
            setIsProcessing(false);
            setPaymentResult(null);
          },
        },
      };

      const razorpayInstance = await loadRazorpaySdk();
      if (!razorpayInstance) {
        console.log("[Razorpay] SDK not loaded.");
        setPaymentResult({ success: false });
        setIsProcessing(false);
        return;
      }
      const razorpay = new razorpayInstance(options);
      razorpay.open();
    } catch (error) {
      console.error("[Razorpay] Checkout failed:", error);
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      setPaymentResult({ success: false, error: message });
      setIsProcessing(false);
    }
  }, [createOrderMutation]);

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
