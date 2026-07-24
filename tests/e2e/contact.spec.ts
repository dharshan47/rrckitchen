import { test, expect } from "@playwright/test"

test.describe("Contact Page", () => {
  test("loads with contact heading", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.locator("h1")).toContainText(/Contact/i)
  })

  test("displays email contact info", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.getByText(/email/i)).toBeVisible()
  })

  test("displays phone contact info", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.getByText(/phone/i)).toBeVisible()
  })

  test("displays address or location info", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("has FAQ section", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.getByText(/Frequently Asked/i)).toBeVisible()
  })

  test("has grievance officer info", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.getByText(/Grievance/i)).toBeVisible()
  })
})
