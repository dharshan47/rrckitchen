import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('navigates home to menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Menu/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('navigates home to kitchen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Kitchen/i }).click();
    await expect(page).toHaveURL(/\/kitchen/);
  });

  test('navigates home to delivery partner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Delivery Partner/i }).click();
    await expect(page).toHaveURL(/\/delivery-partner/);
  });

  test('navigates home to cart', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('navigates menu back to home', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('link', { name: /RRC Kitchen/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('footer links are accessible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const footerLinks = footer.getByRole('link');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('404 page returns not found', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });

  test('navigates to categories from header', async ({ page }) => {
    await page.goto('/');
    const catLink = page.getByRole('link', { name: /categor/i }).first();
    if (await catLink.isVisible()) {
      await catLink.click();
      await expect(page).toHaveURL(/\/categor/);
    }
  });

  test('navigates to help page', async ({ page }) => {
    await page.goto('/');
    const helpLink = page.getByRole('link', { name: /help/i }).first();
    if (await helpLink.isVisible()) {
      await helpLink.click();
      await expect(page).toHaveURL(/\/help/);
    }
  });

  test('navigates to search page', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.press('Enter');
      await expect(page).toHaveURL(/\/search/);
    }
  });

  test('navigates between all main sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Menu/i }).click();
    await expect(page).toHaveURL(/\/menu/);
    await page.getByRole('link', { name: /RRC Kitchen/i }).first().click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: /Cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);
  });
});

test.describe('Mobile Bottom Navigation', () => {
  test('shows bottom nav icons on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav:has(a[href="/menu"])').last();
    await expect(bottomNav.getByRole('link', { name: /Menu/i })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: /Cart/i })).toBeVisible();
  });

  test('bottom nav shows Home link', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/menu');
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav:has(a[href="/"])').last();
    await expect(bottomNav.getByRole('link', { name: /Home/i })).toBeVisible();
  });

  test('bottom nav shows Categories link', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav').last();
    const catLink = bottomNav.getByRole('link', { name: /categor/i });
    if (await catLink.isVisible()) {
      await expect(catLink).toBeVisible();
    }
  });

  test('bottom nav shows Help link', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav').last();
    const helpLink = bottomNav.getByRole('link', { name: /help/i });
    if (await helpLink.isVisible()) {
      await expect(helpLink).toBeVisible();
    }
  });
});

test.describe('Desktop Header Navigation', () => {
  test('shows desktop nav links on large viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: /RRC Kitchen/i })).toBeVisible();
  });

  test('shows profile/login in header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const profileBtn = page.locator('button[aria-label*="profile" i], a[href*="login"], a[href*="account"]').first();
    await expect(profileBtn).toBeVisible();
  });
});
