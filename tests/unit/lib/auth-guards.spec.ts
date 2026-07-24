import { describe, expect, it, vi, beforeEach } from 'vitest';
import { notFound, redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    adminProfile: {
      findUnique: vi.fn(),
    },
    kitchenPartner: {
      findUnique: vi.fn(),
    },
    deliveryPartner: {
      findUnique: vi.fn(),
    },
    adminAuditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-server', () => ({
  getSession: vi.fn(),
}));

import { requireAdmin, requirePermission, logAdminAction, getPostLoginRedirect } from '@/lib/auth-guards';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.adminProfile.findUnique);
const mockKitchenFindUnique = vi.mocked(prisma.kitchenPartner.findUnique);
const mockDeliveryFindUnique = vi.mocked(prisma.deliveryPartner.findUnique);
const mockAuditCreate = vi.mocked(prisma.adminAuditLog.create);

describe('auth-guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAdmin', () => {
    it('calls notFound when session has no user', async () => {
      mockGetSession.mockResolvedValue({ user: null } as any);
      await requireAdmin();
      expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound when session is null', async () => {
      mockGetSession.mockResolvedValue(null as any);
      await requireAdmin();
      expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound when admin profile does not exist', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'u1' } } as any);
      mockFindUnique.mockResolvedValue(null as any);
      await requireAdmin();
      expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound when admin profile is inactive', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'u1' } } as any);
      mockFindUnique.mockResolvedValue({ userId: 'u1', isActive: false, permissions: [] } as any);
      await requireAdmin();
      expect(notFound).toHaveBeenCalled();
    });

    it('redirects to 2fa-setup when 2FA is not enabled', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'u1', twoFactorEnabled: false } } as any);
      mockFindUnique.mockResolvedValue({ userId: 'u1', isActive: true, permissions: [] } as any);
      await requireAdmin();
      expect(redirect).toHaveBeenCalledWith('/admin/2fa-setup');
    });

    it('returns session and admin profile on success', async () => {
      const session = { user: { id: 'u1', twoFactorEnabled: true } };
      const adminProfile = { userId: 'u1', isActive: true, permissions: [] };
      mockGetSession.mockResolvedValue(session as any);
      mockFindUnique.mockResolvedValue(adminProfile as any);
      const result = await requireAdmin();
      expect(result).toEqual({ session, adminProfile });
    });
  });

  describe('requirePermission', () => {
    it('calls notFound when permission is missing', async () => {
      const session = { user: { id: 'u1', twoFactorEnabled: true } };
      const adminProfile = { userId: 'u1', isActive: true, permissions: ['VIEW_DASHBOARD'] };
      mockGetSession.mockResolvedValue(session as any);
      mockFindUnique.mockResolvedValue(adminProfile as any);
      await requirePermission('MANAGE_ORDERS' as any);
      expect(notFound).toHaveBeenCalled();
    });

    it('returns session and admin profile when permission is present', async () => {
      const session = { user: { id: 'u1', twoFactorEnabled: true } };
      const adminProfile = { userId: 'u1', isActive: true, permissions: ['MANAGE_ORDERS'] };
      mockGetSession.mockResolvedValue(session as any);
      mockFindUnique.mockResolvedValue(adminProfile as any);
      const result = await requirePermission('MANAGE_ORDERS' as any);
      expect(result).toEqual({ session, adminProfile });
    });
  });

  describe('logAdminAction', () => {
    it('creates an audit log entry', async () => {
      mockAuditCreate.mockResolvedValue({} as any);
      const params = { actorUserId: 'u1', action: 'TEST_ACTION' };
      await logAdminAction(params);
      expect(mockAuditCreate).toHaveBeenCalledWith({ data: params });
    });

    it('creates audit log with optional fields', async () => {
      mockAuditCreate.mockResolvedValue({} as any);
      const params = {
        actorUserId: 'u1',
        action: 'DELETE',
        targetType: 'order',
        targetId: 'ord1',
        metadata: { reason: 'test' },
      };
      await logAdminAction(params);
      expect(mockAuditCreate).toHaveBeenCalledWith({ data: params });
    });
  });

  describe('getPostLoginRedirect', () => {
    it('returns /admin for active admin', async () => {
      mockFindUnique.mockResolvedValue({ isActive: true } as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/admin');
    });

    it('returns /kitchen/dashboard for approved kitchen partner', async () => {
      mockFindUnique.mockResolvedValue(null as any);
      mockKitchenFindUnique.mockResolvedValue({ status: 'APPROVED' } as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/kitchen/dashboard');
    });

    it('returns /delivery-partner/dashboard for approved delivery partner', async () => {
      mockFindUnique.mockResolvedValue(null as any);
      mockKitchenFindUnique.mockResolvedValue(null as any);
      mockDeliveryFindUnique.mockResolvedValue({ status: 'APPROVED' } as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/delivery-partner/dashboard');
    });

    it('returns / when no profile matches', async () => {
      mockFindUnique.mockResolvedValue(null as any);
      mockKitchenFindUnique.mockResolvedValue(null as any);
      mockDeliveryFindUnique.mockResolvedValue(null as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/');
    });

    it('returns / for pending kitchen partner', async () => {
      mockFindUnique.mockResolvedValue(null as any);
      mockKitchenFindUnique.mockResolvedValue({ status: 'PENDINGAPPROVAL' } as any);
      mockDeliveryFindUnique.mockResolvedValue(null as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/');
    });

    it('returns / for pending delivery partner', async () => {
      mockFindUnique.mockResolvedValue(null as any);
      mockKitchenFindUnique.mockResolvedValue(null as any);
      mockDeliveryFindUnique.mockResolvedValue({ status: 'PENDINGAPPROVAL' } as any);
      const result = await getPostLoginRedirect('u1');
      expect(result).toBe('/');
    });
  });
});
