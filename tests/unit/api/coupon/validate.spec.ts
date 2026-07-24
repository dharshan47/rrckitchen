import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/coupon/validate/route';
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

vi.mock('@/lib/prisma', () => ({
  default: {
    coupon: {
      findUnique: vi.fn(),
    },
    couponRedemption: {
      count: vi.fn(),
    },
  },
}));

const mockRequest = (body: unknown) => {
  return new NextRequest('http://localhost/api/coupon/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

const mockValidCoupon = {
  id: 'c1',
  code: 'SAVE10',
  isActive: true,
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxDiscount: 50,
  minOrderValue: 200,
  validFrom: new Date('2024-01-01'),
  validTo: new Date('2026-12-31'),
  usageLimitTotal: 100,
  usageLimitPerUser: 1,
  description: 'Save 10% up to ₹50',
  createdAt: new Date('2024-01-01'),
  scope: 'PLATFORM',
  kitchenPartnerId: null,
};

describe('POST /api/coupon/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(null as unknown as never);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  function mockSession(userId = 'user1') {
    return {
      user: { id: userId, name: 'Test', email: 'test@test.com', emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null, phoneNumber: null, phoneNumberVerified: false, twoFactorEnabled: false, role: 'customer', banned: false, banReason: null, banExpires: null },
      session: { id: 'sess1', createdAt: new Date(), updatedAt: new Date(), userId, expiresAt: new Date(Date.now() + 86400000), token: 'tok', ipAddress: null, userAgent: null },
    } as const
  }

  it('returns 400 when code is missing', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);

    const req = mockRequest({ cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Coupon code is required' });
  });

  it('returns 404 when coupon not found', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue(null);

    const req = mockRequest({ code: 'INVALID', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Invalid coupon code' });
  });

  it('returns 400 when coupon is inactive', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue({
      ...mockValidCoupon,
      isActive: false,
    } as never);

    const req = mockRequest({ code: 'INACTIVE', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'This coupon is no longer active' });
  });

  it('returns 400 when coupon is expired', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue({
      ...mockValidCoupon,
      validFrom: new Date('2023-01-01'),
      validTo: new Date('2023-12-31'),
    } as never);

    const req = mockRequest({ code: 'EXPIRED', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'This coupon has expired' });
  });

  it('returns 400 when cart total is below minimum', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue(mockValidCoupon as never);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 100 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Minimum order value');
  });

  it('returns 400 when coupon reached usage limit', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue(mockValidCoupon as never);
    vi.mocked(prisma.default.couponRedemption.count).mockResolvedValue(100);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'This coupon has reached its usage limit' });
  });

  it('returns 400 when user already used coupon', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue(mockValidCoupon as never);
    vi.mocked(prisma.default.couponRedemption.count)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(1);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'You have already used this coupon' });
  });

  it('returns discount for valid PERCENTAGE coupon', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue(mockValidCoupon as never);
    vi.mocked(prisma.default.couponRedemption.count).mockResolvedValue(0);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.code).toBe('SAVE10');
    expect(body.discount).toBe(50);
    expect(body.type).toBe('PERCENTAGE');
    expect(body.description).toBe('Save 10% up to ₹50');
  });

  it('returns discount for valid FIXED coupon', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue({
      ...mockValidCoupon,
      code: 'FLAT75',
      discountType: 'FIXED' as const,
      discountValue: 75,
      maxDiscount: null,
    } as never);
    vi.mocked(prisma.default.couponRedemption.count).mockResolvedValue(0);

    const req = mockRequest({ code: 'FLAT75', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.code).toBe('FLAT75');
    expect(body.discount).toBe(75);
    expect(body.type).toBe('FIXED');
  });

  it('caps discount to cart total', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockResolvedValue(mockSession() as never);
    const prisma = await import('@/lib/prisma');
    vi.mocked(prisma.default.coupon.findUnique).mockResolvedValue({
      ...mockValidCoupon,
      code: 'BIG50',
      minOrderValue: null,
      discountValue: 50,
      maxDiscount: null,
    } as never);
    vi.mocked(prisma.default.couponRedemption.count).mockResolvedValue(0);

    const req = mockRequest({ code: 'BIG50', cartTotal: 100 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.discount).toBe(50);
  });

  it('returns 500 on server error', async () => {
    const auth = await import('@/lib/auth');
    vi.mocked(auth.auth.api.getSession).mockRejectedValue(new Error('Server error') as never);

    const req = mockRequest({ code: 'SAVE10', cartTotal: 500 });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to validate coupon' });
  });
});
