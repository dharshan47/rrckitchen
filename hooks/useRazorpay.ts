"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItem } from "@/stores/cartStore";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateOrderInput {
  items: { id: string; qty: number; price: number }[];
  couponCode?: string;
  serviceDateType?: string;
  serviceDate?: string;
  timeSlot?: string;
  addressId?: string;
}

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  localOrderId: string;
  publicCode?: string;
}

interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment_method_detail?: Record<string, any>;
}

interface VerifyPaymentResponse {
  orderId: string;
  publicCode?: string;
}

interface RazorpayMethodBlock {
  name: string;
  instruments: { method: string; flows?: string[] }[];
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
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
    backdrop_color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }) => void;
  modal: {
    ondismiss: () => void;
    confirm_close?: boolean;
  };
  config?: {
    display: {
      blocks: Record<string, RazorpayMethodBlock>;
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  notes?: Record<string, string>;
}

type RazorpayInstance = new (options: RazorpayCheckoutOptions) => { open: () => void };

// ── SDK loader ────────────────────────────────────────────────────────────────

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_TIMEOUT_MS = 20_000;

function getRazorpaySdk(): RazorpayInstance | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as Record<string, RazorpayInstance>).Razorpay ?? null;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>("script[src*='checkout.razorpay.com']");

    // A script that already failed is dead in the water — remove it so the
    // next attempt injects a fresh element instead of hanging on dead listeners.
    if (existing) {
      if (existing.dataset.failed === "true") existing.remove();
      else if (existing.dataset.loaded === "true") { resolve(true); return; }
      else {
        const timeoutId = setTimeout(() => resolve(false), RAZORPAY_SCRIPT_TIMEOUT_MS);
        existing.addEventListener("load", () => { clearTimeout(timeoutId); resolve(true); });
        existing.addEventListener("error", () => { clearTimeout(timeoutId); resolve(false); });
        return;
      }
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    let settled = false;
    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (ok) script.dataset.loaded = "true";
      else script.dataset.failed = "true";
      resolve(ok);
    };
    const timeoutId = setTimeout(() => settle(false), RAZORPAY_SCRIPT_TIMEOUT_MS);
    script.onload = () => settle(true);
    script.onerror = () => settle(false);
    document.body.appendChild(script);
  });
}

function waitForRazorpaySdk(timeoutMs = 10_000): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const poll = () => {
      if (getRazorpaySdk()) { resolve(true); return; }
      if (Date.now() - start >= timeoutMs) { resolve(false); return; }
      setTimeout(poll, 200);
    };
    poll();
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves the publishable Razorpay key id.
 *
 * Prefers the build-time-inlined NEXT_PUBLIC_RAZORPAY_KEY_ID, falling back to
 * a runtime probe of /api/payment/config. The fallback ensures payments keep
 * working even when the client bundle was built without the public env var
 * (e.g. builds where .env is not available), as long as the server has the
 * credentials configured.
 */
async function resolveRazorpayKeyId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  try {
    const res = await fetch("/api/payment/config");
    if (!res.ok) return null;
    const config = await res.json().catch(() => null) as { keyId?: string } | null;
    return config?.keyId ?? null;
  } catch {
    return null;
  }
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchCreateOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  const controller = new AbortController();
  // create-order does several DB round-trips plus a Razorpay API call, and may
  // hit a cold start (or a dev-mode route compile) — give it a generous window.
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: input.items,
        couponCode: input.couponCode,
        serviceDateType: input.serviceDateType ?? "TOMORROW",
        serviceDate: input.serviceDate,
        timeSlot: input.timeSlot,
        addressId: input.addressId,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      throw new Error(err.error ?? `Request failed (${res.status})`);
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
}

async function fetchVerifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
  const res = await fetch("/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Payment verification failed");
  return res.json();
}

async function fetchFailPayment(razorpayOrderId: string): Promise<void> {
  await fetch("/api/payment/fail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ razorpay_order_id: razorpayOrderId }),
  }).catch(() => { /* silent */ });
}

// ── Payment method blocks config ──────────────────────────────────────────────

/**
 * Explicit Razorpay checkout block order:
 * UPI (Google Pay · PhonePe · Paytm) → Net Banking → Wallets → Cards
 */
const PAYMENT_BLOCKS_CONFIG: RazorpayCheckoutOptions["config"] = {
  display: {
    blocks: {
      upi: {
        name: "UPI  ·  Google Pay · PhonePe · Paytm · Any UPI App",
        instruments: [{ method: "upi" }],
      },
      netbanking: {
        name: "Net Banking",
        instruments: [{ method: "netbanking" }],
      },
      wallet: {
        name: "Wallets  ·  Paytm · Freecharge · Mobikwik",
        instruments: [{ method: "wallet" }],
      },
      card: {
        name: "Debit / Credit / Rupay Cards",
        instruments: [{ method: "card" }],
      },
    },
    sequence: ["block.upi", "block.netbanking", "block.wallet", "block.card"],
    preferences: { show_default_blocks: false },
  },
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const razorpayMutationKeys = {
  createOrder: ["razorpay", "create-order"] as const,
  verifyPayment: ["razorpay", "verify-payment"] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRazorpay() {
  const queryClient = useQueryClient();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ── Mutation 1: create Razorpay order ──────────────────────────────────────
  // retry: 0 — each attempt creates a new Razorpay order, so retries would
  // duplicate orders on flaky networks.
  const createOrderMutation = useMutation<CreateOrderResponse, Error, CreateOrderInput>({
    mutationKey: razorpayMutationKeys.createOrder,
    mutationFn: fetchCreateOrder,
    retry: 0,
  });

  // ── Mutation 2: verify payment signature + confirm order ───────────────────
  // retry: 0 — confirmPayment is not idempotent (double payouts/loyalty on retry).
  const verifyPaymentMutation = useMutation<VerifyPaymentResponse, Error, VerifyPaymentInput>({
    mutationKey: razorpayMutationKeys.verifyPayment,
    mutationFn: fetchVerifyPayment,
    retry: 0,
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const [modalOpen, setModalOpen] = useState(false);

  /** True while creating the order OR while the Razorpay modal is open (verifying) */
  const isProcessing =
    createOrderMutation.isPending ||
    verifyPaymentMutation.isPending ||
    modalOpen;

  const paymentResult: { success: boolean; orderId?: string; publicCode?: string; error?: string } | null = (() => {
    if (verifyPaymentMutation.isSuccess) {
      return { success: true, orderId: verifyPaymentMutation.data.orderId, publicCode: verifyPaymentMutation.data.publicCode };
    }
    if (verifyPaymentMutation.isError) {
      return { success: false, error: verifyPaymentMutation.error.message };
    }
    if (createOrderMutation.isError) {
      return { success: false, error: createOrderMutation.error.message };
    }
    if (checkoutError) {
      return { success: false, error: checkoutError };
    }
    return null;
  })();

  // ── Main checkout action ───────────────────────────────────────────────────

  const initiateCheckout = useCallback(async (
    items: CartItem[],
    total: number,
    phoneNumber: string,
    couponCode?: string,
    serviceDateType?: string,
    serviceDate?: string,
    timeSlot?: string,
    addressId?: string,
    prefill?: { name?: string; email?: string },
  ) => {
    const razorpayKeyId = await resolveRazorpayKeyId();
    if (!razorpayKeyId) {
      verifyPaymentMutation.reset();
      createOrderMutation.reset();
      setCheckoutError("Online payment is temporarily unavailable.");
      console.error("[Razorpay] Razorpay key id is not configured.");
      return;
    }

    // Reset both mutations so paymentResult starts null
    createOrderMutation.reset();
    verifyPaymentMutation.reset();
    setCheckoutError(null);

    try {
      // Ensure Razorpay SDK is loaded before creating the order.
      // Transient network failures (e.g. ERR_INSUFFICIENT_RESOURCES while the
      // SDK pulls its chunks) are retried once with a short backoff.
      let sdkReady = getRazorpaySdk() || await waitForRazorpaySdk(3_000);
      if (!sdkReady) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const loaded = await loadRazorpayScript();
          if (loaded) {
            const sdkLoaded = await waitForRazorpaySdk(10_000);
            if (sdkLoaded) { sdkReady = true; break; }
          }
          if (attempt === 0) await sleep(1_000);
        }
      }
      if (!sdkReady) throw new Error("Payment service could not be loaded. Please check your connection and try again.");

      // Create the Razorpay order via mutation
      const order = await createOrderMutation.mutateAsync({
        items: items.map((i) => ({ id: i.id, qty: i.qty, price: i.price })),
        couponCode,
        serviceDateType,
        serviceDate,
        timeSlot,
        addressId,
      });

      const RazorpayCtor = getRazorpaySdk();
      if (!RazorpayCtor) throw new Error("Payment service not available. Please refresh and try again.");

      const razorpay = new RazorpayCtor({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "RRC Kitchen",
        description: `Order for ${items.length} item(s)  •  ₹${total.toFixed(2)}`,
        order_id: order.orderId,
        prefill: { contact: phoneNumber, name: prefill?.name, email: prefill?.email },
        theme: { color: "#EE7005" },
        config: PAYMENT_BLOCKS_CONFIG,
        notes: { localOrderId: order.localOrderId },
        modal: {
          confirm_close: true,
          ondismiss: async () => {
            setModalOpen(false);
            await fetchFailPayment(order.orderId);
            // Reset so paymentResult goes back to null (modal dismissed ≠ failure)
            createOrderMutation.reset();
            verifyPaymentMutation.reset();
            setCheckoutError(null);
          },
        },
        handler: async (response) => {
          // Extract rich payment method detail from the Razorpay handler payload
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detail: Record<string, any> = {};
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ...rest } = response;
          for (const key of ["method", "wallet", "bank", "vpa", "card", "upi_app", "upi_id"]) {
            if (rest[key] !== undefined) detail[key] = rest[key];
          }

          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              payment_method_detail: Object.keys(detail).length > 0 ? detail : undefined,
            });

            // Invalidate any order-related queries so order lists refresh
            await queryClient.invalidateQueries({ queryKey: ["orders"] });
          } catch {
            // Verification errors surface via paymentResult
          } finally {
            setModalOpen(false);
          }
        },
      });

      razorpay.open();
      setModalOpen(true);
    } catch (error) {
      // Errors surface automatically via createOrderMutation.error,
      // verifyPaymentMutation.error, or checkoutError below.
      setCheckoutError(error instanceof Error ? error.message : "Payment could not be completed. Please try again.");
      console.error("[Razorpay] Checkout failed:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPayment = useCallback(() => {
    createOrderMutation.reset();
    verifyPaymentMutation.reset();
    setCheckoutError(null);
  }, [createOrderMutation, verifyPaymentMutation]);

  return {
    initiateCheckout,
    isProcessing,
    paymentResult,
    resetPayment,
    /** Expose raw mutations for granular loading states if needed */
    createOrderMutation,
    verifyPaymentMutation,
  };
}
