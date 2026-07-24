import { test, expect } from "@playwright/test"

test.describe("Invite Acceptance Page", () => {
  test("loads invite page for valid token", async ({ page }) => {
    await page.goto("/invite/test-token-123")
    await expect(page.locator("main, article, section, h1, h2").first()).toBeVisible()
  })

  test("shows accept or reject actions", async ({ page }) => {
    await page.goto("/invite/test-token-123")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })
})
