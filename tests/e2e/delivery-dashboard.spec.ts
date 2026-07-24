import { test, expect } from "@playwright/test"

test.describe("Delivery Partner Dashboard", () => {
  test("displays delivery dashboard", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.locator("h1")).toContainText("Delivery Dashboard")
  })

  test("shows earnings section", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.locator("text=Earnings")).toBeVisible()
  })

  test("shows online/offline toggle", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.locator('button:has-text("Go Online")')).toBeVisible()
  })
})
