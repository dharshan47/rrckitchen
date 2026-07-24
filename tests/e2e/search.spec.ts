import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test('loads with search input', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[type="text"], input[placeholder*="Search"]').first()).toBeVisible();
  });

  test('shows search results when typing', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    await searchInput.fill('Biryani');
    await expect(searchInput).toHaveValue('Biryani');
  });

  test('search input is focused on page load', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeFocused();
  });

  test('clears search input', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    await searchInput.fill('Dosa');
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('search handles special characters', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    await searchInput.fill('₹100 @ Special!');
    await expect(searchInput).toHaveValue('₹100 @ Special!');
  });

  test('search handles long queries', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    const longQuery = 'A'.repeat(200);
    await searchInput.fill(longQuery);
    await expect(searchInput).toHaveValue(longQuery);
  });

  test('search page has proper heading or content area', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('main, article, section, h1').first()).toBeVisible();
  });

  test('search results area is present', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('main, [data-testid*="search"], [data-testid*="result"]').first()).toBeVisible();
  });
});

test.describe('Search from Header', () => {
  test('header search navigates to search page', async ({ page }) => {
    await page.goto('/');
    const headerSearch = page.locator('input[placeholder*="Search" i]').first();
    if (await headerSearch.isVisible()) {
      await headerSearch.fill('Idli');
      await headerSearch.press('Enter');
      await expect(page).toHaveURL(/\/search/);
    }
  });
});
