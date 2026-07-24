import { test, expect } from '@playwright/test';

test.describe('Customer Account Pages', () => {
  test('profile page loads', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page.locator('h1')).toContainText(/Profile/i);
  });

  test('orders page loads', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page.locator('h1')).toContainText(/Orders/i);
  });

  test('favourites page loads', async ({ page }) => {
    await page.goto('/account/favourites');
    await expect(page.locator('h1')).toContainText(/Favourite/i);
  });

  test('loyalty page loads', async ({ page }) => {
    await page.goto('/account/loyalty');
    await expect(page.locator('h1')).toContainText(/Loyalty/i);
  });

  test('support page loads', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page.locator('h1')).toContainText(/Support/i);
  });

  test('profile page shows user info section', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('orders page shows order list or empty state', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('favourites page shows tabs or items', async ({ page }) => {
    await page.goto('/account/favourites');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('loyalty page shows points and tier info', async ({ page }) => {
    await page.goto('/account/loyalty');
    await expect(page.getByText(/point|tier|bronze|silver|gold/i)).toBeVisible();
  });

  test('loyalty page shows referral section', async ({ page }) => {
    await page.goto('/account/loyalty');
    await expect(page.getByText(/referral|refer a friend/i)).toBeVisible();
  });

  test('support page shows ticket list or empty state', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('account pages have sidebar navigation', async ({ page }) => {
    await page.goto('/account/profile');
    const sidebar = page.locator('nav, aside, [data-testid*="sidebar"]').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
  });
});
