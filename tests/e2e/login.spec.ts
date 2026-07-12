import { test, expect } from '@playwright/test';

test.describe('Login Page (Customer)', () => {
  test('loads with RRC Kitchen branding', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /RRC Kitchen/i })).toBeVisible();
  });

  test('shows subtitle text', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Sign in to order/i)).toBeVisible();
  });

  test('shows mobile number input with icon', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible();
  });

  test('shows Continue button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('does not show role-specific labels', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/kitchen|customer/i)).not.toBeVisible();
  });

  test('mobile number input accepts digits', async ({ page }) => {
    await page.goto('/login');
    const input = page.getByLabel(/Mobile number/i);
    await input.fill('9876543210');
    await expect(input).toHaveValue('9876543210');
  });

  test('has signup link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /Create one/i })).toBeVisible();
  });
});

test.describe('Login Kitchen Route', () => {
  test('shows mobile OTP form', async ({ page }) => {
    await page.goto('/kitchen/login');
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('no role-specific labels in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/kitchen|customer/i)).not.toBeVisible();
  });
});


