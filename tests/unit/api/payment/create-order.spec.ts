import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payment/create-order/route';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers({ 'x-forwarded-for': '127.0.0.1' })),
}))

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/payments/payment', () => ({
  createPaymentOrder: vi.fn(),
}));

const mockRequest = (body: unknown, headers?: Record<string, string>) => {
  return new NextRequest('http://localhost/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
};

function mockSession(userId = 'user1') {
  return {
    user: { id: userId, name: 'Test', email: 'test@test.com', emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null, phoneNumber: null, phoneNumberVerified: false, twoFactorEnabled: false, role: 'customer', banned: false, banReason: null, banExpires: null },
    session: { id: 'sess1', createdAt: new Date(), updatedAt: new Date(), userId, expiresAt: new Date(Date.now() + 86400000), token: 'tok', ipAddress: null, userAgent: null },
  } as const
}

describe('POST /api/payment/create-order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(null as unknown as never);

    const req = mockRequest({ items: [{ id: '1', qty: 1, price: 80 }] });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for empty cart', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);

    const req = mockRequest({ items: [] });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Cart is empty' });
  });

  it('returns 400 when items is missing', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);

    const req = mockRequest({});
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Cart is empty' });
  });

  it('returns 400 for invalid JSON body', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);

    const req = new NextRequest('http://localhost/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid request body' });
  });

  it('returns successful order creation', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);

    const { createPaymentOrder } = await import('@/actions/payments/payment');
    vi.mocked(createPaymentOrder).mockResolvedValue({
      orderId: 'order_123',
      amount: 8000,
      currency: 'INR',
      localOrderId: 'local_1',
      idempotent: false,
    });

    const req = mockRequest({ items: [{ id: '1', qty: 1, price: 80 }], couponCode: 'SAVE10' });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orderId).toBe('order_123');
    expect(body.amount).toBe(8000);
    expect(createPaymentOrder).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user1', couponCode: 'SAVE10' })
    );
  });

  it('returns 500 on server error', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockRejectedValue(new Error('Server error'));

    const req = mockRequest({ items: [{ id: '1', qty: 1, price: 80 }] });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to create payment order' });
  });
});
