import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignUp } from '@/hooks/useSignUp';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

vi.mock('@/actions/onboarding/auth', () => ({
  assignUserRole: vi.fn(),
  updateUserName: vi.fn(),
}));

vi.mock('@/actions/referral/referral', () => ({
  processReferralOnSignup: vi.fn(),
}));

vi.mock('@/lib/phone', () => ({
  normalizePhone: vi.fn((v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return '';
  }),
}));

describe('useSignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state for customer role', () => {
    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    expect(result.current.step).toBe('phone');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.resendCooldown).toBe(0);
  });

  it('handles sendOtp and advances to otp step', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: true }),
    });

    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('9876543210');
    });

    await waitFor(() => {
      expect(result.current.step).toBe('otp');
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('shows error for invalid phone number', async () => {
    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('123');
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Enter a valid 10-digit mobile number.');
    });
  });

  it('updates form fields through verifyOtp', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: true }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: true }) });

    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('9876543210');
    });

    await waitFor(() => {
      expect(result.current.step).toBe('otp');
    });

    await act(async () => {
      result.current.verifyOtp('123456');
    });

    await waitFor(() => {
      expect(result.current.step).toBe('name');
    });
  });

  it('shows error for empty otp', async () => {
    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.verifyOtp('');
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Enter the OTP code sent to your phone.');
    });
  });

  it('handles completeSignup error when name is empty', async () => {
    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.completeSignup('', '');
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Please enter your name.');
    });
  });

  it('shows error when sendOtp fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useSignUp('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('9876543210');
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Network error');
    });
  });
});

