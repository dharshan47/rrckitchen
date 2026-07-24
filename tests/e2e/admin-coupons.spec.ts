import { test, expect } from "@playwright/test"

test.describe("Admin Coupons", () => {
  test("displays coupons admin page", async ({ page }) => {
    await page.goto("/admin/coupons")
    await expect(page.locator("h1")).toContainText("Coupon Codes")
  })

  test("shows create coupon button", async ({ page }) => {
    await page.goto("/admin/coupons")
    await expect(page.locator('button:has-text("Create Coupon")')).toBeVisible()
  })

  test("shows coupons table", async ({ page }) => {
    await page.goto("/admin/coupons")
    await expect(page.locator("table")).toBeVisible()
  })
})
