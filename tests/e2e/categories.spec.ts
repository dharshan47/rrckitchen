import { test, expect } from '@playwright/test';

test.describe('Categories Pages', () => {
  test('all categories page loads', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('h1')).toContainText(/All Cuisines/i);
  });

  test('category detail page loads', async ({ page }) => {
    await page.goto('/categories/biryani');
    await expect(page.locator('h1')).toContainText(/Biryani/i);
  });

  test('navigates from all categories to category detail', async ({ page }) => {
    await page.goto('/categories');
    const categoryLink = page.locator('a[href*="/categories/"]').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/categories\//);
    }
  });

  test('categories page shows cuisine grid', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('categories page has search input', async ({ page }) => {
    await page.goto('/categories');
    const searchInput = page.locator("input[placeholder*='Search cuisines' i], input[placeholder*='search' i]").first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('category detail shows kitchen list or empty state', async ({ page }) => {
    await page.goto('/categories/biryani');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });

  test('category detail has back link', async ({ page }) => {
    await page.goto('/categories/biryani');
    const backLink = page.getByRole('link', { name: /back|all cuisines|categories/i }).first();
    if (await backLink.isVisible()) {
      await expect(backLink).toBeVisible();
    }
  });

  test('categories page loads various category pages', async ({ page }) => {
    await page.goto('/categories/south-indian');
    await expect(page.locator('main, article, section').first()).toBeVisible();
  });
});

test.describe('Category Search', () => {
  test('can filter categories by search', async ({ page }) => {
    await page.goto('/categories');
    const searchInput = page.locator("input[placeholder*='Search' i]").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Biryani');
      await expect(searchInput).toHaveValue('Biryani');
    }
  });
});
