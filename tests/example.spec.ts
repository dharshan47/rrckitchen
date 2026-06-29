import { test, expect } from '@playwright/test';

const mockMenu = [
  {
    id: '1',
    name: 'Idli Sambhar',
    price: '80',
    description: 'Soft idlis with sambar',
    foodType: 'VEG',
    timeSlot: 'BREAKFAST',
    menu: {
      kitchenPartner: {
        kitchenAlias: {
          displayName: 'Thanjavur Kitchen',
        },
      },
    },
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    price: '190',
    description: 'Spicy chicken biryani with raita',
    foodType: 'NONVEG',
    timeSlot: 'LUNCH',
    menu: {
      kitchenPartner: {
        kitchenAlias: {
          displayName: 'Home Spice Kitchen',
        },
      },
    },
  },
];

test('home page loads and shows menu link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Menu/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /RrcKitchen/i })).toBeVisible();
});

test('menu page shows controls and cart updates on add', async ({ page }) => {
  await page.route('**/api/menu/tomorrow', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMenu),
    });
  });

  await page.goto('/menu');
  await expect(page.getByRole('heading', { name: /Tomorrow/i })).toBeVisible();
  await expect(page.getByLabel('Search menu')).toBeVisible();
  await expect(page.getByRole('button', { name: /All/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Add/i })).toHaveCount(2);
  await page.getByRole('button', { name: 'Add' }).first().click();
  await expect(page.getByText(/1 item/)).toBeVisible();
});

test('login page renders mobile OTP form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Mobile number')).toBeVisible();
  await expect(page.getByRole('button', { name: /Send OTP/i })).toBeVisible();
});
