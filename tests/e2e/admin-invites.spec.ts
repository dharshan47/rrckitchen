import { test, expect } from "@playwright/test"

test.describe("Admin Invites", () => {
  test("displays invite management page", async ({ page }) => {
    await page.goto("/admin/invite")
    await expect(page.locator("h1")).toContainText("Admin Invites")
  })

  test("shows pending invites section", async ({ page }) => {
    await page.goto("/admin/invite")
    await expect(page.locator("text=Pending Invites")).toBeVisible()
  })

  test("shows active admins section", async ({ page }) => {
    await page.goto("/admin/invite")
    await expect(page.locator("text=Active Admins")).toBeVisible()
  })

  test("shows create invite permission toggles", async ({ page }) => {
    await page.goto("/admin/invite")
    await expect(page.locator("text=Manage Admins")).toBeVisible()
    await expect(page.locator("text=Approve KYC")).toBeVisible()
    await expect(page.locator("text=Manage Catalog")).toBeVisible()
  })
})
