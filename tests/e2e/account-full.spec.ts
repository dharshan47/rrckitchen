import { test, expect } from "@playwright/test"

test.describe("Account Profile Page", () => {
  test("loads profile page", async ({ page }) => {
    await page.goto("/account/profile")
    await expect(page.locator("h1")).toContainText(/Profile/i)
  })

  test("shows profile sections", async ({ page }) => {
    await page.goto("/account/profile")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("has change photo button", async ({ page }) => {
    await page.goto("/account/profile")
    const cameraBtn = page.locator('button[aria-label="Change photo"]')
    await expect(cameraBtn).toBeVisible()
  })

  test("shows user information fields", async ({ page }) => {
    await page.goto("/account/profile")
    await expect(page.locator("input, form").first()).toBeVisible()
  })
})

test.describe("Account Orders Page", () => {
  test("loads orders page", async ({ page }) => {
    await page.goto("/account/orders")
    await expect(page.locator("h1")).toContainText(/Orders/i)
  })

  test("shows order list or empty state", async ({ page }) => {
    await page.goto("/account/orders")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })
})

test.describe("Account Favourites Page", () => {
  test("loads favourites page", async ({ page }) => {
    await page.goto("/account/favourites")
    await expect(page.locator("h1")).toContainText(/Favourite/i)
  })

  test("shows favourites tabs or content", async ({ page }) => {
    await page.goto("/account/favourites")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })
})

test.describe("Account Loyalty Page", () => {
  test("loads loyalty page", async ({ page }) => {
    await page.goto("/account/loyalty")
    await expect(page.locator("h1")).toContainText(/Loyalty/i)
  })

  test("shows loyalty points section", async ({ page }) => {
    await page.goto("/account/loyalty")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("displays tier information", async ({ page }) => {
    await page.goto("/account/loyalty")
    await expect(page.getByText(/tier|bronze|silver|gold/i)).toBeVisible()
  })

  test("shows referral section", async ({ page }) => {
    await page.goto("/account/loyalty")
    await expect(page.getByText(/referral|refer/i)).toBeVisible()
  })
})

test.describe("Account Support Page", () => {
  test("loads account support page", async ({ page }) => {
    await page.goto("/account/support")
    await expect(page.locator("h1")).toContainText(/Support/i)
  })

  test("shows support tickets or empty state", async ({ page }) => {
    await page.goto("/account/support")
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })
})
