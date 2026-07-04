import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(),
}))

const prismaMock = {
  user: { update: vi.fn() },
  kitchenPartner: { findUnique: vi.fn() },
  menu: { findFirst: vi.fn(), create: vi.fn() },
  menuItem: { create: vi.fn() },
  menuItemPhoto: { create: vi.fn() },
}
vi.mock("@/lib/prisma", () => ({ default: prismaMock }))

const { getSession } = await import("@/lib/auth-server")

describe("updateProfileImage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates user image with the uploaded URL", async () => {
    const mockedSession = { user: { id: "user-1" } }
    vi.mocked(getSession).mockResolvedValue(mockedSession as never)
    prismaMock.user.update.mockResolvedValue({ id: "user-1", image: "https://res.cloudinary.com/avatar.jpg" })

    const { updateProfileImage } = await import("@/actions/profile")
    const result = await updateProfileImage("https://res.cloudinary.com/avatar.jpg")

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { image: "https://res.cloudinary.com/avatar.jpg" },
    })
    expect(result).toEqual({ success: true })
  })

  it("returns error when user is not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null as never)

    const { updateProfileImage } = await import("@/actions/profile")
    const result = await updateProfileImage("https://res.cloudinary.com/avatar.jpg")

    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error when session has no user id", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: null } as never)

    const { updateProfileImage } = await import("@/actions/profile")
    const result = await updateProfileImage("https://res.cloudinary.com/avatar.jpg")

    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })
})

describe("addKitchenMenuItem image storage", () => {
  const validFormData = () => {
    const fd = new FormData()
    fd.set("name", "Masala Dosa")
    fd.set("category", "breakfast")
    fd.set("foodType", "veg")
    fd.set("timeSlot", "morning")
    fd.set("price", "70")
    return fd
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates MenuItemPhoto when imageUrl is provided", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: "user-1" } } as never)
    prismaMock.kitchenPartner.findUnique.mockResolvedValue({ id: "kp-1" })
    prismaMock.menu.findFirst.mockResolvedValue(null)
    prismaMock.menu.create.mockResolvedValue({ id: "menu-1" })
    prismaMock.menuItem.create.mockResolvedValue({ id: "item-1" })

    const fd = validFormData()
    fd.set("imageUrl", "https://res.cloudinary.com/food.jpg")
    fd.set("imagePublicId", "food_abc123")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).toHaveBeenCalledWith({
      data: {
        menuItemId: "item-1",
        imageUrl: "https://res.cloudinary.com/food.jpg",
        cloudinaryPublicId: "food_abc123",
        sortOrder: 0,
      },
    })
    expect(result).toEqual({ success: true })
  })

  it("skips MenuItemPhoto creation when imageUrl is empty", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: "user-1" } } as never)
    prismaMock.kitchenPartner.findUnique.mockResolvedValue({ id: "kp-1" })
    prismaMock.menu.findFirst.mockResolvedValue(null)
    prismaMock.menu.create.mockResolvedValue({ id: "menu-1" })
    prismaMock.menuItem.create.mockResolvedValue({ id: "item-1" })

    const fd = validFormData()
    fd.set("imageUrl", "")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it("skips MenuItemPhoto creation when imagePublicId is missing but imageUrl is provided", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: "user-1" } } as never)
    prismaMock.kitchenPartner.findUnique.mockResolvedValue({ id: "kp-1" })
    prismaMock.menu.findFirst.mockResolvedValue(null)
    prismaMock.menu.create.mockResolvedValue({ id: "menu-1" })
    prismaMock.menuItem.create.mockResolvedValue({ id: "item-1" })

    const fd = validFormData()
    fd.set("imageUrl", "https://res.cloudinary.com/food.jpg")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).toHaveBeenCalledWith({
      data: {
        menuItemId: "item-1",
        imageUrl: "https://res.cloudinary.com/food.jpg",
        cloudinaryPublicId: "",
        sortOrder: 0,
      },
    })
    expect(result).toEqual({ success: true })
  })

  it("returns error when user is not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null as never)

    const fd = validFormData()
    fd.set("imageUrl", "https://res.cloudinary.com/food.jpg")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error when kitchen partner is not found", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: "user-1" } } as never)
    prismaMock.kitchenPartner.findUnique.mockResolvedValue(null)

    const fd = validFormData()
    fd.set("imageUrl", "https://res.cloudinary.com/food.jpg")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: "Kitchen partner not found" })
  })

  it("stores only imageUrl when cloudinaryPublicId is not provided", async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: "user-1" } } as never)
    prismaMock.kitchenPartner.findUnique.mockResolvedValue({ id: "kp-1" })
    prismaMock.menu.findFirst.mockResolvedValue(null)
    prismaMock.menu.create.mockResolvedValue({ id: "menu-1" })
    prismaMock.menuItem.create.mockResolvedValue({ id: "item-1" })

    const fd = validFormData()
    fd.set("imageUrl", "https://res.cloudinary.com/food.jpg")

    const { addKitchenMenuItem } = await import("@/actions/dashboard")
    const result = await addKitchenMenuItem(fd)

    expect(prismaMock.menuItemPhoto.create).toHaveBeenCalledWith({
      data: {
        menuItemId: "item-1",
        imageUrl: "https://res.cloudinary.com/food.jpg",
        cloudinaryPublicId: "",
        sortOrder: 0,
      },
    })
    expect(result).toEqual({ success: true })
  })
})
