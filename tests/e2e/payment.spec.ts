import { test, expect } from '@playwright/test';

const mockMenu = [
  {
    id: 'm1',
    name: 'Idli Sambhar',
    price: '80',
    description: 'Soft idlis with sambar',
    foodType: 'VEG',
    timeSlot: 'MORNING',
    menu: { kitchenPartner: { kitchenAlias: { displayName: 'Thanjavur Kitchen' } } },
  },
];

const mockCreateOrderResponse = {
  orderId: 'order_RZP123',
  amount: 8000,
  currency: 'INR',
  localOrderId: 'ord_local_1',
};

const mockVerifyResponse = {
  success: true,
  orderId: 'ord_local_1',
};

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/menu/tomorrow', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMenu) });
    });
    await page.route('**/api/payment/create-order', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCreateOrderResponse) });
    });
    await page.route('**/api/payment/verify', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockVerifyResponse) });
    });
  });

  test('shows empty cart by default', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Menu/i })).toBeVisible();
  });

  test('shows cart with items after adding from menu', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await expect(page.getByText(/Idli Sambhar/)).toBeVisible();
    await expect(page.getByText(/₹80/)).toBeVisible();
  });

  test('shows pay button with correct total', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    const payBtn = page.getByRole('button', { name: /pay/i });
    await expect(payBtn).toBeVisible();
    await expect(page.getByText(/₹80/)).toBeVisible();
  });

  test('pay button is disabled during processing', async ({ page }) => {
    await page.route('**/api/payment/create-order', async (route) => {
      await new Promise(() => {});
    });

    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');

    await page.getByRole('button', { name: /pay/i }).click();
    await expect(page.getByRole('button', { name: /processing/i })).toBeDisabled();
  });

  test('clears cart via clear button', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await page.getByRole('button', { name: /Clear/i }).click();
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
  });

  test('has add more link back to menu', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await expect(page.getByRole('link', { name: /Add More/i })).toBeVisible();
  });

  test('shows secure payment notice', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Add' }).first().click();
    await page.goto('/cart');
    await expect(page.getByText(/secure payment via razorpay/i)).toBeVisible();
  });
});
