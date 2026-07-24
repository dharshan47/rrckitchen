import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('dashboard page loads with stats', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('navigates to admin orders page', async ({ page }) => {
    await page.goto('/admin');
    const ordersLink = page.locator('a[href*="/admin/orders"]').first();
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/\/admin\/orders/);
    }
  });

  test('navigates to admin kitchens page', async ({ page }) => {
    await page.goto('/admin');
    const kitchensLink = page.locator('a[href*="/admin/kitchens"]').first();
    if (await kitchensLink.isVisible()) {
      await kitchensLink.click();
      await expect(page).toHaveURL(/\/admin\/kitchens/);
    }
  });

  test('navigates to admin customers page', async ({ page }) => {
    await page.goto('/admin');
    const customersLink = page.locator('a[href*="/admin/customers"]').first();
    if (await customersLink.isVisible()) {
      await customersLink.click();
      await expect(page).toHaveURL(/\/admin\/customers/);
    }
  });

  test('navigates to admin payments page', async ({ page }) => {
    await page.goto('/admin');
    const paymentsLink = page.locator('a[href*="/admin/payments"]').first();
    if (await paymentsLink.isVisible()) {
      await paymentsLink.click();
      await expect(page).toHaveURL(/\/admin\/payments/);
    }
  });

  test('admin menu page loads', async ({ page }) => {
    await page.goto('/admin/menu');
    await expect(page.locator('h1')).toContainText(/Menu/i);
  });

  test('admin delivery page loads', async ({ page }) => {
    await page.goto('/admin/delivery');
    await expect(page.locator('h1')).toContainText(/Delivery/i);
  });

  test('admin support page loads', async ({ page }) => {
    await page.goto('/admin/support');
    await expect(page.locator('h1')).toContainText(/Support/i);
  });
});
