import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/kitchens', name: 'Kitchens' },
  { path: '/kitchen', name: 'Kitchen Landing' },
  { path: '/about-us', name: 'About Us' },
  { path: '/contact', name: 'Contact' },
  { path: '/categories', name: 'Categories' },
  { path: '/search', name: 'Search' },
  { path: '/menu', name: 'Menu' },
  { path: '/cart', name: 'Cart' },
];

test.describe('Client-side error probe', () => {
  for (const p of pages) {
    test(`${p.name} (${p.path}) has no uncaught errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
          errors.push(`console: ${msg.text()}`);
        }
      });

      const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Wait for hydration / any immediate client errors
      await page.waitForTimeout(4000);

      const errorText = page.locator('text=Something went wrong');
      const errorCount = await errorText.count();
      if (errorCount > 0) {
        errors.push('ERROR BOUNDARY VISIBLE: Something went wrong');
      }

      expect(errors, `Client errors on ${p.path}`).toEqual([]);
      expect(errorCount).toBe(0);
    });
  }
});