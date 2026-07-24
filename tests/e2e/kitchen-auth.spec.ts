import { test, expect } from '@playwright/test';

test.describe('Kitchen Partner Auth', () => {
  test('kitchen login page loads', async ({ page }) => {
    await page.goto('/kitchen/login');
    await expect(page.locator('h1')).toContainText(/Login/i);
  });

  test('kitchen signup page loads', async ({ page }) => {
    await page.goto('/kitchen/signup');
    await expect(page.locator('h1')).toContainText(/Sign Up/i);
  });

  test('kitchen partner landing page loads', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.locator('h1')).toContainText(/Kitchen Hub/i);
  });
});
