import { test, expect } from "@playwright/test"

test.describe("Kitchen Dashboard Sub-pages", () => {
  test("kitchen dashboard loads", async ({ page }) => {
    await page.goto("/kitchen/dashboard")
    await expect(page.locator("h1, h2, main, article").first()).toBeVisible()
  })

  test("kitchen menu page loads", async ({ page }) => {
    await page.goto("/kitchen/dashboard/menu")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("kitchen orders page loads", async ({ page }) => {
    await page.goto("/kitchen/dashboard/orders")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("kitchen payments page loads", async ({ page }) => {
    await page.goto("/kitchen/dashboard/payments")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("kitchen profile page loads", async ({ page }) => {
    await page.goto("/kitchen/dashboard/profile")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })
})

test.describe("Kitchen Dashboard Menu Page", () => {
  test("shows add menu item form", async ({ page }) => {
    await page.goto("/kitchen/dashboard/menu")
    await expect(page.getByText(/Add Menu Item|Menu Item/i)).toBeVisible()
  })

  test("has image upload button", async ({ page }) => {
    await page.goto("/kitchen/dashboard/menu")
    const uploadBtn = page.locator("button", { hasText: /Upload/i })
    await expect(uploadBtn).toBeVisible()
  })

  test("has item name input", async ({ page }) => {
    await page.goto("/kitchen/dashboard/menu")
    await expect(page.locator("input, textarea").first()).toBeVisible()
  })
})

test.describe("Kitchen Signup Flow", () => {
  test("kitchen signup page loads with form", async ({ page }) => {
    await page.goto("/kitchen/signup")
    await expect(page.locator("h1")).toContainText(/Sign Up/i)
  })

  test("shows phone number input", async ({ page }) => {
    await page.goto("/kitchen/signup")
    await expect(page.getByLabel(/Mobile number|Phone/i)).toBeVisible()
  })
})
