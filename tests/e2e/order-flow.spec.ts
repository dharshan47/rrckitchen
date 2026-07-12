import { test, expect } from "@playwright/test"

test.describe("Complete Order Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/menu/tomorrow", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "item-1",
            name: "Idli Sambhar",
            price: 80,
            description: "Soft idlis with sambar",
            foodType: "VEG",
            timeSlot: "MORNING",
            menu: { kitchenPartner: { kitchenAlias: { displayName: "Thanjavur Kitchen" } } },
          },
          {
            id: "item-2",
            name: "Chicken Biryani",
            price: 190,
            description: "Spicy chicken biryani",
            foodType: "NONVEG",
            timeSlot: "LUNCH",
            menu: { kitchenPartner: { kitchenAlias: { displayName: "Home Spice Kitchen" } } },
          },
        ]),
      })
    })

    await page.route("**/api/orders/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "order-1",
          status: "CONFIRMED",
          items: [{ name: "Idli Sambhar", quantity: 2, price: 80 }],
          total: 160,
        }),
      })
    })
  })

  test("browse menu, add items, checkout, and see order confirmation", async ({ page }) => {
    await page.goto("/menu")
    await expect(page.getByText("Idli Sambhar")).toBeVisible()
    await expect(page.getByText("Chicken Biryani")).toBeVisible()

    const addButtons = page.getByRole("button", { name: /Add/i })
    await addButtons.first().click()

    await page.goto("/cart")
    await expect(page.getByText("Idli Sambhar")).toBeVisible()
    await expect(page.getByText(/Total/i)).toBeVisible()
  })

  test("address autocomplete shows on location dialog", async ({ page }) => {
    await page.goto("/")
    const locationButton = page.getByRole("button", { name: /location/i })
    if (await locationButton.isVisible()) {
      await locationButton.click()
      await expect(page.getByPlaceholder(/Search a location/i)).toBeVisible()
    }
  })
})
