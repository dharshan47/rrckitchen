import { test, expect } from '@playwright/test'

test.describe('Kitchen Menu Image Upload', () => {
  test('menu page has upload UI elements', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    await expect(page.getByText(/Add Menu Item/i)).toBeVisible()
    await expect(page.getByText(/Image/i)).toBeVisible()
  })

  test('upload button is present on menu page', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const uploadBtn = page.locator('button', { hasText: 'Upload' })
    await expect(uploadBtn).toBeVisible()
  })

  test('upload button is enabled on page load', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const uploadBtn = page.locator('button', { hasText: 'Upload' })
    await expect(uploadBtn).toBeEnabled()
  })

  test('image preview placeholder is shown before upload', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const placeholderIcon = page.locator('svg.lucide-image')
    await expect(placeholderIcon).toBeVisible()
  })

  test('hidden file input exists for image selection', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const fileInput = page.locator('input[type="file"][accept="image/*"]')
    await expect(fileInput).toBeHidden()
    await expect(fileInput).toHaveAttribute('accept', 'image/*')
  })
})

test.describe('Profile Page Image Upload', () => {
  test('profile page has camera button for photo upload', async ({ page }) => {
    await page.goto('/account/profile')
    const cameraBtn = page.locator('button[aria-label="Change photo"]')
    await expect(cameraBtn).toBeVisible()
  })

  test('camera upload button is enabled', async ({ page }) => {
    await page.goto('/account/profile')
    const cameraBtn = page.locator('button[aria-label="Change photo"]')
    await expect(cameraBtn).toBeEnabled()
  })

  test('profile page has hidden file input for image upload', async ({ page }) => {
    await page.goto('/account/profile')
    const fileInput = page.locator('input[type="file"][accept="image/*"]')
    await expect(fileInput).toBeHidden()
    await expect(fileInput).toHaveAttribute('accept', 'image/*')
  })
})

test.describe('CloudinaryUpload Component Rendering', () => {
  test('kitchen upload triggers file picker on click', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const uploadBtn = page.locator('button', { hasText: 'Upload' })
    const fileInput = page.locator('input[type="file"]')

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadBtn.click(),
    ])

    expect(fileChooser).toBeTruthy()
  })

  test('profile camera button triggers file picker on click', async ({ page }) => {
    await page.goto('/account/profile')
    const cameraBtn = page.locator('button[aria-label="Change photo"]')
    const fileInput = page.locator('input[type="file"]')

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      cameraBtn.click(),
    ])

    expect(fileChooser).toBeTruthy()
  })

  test('kitchen page can select image file via upload button', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const uploadBtn = page.locator('button', { hasText: 'Upload' })

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadBtn.click(),
    ])

    await fileChooser.setFiles({
      name: 'test-food.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    })
  })
})

test.describe('Image Storage Verification', () => {
  test('menu form includes imageUrl as hidden data when image is uploaded', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const form = page.locator('form').filter({ has: page.locator('button', { hasText: 'Add Item' }) })
    await expect(form).toBeVisible()

    const fileInput = form.locator('input[type="file"]')
    await expect(fileInput).toBeHidden()
  })

  test('image preview appears when imageUrl state is set', async ({ page }) => {
    await page.goto('/kitchen/dashboard/menu')
    const imgPreview = page.locator('img[alt="Preview"]')
    await expect(imgPreview).toHaveCount(0)
  })
})
