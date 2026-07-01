import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('navigates home to menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Menu/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('navigates home to kitchen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Kitchen/i }).click();
    await expect(page).toHaveURL(/\/kitchen/);
  });

  test('navigates home to delivery partner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Delivery Partner/i }).click();
    await expect(page).toHaveURL(/\/delivery-partner/);
  });

  test('navigates home to cart', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('navigates menu back to home', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('link', { name: /RrcKitchen/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('footer links are accessible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const footerLinks = footer.getByRole('link');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('404 page returns not found', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Mobile Bottom Navigation', () => {
  test('shows bottom nav icons on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav:has(a[href="/menu"])').last();
    await expect(bottomNav.getByRole('link', { name: /Menu/i })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: /Cart/i })).toBeVisible();
  });
});
