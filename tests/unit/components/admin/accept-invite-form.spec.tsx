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
  })

  it("renders create account form when no session", () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(screen.getByText("Create your admin account")).toBeInTheDocument()
    expect(screen.getByText("Create admin account")).toBeInTheDocument()
  })

  it("renders email and password fields", () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })

  it("shows sign-out card when user is already signed in", () => {
    vi.mocked(authClient.useSession).mockReturnValue({ data: { user: { email: "test@example.com" } }, refetch: vi.fn() } as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    expect(screen.getByText("Sign out first")).toBeInTheDocument()
    expect(screen.getByText("Sign out")).toBeInTheDocument()
  })

  it("shows validation error for invalid email", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "invalid" } })
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByText("Create admin account"))
    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument()
    })
  })

  it("shows validation error for short password", async () => {
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(passwordInput, { target: { value: "short" } })
    fireEvent.click(screen.getByText("Create admin account"))
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
    })
  })

  it("calls signUp and acceptAdminInvite on valid submission", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({ error: null, data: {} } as never)
    vi.mocked(invitesActions.acceptAdminInvite).mockResolvedValue({} as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByText("Create admin account"))
    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
        name: "admin",
      })
    })
  })

  it("redirects to 2fa-setup on success", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({ error: null, data: {} } as never)
    vi.mocked(invitesActions.acceptAdminInvite).mockResolvedValue({} as never)
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByText("Create admin account"))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/2fa-setup")
    })
  })

  it("disables form inputs while submitting", async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(() => new Promise(() => {}))
    render(<AcceptInviteForm token="test-token" />, { wrapper: createWrapper() })
    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } })
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByText("Create admin account"))
    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument()
    })
  })
})
