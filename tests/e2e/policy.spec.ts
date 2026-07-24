import { test, expect } from '@playwright/test';

test.describe('Policy Pages', () => {
  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('h1')).toContainText(/Privacy/i);
  });

  test('terms of use page loads', async ({ page }) => {
    await page.goto('/terms-of-use');
    await expect(page.locator('h1')).toContainText(/Terms/i);
  });
});
