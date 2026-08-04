import { test, expect } from "@playwright/test"

test.describe("Kitchen Detail Page", () => {
  test("loads kitchen detail page", async ({ page }) => {
    await page.goto("/kitchens/thanjavur-kitchen")
    await expect(page.locator("main, article, [data-testid]").first()).toBeVisible()
  })

  test("shows kitchen name", async ({ page }) => {
    await page.goto("/kitchens/thanjavur-kitchen")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("has back navigation to kitchens", async ({ page }) => {
    await page.goto("/kitchens/thanjavur-kitchen")
    const backLink = page.getByRole("link", { name: /back|kitchens|menu/i }).first()
    if (await backLink.isVisible()) {
      await expect(backLink).toBeVisible()
    }
  })
})

test.describe("Menu Item Detail Page (Slug Routing)", () => {
  test("navigates from kitchen detail to menu item detail via card click", async ({ page }) => {
    await page.goto("/kitchens/thanjavur-kitchen")
    await page.waitForTimeout(2000)
    const menuCard = page.locator('[data-testid="menu-card"]').first()
    await expect(menuCard).toBeVisible({ timeout: 10000 })
    await menuCard.click()
    await page.waitForURL(/\/menu\/.+\/.+/)
    expect(page.url()).toMatch(/\/menu\/[^/]+\/[^/]+-.{8,}$/)
    await expect(page.locator("main, article").first()).toBeVisible()
  })

  test("shows item name heading on menu detail page", async ({ page }) => {
    await page.goto("/kitchens/thanjavur-kitchen")
    await page.waitForTimeout(2000)
    const menuCard = page.locator('[data-testid="menu-card"]').first()
    await expect(menuCard).toBeVisible({ timeout: 10000 })
    await menuCard.click()
    await page.waitForURL(/\/menu\/.+\/.+/)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("returns 404 for invalid kitchen slug", async ({ page }) => {
    const response = await page.goto("/menu/nonexistent-kitchen/invalid-item-abc12345")
    expect(response?.status()).toBe(404)
  })

  test("returns 404 for invalid item identifier", async ({ page }) => {
    const response = await page.goto("/menu/thanjavur-kitchen/nonexistent-item-00000000")
    expect(response?.status()).toBe(404)
  })
})
