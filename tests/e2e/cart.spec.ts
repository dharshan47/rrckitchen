import { test, expect, type Page } from '@playwright/test';

const MOCK_SESSION = {
  user: {
    id: 'user-e2e-1',
    name: 'Test User',
    email: 'test@rrckitchen.in',
    phoneNumber: '+919876543210',
  },
  session: {
    id: 'session-e2e-1',
    userId: 'user-e2e-1',
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  },
};

const CART_ITEM = {
  id: 'mi-e2e-1',
  name: 'Idli Sambhar',
  price: 80,
  qty: 1,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

const CREATE_ORDER_RESPONSE = {
  orderId: 'order_RZP123',
  amount: 8000,
  currency: 'INR',
  localOrderId: 'ord_local_1',
};

/**
 * Single unified route handler registered on '**' so there are no
 * Playwright priority conflicts between multiple page.route() calls.
 *
 * All matching is done inside the handler:
 *  - Auth session              → MOCK_SESSION
 *  - Payment APIs              → stubs
 *  - Next.js server actions    → empty flight stub (POST + next-action header)
 *  - Everything else           → real network
 */
async function setupRoutes(page: Page, opts: { verifyStatus?: number } = {}) {
  const verifyStatus = opts.verifyStatus ?? 200;

  await page.route('**', async (route) => {
    const req  = route.request();
    const url  = req.url();
    const meth = req.method();
    const hdrs = req.headers();

    // ── Auth session ──────────────────────────────────────────────────────
    if (url.includes('/api/auth/get-session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
      return;
    }

    // ── Payment config ────────────────────────────────────────────────────
    if (url.includes('/api/payment/config')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true, keyId: 'rzp_test_e2e' }),
      });
      return;
    }

    // ── Create order ──────────────────────────────────────────────────────
    if (url.includes('/api/payment/create-order')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CREATE_ORDER_RESPONSE),
      });
      return;
    }

    // ── Verify payment ────────────────────────────────────────────────────
    if (url.includes('/api/payment/verify')) {
      await route.fulfill(
        verifyStatus !== 200
          ? {
              status: verifyStatus,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Payment verification failed' }),
            }
          : {
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ orderId: 'ord_local_1' }),
            }
      );
      return;
    }

    // ── Coupon offers ─────────────────────────────────────────────────────
    if (url.includes('/api/coupon/offers')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ coupons: [] }),
      });
      return;
    }

    // ── Next.js server actions (getUserAddresses, getCartConfig, etc.) ────
    // Server actions POST to the current page URL with a "next-action" header.
    // Return a minimal RSC flight payload representing null so TanStack Query
    // resolves immediately (isLoading → false) without a DB connection.
    if (meth === 'POST' && (hdrs['next-action'] || hdrs['Next-Action'])) {
      await route.fulfill({
        status: 200,
        contentType: 'text/x-component',
        body: '0:null\n',
      });
      return;
    }

    // ── Everything else → real network ────────────────────────────────────
    await route.continue();
  });
}

/**
 * Monkey-patches window.fetch before React boots so that Better Auth's
 * useSession() resolves instantly with a mocked user — belt-and-suspenders
 * alongside the CDP-level page.route() above.
 */
async function injectFetchMock(page: Page, opts: { verifyStatus?: number } = {}) {
  const verifyStatus = opts.verifyStatus ?? 200;

  await page.addInitScript(
    ({ sessionPayload, createOrderResp, verifyStatusCode }) => {
      const origFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
            ? input.href
            : (input as Request).url;

        if (url.includes('/api/auth/get-session')) {
          return new Response(JSON.stringify(sessionPayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (url.includes('/api/payment/config')) {
          return new Response(
            JSON.stringify({ available: true, keyId: 'rzp_test_e2e' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (url.includes('/api/payment/create-order')) {
          return new Response(JSON.stringify(createOrderResp), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (url.includes('/api/payment/verify')) {
          return verifyStatusCode !== 200
            ? new Response(
                JSON.stringify({ error: 'Payment verification failed' }),
                { status: verifyStatusCode, headers: { 'Content-Type': 'application/json' } }
              )
            : new Response(JSON.stringify({ orderId: 'ord_local_1' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
        }
        if (url.includes('/api/coupon/offers')) {
          return new Response(JSON.stringify({ coupons: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return origFetch(input, init);
      };
    },
    {
      sessionPayload: MOCK_SESSION,
      createOrderResp: CREATE_ORDER_RESPONSE,
      verifyStatusCode: verifyStatus,
    }
  );
}

/** Seeds the cart and delivery address into zustand's persisted localStorage. */
async function seedOneItemCart(page: Page) {
  await page.addInitScript(({ cartItem }) => {
    localStorage.setItem(
      'rrc-cart',
      JSON.stringify({
        state: { cart: [cartItem], appliedCoupon: null, orderType: 'PREBOOK' },
        version: 0,
      })
    );
    localStorage.setItem(
      'rrc-menu-store',
      JSON.stringify({
        state: {
          deliveryAddress: 'Test Address, Thanjavur 613001',
          deliveryLat: 10.7867,
          deliveryLng: 79.1378,
        },
        version: 0,
      })
    );
  }, { cartItem: CART_ITEM });
}

/** Stubs the Razorpay SDK so tests can drive payment callbacks in-process. */
async function stubRazorpaySdk(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__rzpOptions = null;
    w.__rzpOpened  = false;
    w.Razorpay = class RazorpayStub {
      private opts: Record<string, unknown>;
      constructor(opts: Record<string, unknown>) {
        this.opts   = opts;
        w.__rzpOptions = opts;
      }
      open() { w.__rzpOpened = true; }
    };
  });
}

/** Waits past the CartSkeleton until the real cart heading is visible. */
async function waitForCartReady(page: Page) {
  // "Your Cart (N Items)" heading is rendered only when session + data resolved
  await expect(page.getByText(/Your Cart/)).toBeVisible({ timeout: 25_000 });
}

type RzpWindow = Record<string, unknown> & {
  __rzpOptions: {
    handler: (r: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => void;
  } | null;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Cart Page — Pay Flow', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await stubRazorpaySdk(page);
    await seedOneItemCart(page);
  });

  test('one item in cart, click pay → opens Razorpay checkout with correct order', async ({ page }) => {
    await setupRoutes(page);
    await injectFetchMock(page);
    await page.goto('/cart');
    await waitForCartReady(page);

    await expect(page.getByText('Idli Sambhar')).toBeVisible();
    await expect(page.getByText('₹80')).toBeVisible();

    await page.getByRole('button', { name: /proceed to pay/i }).first().click();

    await expect.poll(
      () => page.evaluate(() => (window as unknown as RzpWindow).__rzpOptions),
      { timeout: 15_000 }
    ).not.toBeNull();

    const options = await page.evaluate(
      () => (window as unknown as RzpWindow).__rzpOptions
    ) as Record<string, unknown>;

    expect(options.key).toBeTruthy();
    expect(options.amount).toBe(8000);
    expect(options.order_id).toBe('order_RZP123');
    expect(options.prefill).toMatchObject({ contact: '+919876543210' });
    expect(
      await page.evaluate(() => (window as unknown as Record<string, unknown>).__rzpOpened)
    ).toBe(true);
  });

  test('payment PASS — order is taken and confirmation is shown', async ({ page }) => {
    await setupRoutes(page);
    await injectFetchMock(page);
    await page.goto('/cart');
    await waitForCartReady(page);

    await page.getByRole('button', { name: /proceed to pay/i }).first().click();

    await expect.poll(
      () => page.evaluate(() => (window as unknown as RzpWindow).__rzpOptions),
      { timeout: 15_000 }
    ).not.toBeNull();

    // Simulate Razorpay returning a successful payment
    await page.evaluate(() => {
      (window as unknown as RzpWindow).__rzpOptions!.handler({
        razorpay_order_id: 'order_RZP123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'sig_123',
      });
    });

    await expect(page.getByText(/order placed/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/ord_local_1/)).toBeVisible();
    await expect(page.getByText(/failed/i)).toHaveCount(0);
  });

  test('payment FAIL — no order placed and error is shown', async ({ page }) => {
    await setupRoutes(page, { verifyStatus: 400 });
    await injectFetchMock(page, { verifyStatus: 400 });
    await page.goto('/cart');
    await waitForCartReady(page);

    await page.getByRole('button', { name: /proceed to pay/i }).first().click();

    await expect.poll(
      () => page.evaluate(() => (window as unknown as RzpWindow).__rzpOptions),
      { timeout: 15_000 }
    ).not.toBeNull();

    // Simulate Razorpay returning a payment that fails server verification
    await page.evaluate(() => {
      (window as unknown as RzpWindow).__rzpOptions!.handler({
        razorpay_order_id: 'order_RZP123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'bad_sig',
      });
    });

    await expect(page.getByText(/payment verification failed/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/order placed/i)).toHaveCount(0);
    await expect(page.getByText('Idli Sambhar')).toBeVisible();
  });

  test('pay with empty cart does not open checkout', async ({ page }) => {
    await setupRoutes(page);
    await injectFetchMock(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        'rrc-cart',
        JSON.stringify({ state: { cart: [], appliedCoupon: null, orderType: 'PREBOOK' }, version: 0 })
      );
    });
    await page.goto('/cart');

    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByRole('button', { name: /proceed to pay/i })).toHaveCount(0);
  });
});
