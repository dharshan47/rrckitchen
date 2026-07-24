import { test, expect } from "@playwright/test"

test.describe("Admin Orders Page", () => {
  test("loads admin orders page", async ({ page }) => {
    await page.goto("/admin/orders")
    await expect(page.locator("h1")).toContainText(/Order/i)
  })

  test("shows orders table or content", async ({ page }) => {
    await page.goto("/admin/orders")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin Kitchens Page", () => {
  test("loads admin kitchens page", async ({ page }) => {
    await page.goto("/admin/kitchens")
    await expect(page.locator("h1")).toContainText(/Kitchen/i)
  })

  test("shows kitchen list or content", async ({ page }) => {
    await page.goto("/admin/kitchens")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin Customers Page", () => {
  test("loads admin customers page", async ({ page }) => {
    await page.goto("/admin/customers")
    await expect(page.locator("h1")).toContainText(/Customer/i)
  })

  test("shows customers list or content", async ({ page }) => {
    await page.goto("/admin/customers")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin Loyalty Coupons Page", () => {
  test("loads loyalty coupons page", async ({ page }) => {
    await page.goto("/admin/loyalty-coupons")
    await expect(page.locator("h1")).toContainText(/Loyalty|Coupon/i)
  })

  test("shows loyalty coupons content", async ({ page }) => {
    await page.goto("/admin/loyalty-coupons")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin Payment Offers Page", () => {
  test("loads payment offers page", async ({ page }) => {
    await page.goto("/admin/payment-offers")
    await expect(page.locator("h1")).toContainText(/Payment|Offer/i)
  })

  test("shows payment offers content", async ({ page }) => {
    await page.goto("/admin/payment-offers")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin Cash Reconciliation Page", () => {
  test("loads cash reconciliation page", async ({ page }) => {
    await page.goto("/admin/cash-reconciliation")
    await expect(page.locator("h1")).toContainText(/Cash|Reconciliation/i)
  })

  test("shows reconciliation content", async ({ page }) => {
    await page.goto("/admin/cash-reconciliation")
    await expect(page.locator("main, article, section, table").first()).toBeVisible()
  })
})

test.describe("Admin 2FA Setup Page", () => {
  test("loads 2FA setup page", async ({ page }) => {
    await page.goto("/admin/2fa-setup")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })
})

test.describe("Admin 2FA Verification Page", () => {
  test("loads 2FA verification page", async ({ page }) => {
    await page.goto("/admin/2fa")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("shows OTP/code input", async ({ page }) => {
    await page.goto("/admin/2fa")
    await expect(page.locator("input").first()).toBeVisible()
  })
})
