import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockSendNotification = vi.fn();
const mockSetVapidDetails = vi.fn();

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    deliveryPartnerKitchenAssignment: { findMany: vi.fn() },
    deliveryPartner: { findMany: vi.fn() },
    pushSubscription: { findMany: vi.fn(), delete: vi.fn() },
    notificationLog: { create: vi.fn() },
  },
}));

import { getVapidPublicKey, sendPushNotification, sendPushToDeliveryPartners } from '@/lib/notification';
import prisma from '@/lib/prisma';

const mockAssignments = vi.mocked(prisma.deliveryPartnerKitchenAssignment.findMany);
const mockDeliveryPartners = vi.mocked(prisma.deliveryPartner.findMany);
const mockPushSubscriptions = vi.mocked(prisma.pushSubscription.findMany);
const mockPushDelete = vi.mocked(prisma.pushSubscription.delete);
const mockNotifLog = vi.mocked(prisma.notificationLog.create);

describe('notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
    process.env.VAPID_CONTACT = 'mailto:test@example.com';
  });

  describe('getVapidPublicKey', () => {
    it('returns the VAPID public key', () => {
      expect(getVapidPublicKey()).toBe('test-public-key');
    });

    it('returns empty string when env var is not set', () => {
      delete process.env.VAPID_PUBLIC_KEY;
      expect(getVapidPublicKey()).toBe('');
    });
  });

  describe('sendPushNotification', () => {
    it('sends a push notification', async () => {
      mockSendNotification.mockResolvedValue(undefined);
      const sub = { endpoint: 'https://example.com', keys: { p256dh: 'key', auth: 'auth' } };
      await sendPushNotification(sub, 'test-payload');
      expect(mockSendNotification).toHaveBeenCalledWith(sub, 'test-payload');
    });

    it('does not throw when sendNotification fails', async () => {
      mockSendNotification.mockRejectedValue(new Error('push failed'));
      const sub = { endpoint: 'https://example.com', keys: { p256dh: 'key', auth: 'auth' } };
      await expect(sendPushNotification(sub, 'payload')).resolves.toBeUndefined();
    });

    it('does nothing when webpush is not initialized', async () => {
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
      const sub = { endpoint: 'https://example.com', keys: { p256dh: 'key', auth: 'auth' } };
      await sendPushNotification(sub, 'payload');
      expect(mockSendNotification).not.toHaveBeenCalled();
    });
  });

  describe('sendPushToDeliveryPartners', () => {
    it('does nothing when no subscriptions exist', async () => {
      mockSendNotification.mockResolvedValue(undefined);
      mockAssignments.mockResolvedValue([{ deliveryPartnerId: 'dp1' }] as any);
      mockDeliveryPartners.mockResolvedValue([{ userId: 'u1' }] as any);
      mockPushSubscriptions.mockResolvedValue([] as any);

      await sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url');
      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    it('does nothing when no assignments exist', async () => {
      mockAssignments.mockResolvedValue([] as any);
      await sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url');
      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    it('sends notifications to each subscription', async () => {
      mockSendNotification.mockResolvedValue(undefined);
      mockAssignments.mockResolvedValue([{ deliveryPartnerId: 'dp1' }] as any);
      mockDeliveryPartners.mockResolvedValue([{ userId: 'u1' }] as any);
      mockPushSubscriptions.mockResolvedValue([
        { id: 'sub1', userId: 'u1', endpoint: 'https://example.com', p256dh: 'key', auth: 'auth' },
      ] as any);
      mockNotifLog.mockResolvedValue({} as any);

      await sendPushToDeliveryPartners('kp1', 'Order Ready', 'Your food is ready', '/order/1');
      expect(mockSendNotification).toHaveBeenCalledWith(
        { endpoint: 'https://example.com', keys: { p256dh: 'key', auth: 'auth' } },
        JSON.stringify({ title: 'Order Ready', body: 'Your food is ready', url: '/order/1' })
      );
    });

    it('logs SENT notification on success', async () => {
      mockSendNotification.mockResolvedValue(undefined);
      mockAssignments.mockResolvedValue([{ deliveryPartnerId: 'dp1' }] as any);
      mockDeliveryPartners.mockResolvedValue([{ userId: 'u1' }] as any);
      mockPushSubscriptions.mockResolvedValue([
        { id: 'sub1', userId: 'u1', endpoint: 'https://example.com', p256dh: 'key', auth: 'auth' },
      ] as any);
      mockNotifLog.mockResolvedValue({} as any);

      await sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url');
      expect(mockNotifLog).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          channel: 'PUSH',
          templateKey: 'ORDER_READY',
          title: 'Title',
          body: 'Body',
          status: 'SENT',
        },
      });
    });

    it('logs FAILED notification and deletes subscription on error', async () => {
      mockSendNotification.mockRejectedValue(new Error('push error'));
      mockAssignments.mockResolvedValue([{ deliveryPartnerId: 'dp1' }] as any);
      mockDeliveryPartners.mockResolvedValue([{ userId: 'u1' }] as any);
      mockPushSubscriptions.mockResolvedValue([
        { id: 'sub1', userId: 'u1', endpoint: 'https://example.com', p256dh: 'key', auth: 'auth' },
      ] as any);
      mockNotifLog.mockResolvedValue({} as any);
      mockPushDelete.mockResolvedValue({} as any);

      await sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url');
      expect(mockNotifLog).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          channel: 'PUSH',
          templateKey: 'ORDER_READY',
          title: 'Title',
          body: 'Body',
          status: 'FAILED',
        },
      });
      expect(mockPushDelete).toHaveBeenCalledWith({ where: { id: 'sub1' } });
    });

    it('silently ignores notificationLog errors', async () => {
      mockSendNotification.mockResolvedValue(undefined);
      mockAssignments.mockResolvedValue([{ deliveryPartnerId: 'dp1' }] as any);
      mockDeliveryPartners.mockResolvedValue([{ userId: 'u1' }] as any);
      mockPushSubscriptions.mockResolvedValue([
        { id: 'sub1', userId: 'u1', endpoint: 'https://example.com', p256dh: 'key', auth: 'auth' },
      ] as any);
      mockNotifLog.mockRejectedValue(new Error('db error'));

      await expect(
        sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url')
      ).resolves.toBeUndefined();
    });

    it('does nothing when webpush keys are missing', async () => {
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
      await sendPushToDeliveryPartners('kp1', 'Title', 'Body', '/url');
      expect(mockAssignments).not.toHaveBeenCalled();
    });
  });
});
