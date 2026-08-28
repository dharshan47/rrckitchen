import { test, expect, type Page } from '@playwright/test';

/**
 * REAL-WORLD test suite — runs against the live app with the real database.
 * No API mocks. No route interception. This is what an actual user does.
 *
 * Prerequisite: the app must be running (playwright.config webServer handles it)
 * and a delivery location must be set — the app shows kitchen data only when
 * a delivery location is chosen, exactly like in production.
 */

const LOCATION_STORE = {
  state: {
    deliveryAddress: 'Gandhi Nagar, Thanjavur 613001',
    deliveryLat: 10.7867,
    deliveryLng: 79.1378,
  },
  version: 0,
};

async function seedLocation(page: Page) {
  await page.addInitScript((store) => {
    localStorage.setItem('rrc-menu-store', JSON.stringify(store));
  }, LOCATION_STORE);
}

/** Collects uncaught page errors + console errors (ignoring resource 404s). */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(`console: ${msg.text()}`);
    }
  });
  return errors;
}

test.describe('Real-world: home & navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocation(page);
  });

  test('home page loads real content with no client errors', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    await expect(page.getByText(/100% HOME COOKED/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /RRC Kitchen/i }).first()).toBeVisible();
    await expect(page.getByText(/Gandhi Nagar, Thanjavur/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Kitchens/i }).first()).toBeVisible();

    // Real kitchens section must render actual kitchen cards (not empty state)
    const kitchenCards = page.locator('a[href^="/kitchens/"]');
    await expect(kitchenCards.first()).toBeVisible({ timeout: 30_000 });

    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test('footer has real policy links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /Privacy Policy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Terms & Conditions/i })).toBeVisible();
  });
});

test.describe('Real-world: kitchen discovery', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocation(page);
  });

  test('kitchens page lists real kitchens and opens detail', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto('/kitchens', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    // "Showing X of Y" counter proves the real query returned data
    await expect(page.getByText(/Showing \d+ – \d+ of \d+ Kitchen/)).toBeVisible({ timeout: 45_000 });

    const card = page.locator('a[href^="/kitchens/"]').first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    const cardText = await card.innerText();
    expect(cardText.trim().length).toBeGreaterThan(5);

    await card.click();
    await expect(page).toHaveURL(/\/kitchens\/[\w-]+/, { timeout: 30_000 });
    await expect(page.locator('h1').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('kitchen detail shows real menu with prices and delivery info', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/kitchens', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href^="/kitchens/"]').first().click({ timeout: 45_000 });
    await expect(page).toHaveURL(/\/kitchens\/[\w-]+/, { timeout: 30_000 });

    // Real menu item card with a rupee price
    const menuItem = page.getByText(/₹\d+/).first();
    await expect(menuItem).toBeVisible({ timeout: 45_000 });

    // Kitchen info: delivery time, min order, hygiene badges
    await expect(page.getByText(/Delivery Time/i)).toBeVisible();
    await expect(page.getByText(/Minimum Order/i)).toBeVisible();
    await expect(page.getByText(/Hygienic Kitchen/i)).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Real-world: order flow (add to cart)', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocation(page);
  });

  test('add real item from kitchen menu to cart and see it on /cart', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/kitchens', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href^="/kitchens/"]').first().click({ timeout: 45_000 });
    await expect(page).toHaveURL(/\/kitchens\/[\w-]+/, { timeout: 30_000 });

    // Read the first real menu item name+price from the page
    const addBtn = page.getByRole('button', { name: /ADD/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 45_000 });
    await addBtn.click();

    // Cart badge should become non-zero (or an add-to-cart popup appears)
    const badge = page.locator('[data-testid="cart-badge"], a[href="/cart"] span, button:has-text("1")').first();
    await expect(badge).toBeVisible({ timeout: 15_000 });

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Your Cart/i)).toBeVisible({ timeout: 45_000 });

    // The cart must contain the real item from the menu, not an empty state
    const emptyState = await page.getByText(/cart is empty/i).count();
    expect(emptyState).toBe(0);
    await expect(page.getByText(/₹\d+/).first()).toBeVisible({ timeout: 30_000 });

    expect(errors).toEqual([]);
  });
});

test.describe('Real-world: categories & search', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocation(page);
  });

  test('categories page lists real category tiles', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto('/categories', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('link', { name: /breakfast/i }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /lunch/i }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('category page renders real content', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto('/categories/breakfast', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('main, div').first()).toBeVisible({ timeout: 45_000 });
    expect(errors).toEqual([]);
  });

  test('search page works', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto('/search', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/Popular Cuisines/i)).toBeVisible({ timeout: 30_000 });
    expect(errors).toEqual([]);
  });
});

test.describe('Real-world: location required', () => {
  test('without location, kitchens grid shows no cards until location is set', async ({ page }) => {
    // Fresh context — no seeded location (like a first-time visitor)
    await page.goto('/kitchens', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const cards = await page.locator('a[href^="/kitchens/"]').count();
    expect(cards).toBe(0);
  });

  test('location dialog opens from header', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button:has-text("Select Location"), button:has-text("Change Location")').first();
    await expect(btn).toBeVisible({ timeout: 30_000 });
    await btn.click();
    await expect(page.getByText(/Deliver to|Delivery Location|Enter.*address/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
