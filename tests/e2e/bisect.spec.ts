import { test, expect } from '@playwright/test';

test.describe('bisect', () => {
  test('goto only', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('URL after goto:', page.url());
    await expect(page).toHaveURL(/\/cart|\/login/, { timeout: 10000 });
  });

  test('goto with addInitScript only', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('rrc-cart', JSON.stringify({ state: { cart: [], appliedCoupon: null, orderType: 'PREBOOK' }, version: 0 }));
    });
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('URL after goto:', page.url());
    await expect(page).toHaveURL(/\/cart|\/login/, { timeout: 10000 });
  });

  test('goto with session mock only', async ({ page }) => {
    await page.route('**/api/auth/get-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1' }, session: { id: 's1' } }) });
    });
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('URL after goto:', page.url());
    await expect(page).toHaveURL(/\/cart|\/login/, { timeout: 10000 });
  });
});
