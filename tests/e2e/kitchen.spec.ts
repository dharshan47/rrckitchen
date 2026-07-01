import { test, expect } from '@playwright/test';

test.describe('Kitchen Landing Page', () => {
  test('loads and shows Kitchen Hub branding', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByText(/Kitchen Hub/i)).toBeVisible();
  });

  test('displays hero heading', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByRole('heading', { name: /Turn Your Home Kitchen/i })).toBeVisible();
  });

  test('shows Register Your Kitchen CTA button', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByRole('link', { name: /Register Your Kitchen/i })).toBeVisible();
  });

  test('shows How It Works link', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByRole('link', { name: /How It Works/i })).toBeVisible();
  });

  test('displays 6 benefit cards', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByText(/Extra Income/)).toBeVisible();
    await expect(page.getByText(/Flexible Schedule/)).toBeVisible();
    await expect(page.getByText(/Grow Your Reach/)).toBeVisible();
    await expect(page.getByText(/Community/)).toBeVisible();
    await expect(page.getByText(/Verified Platform/)).toBeVisible();
    await expect(page.getByText(/No Investment Needed/)).toBeVisible();
  });

  test('displays How It Works steps', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByText(/Register/)).toBeVisible();
    await expect(page.getByText(/Set Your Menu/)).toBeVisible();
    await expect(page.getByText(/Mark Availability/)).toBeVisible();
    await expect(page.getByText(/Receive Orders/)).toBeVisible();
    await expect(page.getByText(/Cook & Deliver/)).toBeVisible();
    await expect(page.getByText(/Get Paid/)).toBeVisible();
  });

  test('FAQ section is present', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.getByText(/Frequently Asked/i)).toBeVisible();
  });

  test('footer shows RrcKitchen link to home', async ({ page }) => {
    await page.goto('/kitchen');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /RrcKitchen/i })).toBeVisible();
  });

  test('Register button links to login/kitchen', async ({ page }) => {
    await page.goto('/kitchen');
    await page.getByRole('link', { name: /Register Your Kitchen/i }).click();
    await expect(page).toHaveURL(/\/login\/kitchen/);
  });

  test('CTA section has registration button', async ({ page }) => {
    await page.goto('/kitchen');
    const ctaSection = page.locator('section').filter({ hasText: /Ready to Get Started/i });
    await expect(ctaSection.getByRole('link', { name: /Register/i })).toBeVisible();
  });

  test('navbar is distinct from main site', async ({ page }) => {
    await page.goto('/kitchen');
    const nav = page.locator('nav');
    await expect(nav.getByText(/Kitchen Hub/i)).toBeVisible();
  });
});
