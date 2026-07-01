import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays RrcKitchen branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /RrcKitchen/i })).toBeVisible();
  });

  test('shows four meal time cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('a[href*="timeSlot"]');
    await expect(cards).toHaveCount(4);
  });

  test('shows menu navigation link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Menu/i })).toBeVisible();
  });

  test('navigates to menu page on click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Menu/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('toggles night mode', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label*="night" i], button[aria-label*="dark" i], button[aria-label*="theme" i]');
    if (await toggle.count() > 0) {
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute('class', /dark/);
    }
  });

  test('has footer with links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link').first()).toBeVisible();
  });
});
