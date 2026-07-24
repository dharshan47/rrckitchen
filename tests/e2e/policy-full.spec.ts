import { test, expect } from "@playwright/test"

test.describe("Policy Pages - Full Coverage", () => {
  test("privacy policy page loads with content", async ({ page }) => {
    await page.goto("/privacy-policy")
    await expect(page.locator("h1")).toContainText(/Privacy/i)
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("privacy policy has data collection section", async ({ page }) => {
    await page.goto("/privacy-policy")
    await expect(page.getByText(/data|information|collection|personal/i)).toBeVisible()
  })

  test("privacy policy has contact section", async ({ page }) => {
    await page.goto("/privacy-policy")
    await expect(page.getByText(/contact|email|grievance/i)).toBeVisible()
  })

  test("terms of use page loads with content", async ({ page }) => {
    await page.goto("/terms-of-use")
    await expect(page.locator("h1")).toContainText(/Terms/i)
    await expect(page.locator("main, article, section").first()).toBeVisible()
  })

  test("terms of use has acceptable use section", async ({ page }) => {
    await page.goto("/terms-of-use")
    await expect(page.getByText(/use|service|agreement|condition/i)).toBeVisible()
  })
})
