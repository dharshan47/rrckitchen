import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AcceptInviteForm } from "@/components/admin/accept-form"
import * as authClient from "@/lib/auth-client"
import * as invitesActions from "@/actions/admin/invites-actions"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(() => ({ data: null, refetch: vi.fn() })),
  signOut: vi.fn(),
  signUp: {
    email: vi.fn(),
  },
}))

vi.mock("@/actions/admin/invites-actions", () => ({
  acceptAdminInvite: vi.fn(),
  validateAdminInvite: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("AcceptInviteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authClient.useSession).mockReturnValue({ data: null, refetch: vi.fn() } as never)
    vi.mocked(invitesActions.validateAdminInvite).mockResolvedValue({
      valid: true,
      permissions: [],
      expiresAt: new Date().toISOString(),
    } as never)
  })

  it("shows exact-shape skeleton while the invite is being validated", async () => {
    vi.mocked(invitesActions.validateAdminInvite).mockImplementation(() => new Promise(() => {}))
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(screen.getByTestId("accept-invite-skeleton")).toBeInTheDocument()
  })

  it("renders create account form when invite is valid and no session", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(await screen.findByRole("heading", { name: "Create Admin Account" })).toBeInTheDocument()
  })

  it("renders email and password fields", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("shows invalid invite card when the token is expired", async () => {
    vi.mocked(invitesActions.validateAdminInvite).mockResolvedValue({
      valid: false,
      reason: "expired",
    } as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(await screen.findByText("Invite unavailable")).toBeInTheDocument()
    expect(screen.getByText(/has expired/i)).toBeInTheDocument()
  })

  it("shows sign-out card when user is already signed in", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { email: "test@example.com" } },
      refetch: vi.fn(),
    } as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(screen.getByText("Sign out first")).toBeInTheDocument()
    expect(screen.getByText("Sign out")).toBeInTheDocument()
  })

  it("shows validation error for invalid email", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "invalid" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.submit(emailInput.closest("form")!)
    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument()
    })
  })

  it("shows validation error for short password", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "short" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }))
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
    })
  })

  it("calls signUp and acceptAdminInvite on valid submission", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({ error: null, data: {} } as never)
    vi.mocked(invitesActions.acceptAdminInvite).mockResolvedValue(undefined as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }))
    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
        name: "admin",
      })
    })
    await waitFor(() => {
      expect(invitesActions.acceptAdminInvite).toHaveBeenCalledWith("test-token")
    })
  })

  it("redirects to 2fa-setup on success", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({ error: null, data: {} } as never)
    vi.mocked(invitesActions.acceptAdminInvite).mockResolvedValue(undefined as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/2fa-setup")
    })
  })

  it("shows backend error when signUp fails", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: { message: "Email already in use" },
    } as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }))
    await waitFor(() => {
      expect(screen.getByText(/already in use/i)).toBeInTheDocument()
    })
  })

  it("disables form inputs while submitting", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(() => new Promise(() => {}))
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = await screen.findByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }))
    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument()
    })
  })
})
