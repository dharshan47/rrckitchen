"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UpiCollectStatus = "IDLE" | "CREATING" | "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "ERROR";

export interface UpiCollectState {
  /** The VPA (Virtual Payment Address) to pay to, e.g. rrc.abc123@razorpay */
  vpa: string | null;
  /** When the VPA expires */
  expiresAt: Date | null;
  /** Current status of the collect request */
  status: UpiCollectStatus;
  /** True while TanStack Query is refetching for payment confirmation */
  isPolling: boolean;
  /** Error message if status is ERROR */
  error: string | null;
  /** The confirmed local order ID once status is PAID */
  confirmedOrderId: string | null;
}

interface CollectCreateResponse {
  vpa: string;
  expiresAt: string;
  status: string;
}

interface CollectStatusResponse {
  status: string;
  orderId?: string;
}

// ── Query keys ────────────────────────────────────────────────────────────────

const collectStatusKey = (orderId: string) => ["upi-collect-status", orderId] as const;

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchCollectStatus(orderId: string): Promise<CollectStatusResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`/api/payment/upi-collect/status?orderId=${encodeURIComponent(orderId)}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch UPI collect status" }));
      throw new Error(err.error ?? "Failed to fetch UPI collect status");
    }
    return res.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Status check timed out. Retrying…");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function createCollectRequest(orderId: string): Promise<CollectCreateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch("/api/payment/upi-collect/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create UPI collect request" }));
      throw new Error(err.error ?? "Failed to create UPI collect request");
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

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook for the Razorpay Smart Collect (UPI VPA) flow — built on TanStack Query.
 *
 * Usage:
 * ```tsx
 * const { state, createCollect, stopPolling, reset } = useUpiCollect();
 *
 * // 1. After order creation, generate a VPA:
 * await createCollect(orderId);
 *
 * // 2. Show state.vpa as a QR / copyable address.
 *    TanStack Query polls automatically every 4s. Watch state.status for "PAID".
 * ```
 *
 * Requires Razorpay Smart Collect to be enabled on your account.
 */
export function useUpiCollect() {
  const queryClient = useQueryClient();

  // True once stopPolling() is called — prevents refetchInterval from
  // restarting after the in-flight request is cancelled.
  const [pollStopped, setPollStopped] = useState(false);

  // Ref that tracks the latest orderId so the unmount cleanup can clear the
  // polling query even after the mutation has been reset.
  const activeOrderIdRef = useRef<string | null>(null);

  // ── Mutation: create VPA ──────────────────────────────────────────────────

  const createMutation = useMutation<CollectCreateResponse, Error, string>({
    mutationFn: createCollectRequest,
    onMutate: (orderId) => {
      activeOrderIdRef.current = orderId;
      setPollStopped(false);
    },
    onSuccess: (data, orderId) => {
      // Seed the status cache so the polling query starts immediately
      queryClient.setQueryData<CollectStatusResponse>(collectStatusKey(orderId), {
        status: data.status,
        orderId: data.status === "PAID" ? orderId : undefined,
      });
    },
  });

  // ── Active orderId (from mutation variable) ───────────────────────────────

  const activeOrderId = createMutation.variables ?? null;

  // Keep the ref in sync with the mutation variable as well
  useEffect(() => {
    if (activeOrderId) activeOrderIdRef.current = activeOrderId;
  }, [activeOrderId]);

  // Stop any background polling when the component using this hook unmounts —
  // otherwise the query keeps refetching every 4s for the life of the app.
  useEffect(() => {
    return () => {
      const orderId = activeOrderIdRef.current;
      if (orderId) {
        queryClient.cancelQueries({ queryKey: collectStatusKey(orderId) });
        queryClient.removeQueries({ queryKey: collectStatusKey(orderId) });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The status from the create response (before first poll)
  const createStatus = createMutation.data?.status ?? null;

  // Whether to keep polling: only when a VPA exists and is still PENDING
  const shouldPoll =
    !!activeOrderId &&
    createMutation.isSuccess &&
    !pollStopped &&
    createStatus !== "PAID" &&
    createStatus !== "EXPIRED" &&
    createStatus !== "FAILED";

  // ── Query: poll status ────────────────────────────────────────────────────

  const statusQuery = useQuery<CollectStatusResponse, Error>({
    queryKey: activeOrderId ? collectStatusKey(activeOrderId) : ["upi-collect-status", "__none__"],
    queryFn: () => fetchCollectStatus(activeOrderId!),
    enabled: shouldPoll,
    // Poll every 4 seconds while PENDING
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (!s || s === "PENDING") return 4_000;
      return false; // stop polling once resolved
    },
    // Keep data fresh — don't stale out between polls
    staleTime: 0,
    // Don't retry on error — just wait for next interval
    retry: false,
  });

  // ── Derived state ─────────────────────────────────────────────────────────

  const resolvedStatus = statusQuery.data?.status ?? createStatus ?? null;

  const status: UpiCollectStatus = (() => {
    if (createMutation.isPending) return "CREATING";
    if (createMutation.isError) return "ERROR";
    if (!createMutation.isSuccess) return "IDLE";
    if (resolvedStatus === "PAID") return "PAID";
    if (resolvedStatus === "EXPIRED") return "EXPIRED";
    if (resolvedStatus === "FAILED") return "FAILED";
    if (resolvedStatus === "PENDING") return "PENDING";
    return "IDLE";
  })();

  const state: UpiCollectState = {
    vpa: createMutation.data?.vpa ?? null,
    expiresAt: createMutation.data?.expiresAt ? new Date(createMutation.data.expiresAt) : null,
    status,
    isPolling: statusQuery.isFetching && status === "PENDING",
    error: createMutation.error?.message ?? statusQuery.error?.message ?? null,
    confirmedOrderId:
      statusQuery.data?.orderId ??
      (status === "PAID" && activeOrderId ? activeOrderId : null),
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Creates a UPI Smart Collect VPA for the given orderId and starts polling. */
  const createCollect = (orderId: string) => {
    // If switching to a different order, drop the previous order's cache so it
    // never leaks into the new flow (stale PAID/EXPIRED status, etc.).
    const previousOrderId = activeOrderIdRef.current;
    if (previousOrderId && previousOrderId !== orderId) {
      queryClient.removeQueries({ queryKey: collectStatusKey(previousOrderId) });
    }
    createMutation.mutate(orderId);
  };

  /** Manually stops the polling query (refetchInterval will not restart). */
  const stopPolling = () => {
    setPollStopped(true);
    const orderId = activeOrderId ?? activeOrderIdRef.current;
    if (orderId) {
      queryClient.cancelQueries({ queryKey: collectStatusKey(orderId) });
    }
  };

  /** Resets all mutation and query state back to IDLE. */
  const reset = () => {
    setPollStopped(false);
    const orderId = activeOrderId ?? activeOrderIdRef.current;
    if (orderId) {
      queryClient.removeQueries({ queryKey: collectStatusKey(orderId) });
    }
    activeOrderIdRef.current = null;
    createMutation.reset();
  };

  return { state, createCollect, stopPolling, reset };
}
