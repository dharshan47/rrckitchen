import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';
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

vi.mock('@/actions/onboarding/auth', () => ({
  checkPhoneRegistered: vi.fn(),
}));

vi.mock('@/lib/phone', () => ({
  normalizePhone: vi.fn((v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return '';
  }),
}));

describe('usePhoneAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state for customer role', () => {
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
    expect(result.current.step).toBe('phone');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.resendCooldown).toBe(0);
    expect(result.current.verified).toBe(false);
  });

  it('shows error when sendOtp fails', async () => {
    const { checkPhoneRegistered } = await import('@/actions/onboarding/auth');
    vi.mocked(checkPhoneRegistered).mockResolvedValue(true);
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('9876543210');
    });
    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Network error');
    });
  });

  it('shows error when phone not registered', async () => {
    const { checkPhoneRegistered } = await import('@/actions/onboarding/auth');
    vi.mocked(checkPhoneRegistered).mockResolvedValue(false);
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('9876543210');
    });
    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Phone number not registered. Please sign up.');
    });
  });

  it('shows error for invalid phone number', async () => {
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.sendOtp('123');
    });
    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Enter a valid 10-digit mobile number.');
    });
  });

  it('shows error for empty otp', async () => {
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
    await act(async () => {
      result.current.verifyOtp('');
    });
    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Enter the OTP code sent to your phone.');
    });
  });

  it('calls verifyOtp successfully and sets verified', async () => {
    const { checkPhoneRegistered } = await import('@/actions/onboarding/auth');
    vi.mocked(checkPhoneRegistered).mockResolvedValue(true);
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: true }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: true }) });
    const { result } = renderHook(() => usePhoneAuth('customer'), { wrapper: createWrapper() });
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
      expect(result.current.verified).toBe(true);
      expect(result.current.errorMessage).toBeNull();
    });
  });
});
