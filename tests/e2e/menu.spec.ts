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
  {
    id: '3',
    name: 'Masala Dosa',
    price: '70',
    description: 'Crispy masala dosa',
    foodType: 'VEG',
    timeSlot: 'MORNING',
    menu: { kitchenPartner: { kitchenAlias: { displayName: 'Thanjavur Kitchen' } } },
  },
];

test.describe('Menu Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/menu/tomorrow', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMenu) });
    });
  });

  test('renders menu page with heading', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('heading', { name: /Tomorrow/i })).toBeVisible();
  });

  test('displays search input', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('shows food type filter buttons', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Veg/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Non.?Veg/i })).toBeVisible();
  });

  test('displays time slot filter buttons', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('button', { name: /Morning/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lunch/i })).toBeVisible();
  });

  test('shows menu items with Add buttons', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('button', { name: /Add/i })).toHaveCount(3);
  });

  test('filters items by Veg selection', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: /Veg/i }).click();
    const cards = page.locator('[data-testid="menu-item"]');
    await expect(cards).toHaveCount(2);
  });

  test('filters items by search query', async ({ page }) => {
    await page.goto('/menu');
    await page.getByPlaceholder(/search/i).fill('Biryani');
    const cards = page.locator('[data-testid="menu-item"]');
    await expect(cards).toHaveCount(1);
  });

  test('adds item to cart', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await expect(page.getByText(/1 item/i)).toBeVisible();
  });

  test('adds multiple items and updates cart count', async ({ page }) => {
    await page.goto('/menu');
    const addButtons = page.getByRole('button', { name: 'Add' });
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await expect(page.getByText(/2 items/i)).toBeVisible();
  });

  test('displays item names and prices', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByText(/Idli Sambhar/)).toBeVisible();
    await expect(page.getByText(/₹80/)).toBeVisible();
    await expect(page.getByText(/Chicken Biryani/)).toBeVisible();
    await expect(page.getByText(/₹190/)).toBeVisible();
  });
});
