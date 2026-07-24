import { test, expect } from '@playwright/test';

test.describe('Delivery Partner Auth', () => {
  test('delivery partner login page loads', async ({ page }) => {
    await page.goto('/delivery-partner/login');
    await expect(page.locator('h1')).toContainText(/Login/i);
  });

  test('delivery partner signup page loads', async ({ page }) => {
    await page.goto('/delivery-partner/signup');
    await expect(page.locator('h1')).toContainText(/Sign Up/i);
  });
});
