import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payment/verify/route';
import { NextRequest } from 'next/server';

vi.mock('@/actions/payments/payment', () => ({
  verifyPaymentSignature: vi.fn(),
  confirmPayment: vi.fn(),
}));

const mockRequest = (body: unknown) => {
  return new NextRequest('http://localhost/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

describe('POST /api/payment/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when signature is valid', async () => {
    const { verifyPaymentSignature, confirmPayment } = await import('@/actions/payments/payment');
    vi.mocked(verifyPaymentSignature).mockReturnValue(true);
    vi.mocked(confirmPayment).mockResolvedValue({
      orderId: 'local_1',
    });

    const req = mockRequest({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'valid_sig',
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orderId).toBe('local_1');
    expect(verifyPaymentSignature).toHaveBeenCalledWith('order_123', 'pay_456', 'valid_sig');
    expect(confirmPayment).toHaveBeenCalledWith('order_123', 'pay_456', undefined, undefined);
  });

  it('returns 400 when signature is invalid', async () => {
    const { verifyPaymentSignature } = await import('@/actions/payments/payment');
    vi.mocked(verifyPaymentSignature).mockReturnValue(false);

    const req = mockRequest({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'bad_sig',
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid payment signature' });
  });

  it('returns 500 on server error', async () => {
    const { verifyPaymentSignature } = await import('@/actions/payments/payment');
    vi.mocked(verifyPaymentSignature).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const req = mockRequest({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'sig',
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Payment verification failed' });
  });
});
