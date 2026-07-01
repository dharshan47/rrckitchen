import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRazorpay } from "@/hooks/useRazorpay";
import { act } from "react";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as Record<string, unknown>).Razorpay;
});

function TestHarness() {
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } = useRazorpay();
  return (
    <div>
      <div data-testid="processing">{isProcessing ? "true" : "false"}</div>
      <div data-testid="result">{paymentResult ? JSON.stringify(paymentResult) : "null"}</div>
      <button onClick={() => initiateCheckout(
        [{ id: "m1", name: "Idli", price: 80, qty: 2, foodType: "VEG", timeSlot: "MORNING", kitchenName: "TK" }],
        160,
        "+919876543210"
      )}>
        Pay
      </button>
      <button onClick={resetPayment}>Reset</button>
    </div>
  );
}

describe("useRazorpay", () => {
  it("initialises with idle state", () => {
    render(<TestHarness />);
    expect(screen.getByTestId("processing")).toHaveTextContent("false");
    expect(screen.getByTestId("result")).toHaveTextContent("null");
  });

  it("calls create-order endpoint on pay", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: "order_RZP123", amount: 16000, currency: "INR", localOrderId: "ord_local" }),
    });

    const razorpayOpen = vi.fn();
    (window as Record<string, unknown>).Razorpay = class {
      constructor() {}
      open() { razorpayOpen(); }
    };

    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: "m1", qty: 2, price: 80 }] }),
      });
    });
  });

  it("sets success result after payment verification", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderId: "order_RZP123", amount: 16000, currency: "INR", localOrderId: "ord_local" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, orderId: "ord_local" }),
      });

    let capturedHandler: ((r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void) | null = null;

    (window as Record<string, unknown>).Razorpay = class {
      constructor(options: Record<string, unknown>) {
        capturedHandler = options.handler as typeof capturedHandler;
      }
      open() {}
    };

    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => {
      expect(capturedHandler).not.toBeNull();
    });

    await act(async () => {
      capturedHandler!({
        razorpay_payment_id: "pay_RZP123",
        razorpay_order_id: "order_RZP123",
        razorpay_signature: "sig_abc123",
      });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_RZP123",
          razorpay_payment_id: "pay_RZP123",
          razorpay_signature: "sig_abc123",
        }),
      });
    });

    await waitFor(() => {
      const el = screen.getByTestId("result");
      expect(JSON.parse(el.textContent!)).toMatchObject({ success: true, orderId: "ord_local" });
    });
  });

  it("sets failed result on create-order error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Server error" }) });

    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => {
      const el = screen.getByTestId("result");
      expect(JSON.parse(el.textContent!)).toMatchObject({ success: false });
    });
  });

  it("sets failed result when verify endpoint fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderId: "order_RZP123", amount: 16000, currency: "INR", localOrderId: "ord_local" }),
      })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Signature mismatch" }) });

    let capturedHandler: ((r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void) | null = null;
    (window as Record<string, unknown>).Razorpay = class {
      constructor(options: Record<string, unknown>) {
        capturedHandler = options.handler as typeof capturedHandler;
      }
      open() {}
    };

    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => expect(capturedHandler).not.toBeNull());

    await act(async () => {
      capturedHandler!({
        razorpay_payment_id: "pay_RZP123",
        razorpay_order_id: "order_RZP123",
        razorpay_signature: "bad_sig",
      });
    });

    await waitFor(() => {
      const el = screen.getByTestId("result");
      expect(JSON.parse(el.textContent!)).toMatchObject({ success: false });
    });
  });

  it("resets payment result", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderId: "order_RZP123", amount: 16000, currency: "INR", localOrderId: "ord_local" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, orderId: "ord_local" }),
      });

    let capturedHandler: ((r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void) | null = null;
    (window as Record<string, unknown>).Razorpay = class {
      constructor(options: Record<string, unknown>) {
        capturedHandler = options.handler as typeof capturedHandler;
      }
      open() {}
    };

    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /pay/i }));
    await waitFor(() => expect(capturedHandler).not.toBeNull());

    await act(async () => {
      capturedHandler!({ razorpay_payment_id: "p", razorpay_order_id: "o", razorpay_signature: "s" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("result")).not.toHaveTextContent("null");
    });

    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByTestId("result")).toHaveTextContent("null");
  });
});
