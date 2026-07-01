import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignInEmail = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: (...args: unknown[]) => mockSignInEmail(...args),
    },
  },
}));

import AdminLoginPage from "@/app/admin/login/page";

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the admin login heading", () => {
    render(<AdminLoginPage />);
    expect(screen.getByText(/admin login/i)).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<AdminLoginPage />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows subtitle text", () => {
    render(<AdminLoginPage />);
    expect(screen.getByText(/sign in with your admin credentials/i)).toBeInTheDocument();
  });

  it("has email input of type email", () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
  });

  it("has password input of type password", () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });

  it("calls signIn.email on form submit", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@rrckitchen.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: "admin@rrckitchen.com",
      password: "password123",
    });
  });

  it("redirects to /admin on successful login", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@rrckitchen.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockPush).toHaveBeenCalledWith("/admin");
  });

  it("shows error message on failed login", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "wrong@email.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    mockSignInEmail.mockImplementation(
      () => new Promise(() => {})
    );
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@rrckitchen.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("shows generic error on exception", async () => {
    mockSignInEmail.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@rrckitchen.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
  });

  it("shows error with fallback message when signInError has no message", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: undefined },
    });
    const user = userEvent.setup();

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText(/email/i), "admin@rrckitchen.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
