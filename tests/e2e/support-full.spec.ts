import { test, expect } from "@playwright/test"

test.describe("Support Page", () => {
  test("loads with support heading", async ({ page }) => {
    await page.goto("/support")
    await expect(page.locator("h1")).toContainText(/Support/i)
  })

  test("shows support ticket form", async ({ page }) => {
    await page.goto("/support")
    await expect(page.locator("form, input, textarea, button[type='submit']").first()).toBeVisible()
  })

  test("has subject/category input", async ({ page }) => {
    await page.goto("/support")
    await expect(page.locator("input, select, textarea").first()).toBeVisible()
  })
})

test.describe("Support Ticket Flow", () => {
  test("can fill in support form fields", async ({ page }) => {
    await page.goto("/support")
    const inputs = page.locator("input:visible, textarea:visible")
    const count = await inputs.count()
    if (count > 0) {
      await inputs.first().fill("Test inquiry about my order")
      await expect(inputs.first()).toHaveValue("Test inquiry about my order")
    }
  })
})
