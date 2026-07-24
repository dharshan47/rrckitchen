import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetSession = vi.fn()

vi.mock("@/lib/auth-server", () => ({
  getSession: mockGetSession,
}))

const prismaMock = {
  user: {
    update: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({
  default: prismaMock,
}))

const mockedSession: any = {
  user: {
    id: "user-1",
    name: "John",
    email: "john@example.com",
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("Profile Actions", () => {
  it("updates user name and email", async () => {
    mockGetSession.mockResolvedValue(mockedSession)
    prismaMock.user.update.mockResolvedValue({ id: "user-1", name: "John Updated", email: "john-updated@example.com" })

    const { updateProfileNameEmail } = await import("@/actions/onboarding/profile")
    const result = await updateProfileNameEmail({ name: "John Updated", email: "john-updated@example.com" })

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "John Updated", fullName: "John Updated", email: "john-updated@example.com" },
    })
    expect(result).toEqual({ success: true })
  })

  it("returns error when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null)

    const { updateProfileNameEmail } = await import("@/actions/onboarding/profile")
    const result = await updateProfileNameEmail({ name: "Test" })

    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  it("returns error when session has no user id", async () => {
    mockGetSession.mockResolvedValue({ user: null })

    const { updateProfileNameEmail } = await import("@/actions/onboarding/profile")
    await updateProfileNameEmail({ name: "Test" })

    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
