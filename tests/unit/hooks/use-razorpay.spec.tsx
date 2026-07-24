import { describe, expect, it, vi, beforeEach } from 'vitest';
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useRazorpay', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.paymentResult).toBeNull();
  });

  it('returns error when key is missing', async () => {
    vi.stubGlobal('Razorpay', vi.fn(() => ({ open: vi.fn() })));
    const originalKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout(
        [{ id: '1', name: 'Idli', price: 80, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'TK' }],
        80,
        '+919876543210'
      );
    });
    expect(result.current.paymentResult).toEqual({
      success: false,
      error: 'Online payment is temporarily unavailable. Please use Cash on Delivery.',
    });
    expect(result.current.isProcessing).toBe(false);
    if (originalKey !== undefined) {
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = originalKey;
    }
  });

  it('sets error when create order mutation fails', async () => {
    vi.stubGlobal('Razorpay', vi.fn(() => ({ open: vi.fn() })));
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_key';
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Cart is empty' }),
    });
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateCheckout(
        [{ id: '1', name: 'Idli', price: 80, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'TK' }],
        80,
        '+919876543210'
      );
    });
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
    expect(result.current.paymentResult?.success).toBe(false);
  });

  it('resets payment result', () => {
    const { result } = renderHook(() => useRazorpay(), { wrapper: createWrapper() });
    act(() => result.current.resetPayment());
    expect(result.current.paymentResult).toBeNull();
  });
});
