import { test, expect } from "@playwright/test"

test.describe("Help Center", () => {
  test("loads with help heading", async ({ page }) => {
    await page.goto("/help")
    await expect(page.locator("h1")).toContainText(/Help/i)
  })

  test("displays help categories/tabs", async ({ page }) => {
    await page.goto("/help")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("shows orders help section", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByText(/order/i)).toBeVisible()
  })

  test("shows FAQs section", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByText(/FAQ/i)).toBeVisible()
  })

  test("shows kitchen partner help", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByText(/kitchen/i)).toBeVisible()
  })

  test("shows delivery partner help", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByText(/delivery/i)).toBeVisible()
  })

  test("navigates back to home via logo", async ({ page }) => {
    await page.goto("/help")
    const logo = page.getByRole("link", { name: /RRC Kitchen/i }).first()
    await logo.click()
    await expect(page).toHaveURL("/")
  })
})
