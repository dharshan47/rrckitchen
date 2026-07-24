import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/razorpay/webhook/route';
import { NextRequest } from 'next/server';

vi.mock('@/actions/payments/payment', () => ({
  confirmPayment: vi.fn(),
  failPayment: vi.fn(),
}));

vi.mock('@/actions/payments/refund', () => ({
  processWebhookRefund: vi.fn(),
}));

vi.mock('@/actions/payouts/delivery-payout', () => ({
  processWebhookPayout: vi.fn(),
}));

const mockWebhookRequest = (body: unknown, signature: string | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (signature !== null) {
    headers['x-razorpay-signature'] = signature;
  }
  return new NextRequest('http://localhost/api/auth/razorpay/webhook', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

describe('POST /api/auth/razorpay/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_secret';
  });

  it('returns 400 when signature is missing', async () => {
    const req = mockWebhookRequest({ event: 'payment.captured' }, null);
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Signature missing' });
  });

  it('returns 400 when signature is invalid', async () => {
    const req = mockWebhookRequest({ event: 'payment.captured' }, 'invalid_signature');
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid webhook signature' });
  });

  it('handles payment.captured event with valid signature', async () => {
    const { confirmPayment } = await import('@/actions/payments/payment');
    vi.mocked(confirmPayment).mockResolvedValue({ orderId: 'order_123' });

    const crypto = await import('crypto');
    const payload = { event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_123', id: 'pay_456', method: 'upi' } } } };
    const expectedSignature = crypto.createHmac('sha256', 'test_secret').update(JSON.stringify(payload)).digest('hex');

    const req = mockWebhookRequest(payload, expectedSignature);
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
    expect(confirmPayment).toHaveBeenCalledWith('order_123', 'pay_456', 'upi');
  });

  it('handles payment.failed event with valid signature', async () => {
    const { failPayment } = await import('@/actions/payments/payment');
    vi.mocked(failPayment).mockResolvedValue(undefined);

    const crypto = await import('crypto');
    const payload = { event: 'payment.failed', payload: { payment: { entity: { order_id: 'order_fail_123', id: 'pay_fail_456' } } } };
    const expectedSignature = crypto.createHmac('sha256', 'test_secret').update(JSON.stringify(payload)).digest('hex');

    const req = mockWebhookRequest(payload, expectedSignature);
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
    expect(failPayment).toHaveBeenCalledWith('order_fail_123');
  });

  it('handles payment.captured with Payment record not found error', async () => {
    const { confirmPayment } = await import('@/actions/payments/payment');
    const notFoundError = new Error('Payment record not found');
    vi.mocked(confirmPayment).mockRejectedValue(notFoundError);

    const crypto = await import('crypto');
    const payload = { event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_orphan', id: 'pay_orphan', method: 'card' } } } };
    const expectedSignature = crypto.createHmac('sha256', 'test_secret').update(JSON.stringify(payload)).digest('hex');

    const req = mockWebhookRequest(payload, expectedSignature);
    const response = await POST(req);

    expect(response.status).toBe(200);
  });

  it('returns 500 on unexpected error', async () => {
    const req = mockWebhookRequest({}, 'some_sig');
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Webhook processing failed' });
  });
});
