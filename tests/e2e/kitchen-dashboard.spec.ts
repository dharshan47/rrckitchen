import { test, expect } from "@playwright/test"

test.describe("Kitchen Dashboard", () => {
  test("displays kitchen dashboard", async ({ page }) => {
    await page.goto("/kitchen/dashboard")
    await expect(page.locator("h1")).toContainText("Kitchen Dashboard")
  })

  test("shows today's orders section", async ({ page }) => {
    await page.goto("/kitchen/dashboard")
    await expect(page.locator("text=Today's Orders")).toBeVisible()
  })
})
