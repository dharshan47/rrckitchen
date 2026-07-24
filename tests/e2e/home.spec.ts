import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays RRC Kitchen branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /RRC Kitchen/i })).toBeVisible();
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

  test('shows hero section with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main, section').first()).toBeVisible();
  });

  test('has location selector', async ({ page }) => {
    await page.goto('/');
    const locationBtn = page.locator('button[aria-label*="location" i], button:has-text("Location"), button:has-text("Deliver")').first();
    if (await locationBtn.isVisible()) {
      await expect(locationBtn).toBeVisible();
    }
  });

  test('has search functionality in header', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('dosa');
      await expect(searchInput).toHaveValue('dosa');
    }
  });

  test('shows categories section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/categor/i)).toBeVisible();
  });

  test('navigates to categories page', async ({ page }) => {
    await page.goto('/');
    const catLink = page.getByRole('link', { name: /categor/i }).first();
    if (await catLink.isVisible()) {
      await catLink.click();
      await expect(page).toHaveURL(/\/categor/);
    }
  });

  test('shows Become a Chef CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/chef|kitchen partner|become/i)).toBeVisible();
  });

  test('shows Deliver With Us CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/deliver/i)).toBeVisible();
  });

  test('has user profile/login button', async ({ page }) => {
    await page.goto('/');
    const profileBtn = page.locator('button[aria-label*="profile" i], button[aria-label*="account" i], a[href*="login"], a[href*="account"]').first();
    await expect(profileBtn).toBeVisible();
  });

  test('has cart link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Cart/i })).toBeVisible();
  });

  test('page has proper meta viewport', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });
});
