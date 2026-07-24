import { test, expect } from '@playwright/test';

test.describe('Support Pages', () => {
  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText(/Contact/i);
  });

  test('help page loads', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('h1')).toContainText(/Help/i);
  });

  test('support page has contact form', async ({ page }) => {
    await page.goto('/support');
    await expect(page.locator('form, input, textarea, button[type="submit"]').first()).toBeVisible();
  });
});
