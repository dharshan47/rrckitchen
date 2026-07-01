import { test, expect } from '@playwright/test';

const mockMenu = [
  {
    id: '1',
    name: 'Idli Sambhar',
    price: '80',
    description: 'Soft idlis with sambar',
    foodType: 'VEG',
    timeSlot: 'MORNING',
    menu: { kitchenPartner: { kitchenAlias: { displayName: 'Thanjavur Kitchen' } } },
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    price: '190',
    description: 'Spicy chicken biryani',
    foodType: 'NONVEG',
    timeSlot: 'LUNCH',
    menu: { kitchenPartner: { kitchenAlias: { displayName: 'Home Spice Kitchen' } } },
  },
];

test.describe('Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/menu/tomorrow', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMenu) });
    });
  });

  test('shows empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Menu/i })).toBeVisible();
  });

  test('shows cart with items after adding from menu', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.getByRole('button', { name: 'Add' }).nth(1).click();
    await page.goto('/cart');
    await expect(page.getByText(/Idli Sambhar/)).toBeVisible();
    await expect(page.getByText(/Chicken Biryani/)).toBeVisible();
  });

  test('displays cart total correctly', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.getByRole('button', { name: 'Add' }).nth(1).click();
    await page.goto('/cart');
    await expect(page.getByText(/₹270/)).toBeVisible();
  });

  test('increases item quantity', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await page.locator('button[aria-label*="plus" i], button:has(svg.lucide-plus)').first().click();
    await expect(page.getByText(/₹160/)).toBeVisible();
  });

  test('removes item from cart', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.getByRole('button', { name: 'Add' }).nth(1).click();
    await page.goto('/cart');
    await page.locator('button:has(svg.lucide-trash2)').first().click();
    await expect(page.getByText(/item/)).toBeVisible();
  });

  test('has checkout button with total', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await expect(page.getByRole('button', { name: /Pay/i })).toBeVisible();
    await expect(page.getByText(/₹80/)).toBeVisible();
  });

  test('clear all button empties cart', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await page.getByRole('button', { name: /Clear/i }).click();
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
  });
});
