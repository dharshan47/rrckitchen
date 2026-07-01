import { test, expect } from '@playwright/test';

test.describe('Login Page (Customer)', () => {
  test('loads with RrcKitchen branding', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /RrcKitchen/i })).toBeVisible();
  });

  test('shows subtitle text', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Sign in to order meals/i)).toBeVisible();
  });

  test('shows mobile number input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible();
  });

  test('shows Continue / Send OTP button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Send OTP/i })).toBeVisible();
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
});

test.describe('Login Kitchen Route', () => {
  test('shows mobile OTP form', async ({ page }) => {
    await page.goto('/login/kitchen');
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send OTP/i })).toBeVisible();
  });

  test('no role-specific labels in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/kitchen|customer/i)).not.toBeVisible();
  });
});

test.describe('Admin Login Route', () => {
  test('loads with admin branding', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /Admin Login/i })).toBeVisible();
  });

  test('shows subtitle text', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText(/Sign in with your admin credentials/i)).toBeVisible();
  });

  test('shows email input', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('shows password input', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('shows sign in button', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('email input accepts text', async ({ page }) => {
    await page.goto('/admin/login');
    const input = page.getByLabel(/Email/i);
    await input.fill('admin@rrckitchen.com');
    await expect(input).toHaveValue('admin@rrckitchen.com');
  });

  test('password input accepts text', async ({ page }) => {
    await page.goto('/admin/login');
    const input = page.getByLabel(/Password/i);
    await input.fill('secret123');
    await expect(input).toHaveValue('secret123');
  });
});
