import { test, expect } from "@playwright/test"

test.describe("Customer Order Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/menu/tomorrow**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "m1", name: "Dosa", price: 100, foodType: "VEG", timeSlot: "BREAKFAST", kitchenName: "Tasty Kitchen", imageUrl: null },
          { id: "m2", name: "Idli", price: 80, foodType: "VEG", timeSlot: "BREAKFAST", kitchenName: "Tasty Kitchen", imageUrl: null },
        ]),
      })
    })
  })

  test("displays menu page and items", async ({ page }) => {
    await page.goto("/categories")
    await expect(page.locator("h1")).toContainText("All Cuisines")
  })

  test("shows search bar on categories page", async ({ page }) => {
    await page.goto("/categories")
    await expect(page.locator("input[placeholder='Search cuisines...']")).toBeVisible()
  })

  test("displays category navigation", async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("text=Categories")
  })
})
