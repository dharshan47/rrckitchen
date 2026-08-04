import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRazorpay } from '@/hooks/useRazorpay';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
};

const mockItem = { id: '1', name: 'Idli', price: 80, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'TK' };
const mockOrderResponse = {
  orderId: 'order_razorpay_123',
  amount: 8000,
  currency: 'INR',
  localOrderId: 'local_123',
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_key';
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockOrderResponse),
  });
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
});

describe('useRazorpay', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.paymentResult).toBeNull();
  });

  it('returns error when RAZORPAY_KEY_ID is missing', async () => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });
    expect(result.current.paymentResult).toEqual({
      success: false,
      error: 'Online payment is temporarily unavailable.',
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it('sets error when create-order API returns failure', async () => {
    vi.stubGlobal('Razorpay', function RazorpayMock(this: { open: ReturnType<typeof vi.fn> }) { this.open = vi.fn(); });
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Cart is empty' }),
    });
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
    expect(result.current.paymentResult?.success).toBe(false);
  });

  it('opens Razorpay modal when SDK is already available', async () => {
    const mockOpen = vi.fn();
    vi.stubGlobal('Razorpay', function RazorpayCtor(this: { open: typeof mockOpen }) { this.open = mockOpen; });

    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });

    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(result.current.isProcessing).toBe(true);
  });

  it('resets payment result', () => {
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    act(() => result.current.resetPayment());
    expect(result.current.paymentResult).toBeNull();
  });

  it('handles successful payment verification flow', async () => {
    let razorpayHandler: ((response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void) | null = null;
    const mockOpen = vi.fn();
    vi.stubGlobal('Razorpay', function RazorpayCtor(this: { open: typeof mockOpen }, opts: { handler: typeof razorpayHandler }) {
      razorpayHandler = opts.handler;
      this.open = mockOpen;
    });

    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });

    expect(mockOpen).toHaveBeenCalledTimes(1);

    const verifyFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: 'local_123' }),
    });
    global.fetch = verifyFetch;

    await act(async () => {
      await razorpayHandler!({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_razorpay_123',
        razorpay_signature: 'sig_123',
      });
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
    expect(result.current.paymentResult).toEqual({
      success: true,
      orderId: 'local_123',
    });
  });

  it('handles payment verification failure', async () => {
    let razorpayHandler: ((response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void) | null = null;
    const mockOpen = vi.fn();
    vi.stubGlobal('Razorpay', function RazorpayCtor(this: { open: typeof mockOpen }, opts: { handler: typeof razorpayHandler }) {
      razorpayHandler = opts.handler;
      this.open = mockOpen;
    });

    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid signature' }),
    });

    await act(async () => {
      await razorpayHandler!({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_razorpay_123',
        razorpay_signature: 'bad_sig',
      });
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
    expect(result.current.paymentResult?.success).toBe(false);
  });

  it('returns error when SDK never loads and script injection fails', async () => {
    vi.stubGlobal('Razorpay', undefined);
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const el = originalCreateElement(tagName, options);
      if (tagName === 'script') {
        setTimeout(() => {
          el.dispatchEvent(new Event('error'));
        }, 0);
      }
      return el;
    });

    const originalQuerySelector = document.querySelector.bind(document);
    vi.spyOn(document, 'querySelector').mockImplementation((selectors) => {
      if (typeof selectors === 'string' && selectors.includes('checkout.razorpay.com')) {
        return null;
      }
      return originalQuerySelector(selectors);
    });

    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout([mockItem], 80, '+919876543210');
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
    expect(result.current.paymentResult?.success).toBe(false);
    expect(result.current.paymentResult?.error).toContain('could not be loaded');

    createElementSpy.mockRestore();
  });
});
