import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { adminStore, useAdminActions } from '@/stores/adminStore';
import type { AdminPermission } from '@/lib/generated/prisma/client';
import type { AdminNavData, AdminDashboardData } from '@/stores/adminStore';

const NAV_DATA: AdminNavData = {
  todayRevenue: 1000,
  yesterdayRevenue: 500,
  trend: 100,
  weeklyTrend: [{ value: 100 }],
  pendingOrders: 3,
  openTickets: 2,
  attentionCount: 5,
};

const DASHBOARD_DATA = {
  stats: { totalRevenue: 5000, todayRevenue: 1000, todayOrders: 2, completedOrders: 10, pendingOrders: 1, cancelledOrders: 0, activeCustomers: 50, kitchenPartners: 5, deliveryPartners: 3, menuItems: 40, pendingKyc: 1, openSupportTickets: 0, lowStockItems: 2 },
  revenueTrend: [{ period: 'Jan', revenue: 1000, orders: 5 }],
  ordersByTimeSlot: [{ slot: 'Lunch', orders: 3 }],
  vegNonVeg: [{ type: 'Veg', count: 20, fill: '#10b981' }],
  orderStatusDist: [{ status: 'Confirmed', count: 5, fill: '#f59e0b' }],
  topSelling: [{ item: 'Biryani', orders: 4 }],
  topKitchens: [{ name: 'A Kitchen', orders: 10, revenue: 2000, rating: 4.5 }],
  deliveryPerformance: [{ name: 'Rider', deliveries: 6, rating: 5 }],
  recentOrders: [{ id: 'o1', customer: 'John', kitchen: 'A Kitchen', date: '01 Aug 2026', amount: 200, status: 'Confirmed', payment: 'Paid' }],
  kitchenPartners: [{ name: 'A Kitchen', status: 'Active', orders: 10, revenue: 2000 }],
  deliveryPartners: [{ name: 'Rider', orders: 6, status: 'Active', docs: 'Verified' }],
} as unknown as AdminDashboardData;

describe('adminStore', () => {
  beforeEach(() => {
    adminStore.setState({ permissions: [], navData: null, dashboardData: null });
  });

  it('initializes with default values', () => {
    const state = adminStore.getState();
    expect(state.permissions).toEqual([]);
    expect(state.navData).toBeNull();
    expect(state.dashboardData).toBeNull();
    expect(state.date).toBeDefined();
  });

  it('sets permissions', () => {
    adminStore.getState().setPermissions(['MANAGE_CATALOG' as AdminPermission]);
    expect(adminStore.getState().permissions).toEqual(['MANAGE_CATALOG']);
  });

  it('sets nav data', () => {
    adminStore.getState().setNavData(NAV_DATA);
    expect(adminStore.getState().navData).toEqual(NAV_DATA);
  });

  it('sets dashboard data', () => {
    adminStore.getState().setDashboardData(DASHBOARD_DATA);
    expect(adminStore.getState().dashboardData).toEqual(DASHBOARD_DATA);
  });

  it('sets date', () => {
    const range = { from: new Date('2026-08-01'), to: new Date('2026-08-04') };
    adminStore.getState().setDate(range);
    expect(adminStore.getState().date).toEqual(range);
  });

  it('resets admin state', () => {
    adminStore.getState().setPermissions(['MANAGE_ADMINS' as AdminPermission]);
    adminStore.getState().setNavData(NAV_DATA);
    adminStore.getState().setDashboardData(DASHBOARD_DATA);
    adminStore.getState().setDate({ from: new Date(), to: new Date() });
    adminStore.getState().resetAdminState();
    const state = adminStore.getState();
    expect(state.permissions).toEqual([]);
    expect(state.navData).toBeNull();
    expect(state.dashboardData).toBeNull();
    expect(state.date).toBeDefined();
  });

  it('selectors return correct values', () => {
    adminStore.getState().setPermissions(['MANAGE_CMS' as AdminPermission]);
    adminStore.getState().setNavData(NAV_DATA);
    adminStore.getState().setDashboardData(DASHBOARD_DATA);
    expect(adminStore.getState().permissions).toEqual(['MANAGE_CMS']);
    expect(adminStore.getState().navData?.todayRevenue).toBe(1000);
    expect(adminStore.getState().dashboardData?.stats?.totalRevenue).toBe(5000);
  });

  it('useAdminActions returns all actions', () => {
    const { result } = renderHook(() => useAdminActions());
    expect(result.current).toHaveProperty('setPermissions');
    expect(result.current).toHaveProperty('setNavData');
    expect(result.current).toHaveProperty('setDashboardData');
    expect(result.current).toHaveProperty('setDate');
    expect(result.current).toHaveProperty('resetAdminState');
  });
});
