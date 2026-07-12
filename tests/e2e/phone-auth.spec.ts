import { test, expect, Route } from "@playwright/test";

const TEST_PHONE = "9876543210";
test.describe("Phone Auth Flow (Server-side OTP)", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Better-Auth phone number send-otp endpoint
    await page.route("**/api/auth/phone-number/send-otp", async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock the Better-Auth phone number verify endpoint
    // Accept "123456" as valid OTP
    await page.route("**/api/auth/phone-number/verify", async (route: Route) => {
      const body = JSON.parse(route.request().postData() || "{}");
      if (body.code === "123456") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Invalid OTP. Please try again." } }),
        });
      }
    });

    // Mock checkPhoneRegistered (server action) to return true for test phone
    await page.route("**/api/auth/**", async (route: Route) => {
      const url = route.request().url();
      if (!url.includes("phone-number")) {
        await route.continue();
      }
    });
  });

  test("loads the login page with phone input and continue button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });

  test("enters phone and shows OTP step", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/phone number/i).fill(TEST_PHONE);
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Enter OTP")).toBeVisible();
    await expect(page.getByRole("button", { name: /verify otp/i })).toBeVisible();
  });

  test("shows error if phone is not registered", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/api/auth/**", async (route: Route) => {
      const body = route.request().postData();
      if (body && body.includes("checkPhoneRegistered")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(false),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByLabel(/phone number/i).fill("1234567890");
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Phone number not registered")).toBeVisible();
  });

  test("completes full OTP flow - phone entry, OTP, and login redirect", async ({ page }) => {
    await page.goto("/login");

    // Step 1: Phone entry
    await page.getByLabel(/phone number/i).fill(TEST_PHONE);
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Enter OTP")).toBeVisible();

    // Step 2: OTP verification
    const otpInput = page.locator("[data-testid=input-otp]").first();
    if (await otpInput.isVisible()) {
      await otpInput.fill("123456");
    }

    await page.getByRole("button", { name: /verify otp/i }).click();

    // Wait for verified state → login button appears
    await expect(page.getByText("Phone Verified!")).toBeVisible();
    await expect(page.getByRole("button", { name: /^login$/i })).toBeVisible();

    // Step 3: Login redirect
    await page.getByRole("button", { name: /^login$/i }).click();
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("shows error on invalid OTP", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/phone number/i).fill(TEST_PHONE);
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Enter OTP")).toBeVisible();

    // Enter wrong OTP
    const otpInput = page.locator("[data-testid=input-otp]").first();
    if (await otpInput.isVisible()) {
      await otpInput.fill("000000");
    }

    await page.getByRole("button", { name: /verify otp/i }).click();

    await expect(page.getByText("Invalid OTP")).toBeVisible();
  });

  test("shows Resend OTP section on OTP step", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/phone number/i).fill(TEST_PHONE);
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Enter OTP")).toBeVisible();
    await expect(page.getByText("Resend OTP")).toBeVisible();
  });

  test("kitchen login shows phone input", async ({ page }) => {
    await page.goto("/kitchen/login");
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });

  test("delivery partner login shows phone input", async ({ page }) => {
    await page.goto("/delivery-partner/login");
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });
});
