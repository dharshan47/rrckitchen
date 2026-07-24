import { test, expect } from "@playwright/test"

test.describe("Signup Page (Customer)", () => {
  test("loads with RRC Kitchen branding", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("heading", { name: /RRC Kitchen/i })).toBeVisible()
  })

  test("shows mobile number input", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible()
  })

  test("shows Continue button", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("button", { name: /Continue/i })).toBeVisible()
  })

  test("has login link", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible()
  })

  test("mobile input accepts digits", async ({ page }) => {
    await page.goto("/signup")
    const input = page.getByLabel(/Mobile number/i)
    await input.fill("9876543210")
    await expect(input).toHaveValue("9876543210")
  })
})

test.describe("Signup with Referral Code", () => {
  test("accepts referral code from query param", async ({ page }) => {
    await page.goto("/signup?ref=ABC123")
    await expect(page.getByRole("heading", { name: /RRC Kitchen/i })).toBeVisible()
  })
})
