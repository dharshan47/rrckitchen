import { test, expect } from "@playwright/test"

test.describe("Admin CMS", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/kitchen/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "c1", name: "South Indian", kitchenCount: 5, imageUrl: "/img/south-indian.png" },
          { id: "c2", name: "Chinese", kitchenCount: 3, imageUrl: "/img/chinese.png" },
        ]),
      })
    })
  })

  test("displays food categories page", async ({ page }) => {
    await page.goto("/admin/cms")
    await expect(page.locator("h1")).toContainText("Content Management")
  })

  test("shows category creation form", async ({ page }) => {
    await page.goto("/admin/cms")
    await expect(page.locator("text=Add New Category")).toBeVisible()
    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#description")).toBeVisible()
  })

  test("can type in add category form", async ({ page }) => {
    await page.goto("/admin/cms")
    await page.fill("#name", "Italian")
    await page.fill("#description", "Pizza, pasta")
    await expect(page.locator("#name")).toHaveValue("Italian")
    await expect(page.locator("#description")).toHaveValue("Pizza, pasta")
  })
})
