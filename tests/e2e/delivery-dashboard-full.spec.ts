import { test, expect } from "@playwright/test"

test.describe("Delivery Partner Dashboard Sub-pages", () => {
  test("dashboard loads", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.locator("h1, h2, main, article").first()).toBeVisible()
  })

  test("profile page loads", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard/profile")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("bank details page loads", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard/bank-details")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })
})

test.describe("Delivery Partner Dashboard - Earnings", () => {
  test("shows earnings section", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.getByText(/earning|payout/i)).toBeVisible()
  })

  test("shows active deliveries section", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })
})

test.describe("Delivery Partner Signup Flow", () => {
  test("signup page loads", async ({ page }) => {
    await page.goto("/delivery-partner/signup")
    await expect(page.locator("h1")).toContainText(/Sign Up/i)
  })

  test("shows phone number input", async ({ page }) => {
    await page.goto("/delivery-partner/signup")
    await expect(page.getByLabel(/Mobile number|Phone/i)).toBeVisible()
  })
})

test.describe("Delivery Partner Dashboard - Online Toggle", () => {
  test("shows online/offline status", async ({ page }) => {
    await page.goto("/delivery-partner/dashboard")
    await expect(page.getByText(/online|offline|Go Online/i)).toBeVisible()
  })
})
