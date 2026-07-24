import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import MobileOtpLogin from "@/components/auth/mobile-otp-login"

vi.mock("@/hooks/usePhoneAuth", () => ({
  usePhoneAuth: vi.fn(),
}))

const mockUsePhoneAuth = vi.fn()
vi.mock("@/hooks/usePhoneAuth", () => ({
  usePhoneAuth: (...args: unknown[]) => mockUsePhoneAuth(...args),
}))

const defaultAuthState = {
  step: "phone",
  errorMessage: null,
  isLoading: false,
  resendCooldown: 0,
  verified: false,
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
}

describe("MobileOtpLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState })
  })

  it("renders login form with phone input", () => {
    render(<MobileOtpLogin />)
    expect(screen.getByText("Sign In")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("9876543210")).toBeInTheDocument()
    expect(screen.getByText("Continue")).toBeInTheDocument()
  })

  it("renders with custom role attribute", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState })
    render(<MobileOtpLogin role="delivery-partner" />)
    expect(screen.getByText("Sign In")).toBeInTheDocument()
  })

  it("renders OTP form when step is otp", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, step: "otp" })
    render(<MobileOtpLogin />)
    expect(screen.getByText("Enter OTP")).toBeInTheDocument()
    expect(screen.getByText("Verify OTP")).toBeInTheDocument()
  })

  it("renders success state when verified", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, verified: true })
    render(<MobileOtpLogin />)
    expect(screen.getByText("Welcome!")).toBeInTheDocument()
    expect(screen.getByText("Phone Verified!")).toBeInTheDocument()
    expect(screen.getByText("Login")).toBeInTheDocument()
  })

  it("renders error message when present", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, errorMessage: "Invalid phone number" })
    render(<MobileOtpLogin />)
    expect(screen.getByText("Invalid phone number")).toBeInTheDocument()
  })

  it("calls sendOtp on form submission", async () => {
    const sendOtp = vi.fn().mockResolvedValue(undefined)
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, sendOtp })
    render(<MobileOtpLogin />)
    const input = screen.getByPlaceholderText("9876543210")
    fireEvent.change(input, { target: { value: "9876543210" } })
    fireEvent.click(screen.getByText("Continue"))
    await waitFor(() => {
      expect(sendOtp).toHaveBeenCalledWith("9876543210")
    })
  })

  it("shows loading state when isLoading is true", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, isLoading: true })
    render(<MobileOtpLogin />)
    expect(screen.getByText("Sending OTP...")).toBeInTheDocument()
  })

  it("renders no account link when noAccountHref is provided", () => {
    render(<MobileOtpLogin noAccountHref="/signup" noAccountLabel="Don't have an account?" />)
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText("Sign up")).toBeInTheDocument()
  })

  it("renders resend OTP section in OTP step", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, step: "otp" })
    render(<MobileOtpLogin />)
    expect(screen.getByText(/Didn't get a code/)).toBeInTheDocument()
    expect(screen.getByText("Resend OTP")).toBeInTheDocument()
  })

  it("shows resend cooldown timer", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, step: "otp", resendCooldown: 30 })
    render(<MobileOtpLogin />)
    expect(screen.getByText("Resend in 30s")).toBeInTheDocument()
  })

  it("renders back button in OTP step", () => {
    mockUsePhoneAuth.mockReturnValue({ ...defaultAuthState, step: "otp" })
    render(<MobileOtpLogin />)
    const backBtn = screen.getByLabelText("Go back")
    expect(backBtn).toBeInTheDocument()
  })

  it("validates phone number format", async () => {
    render(<MobileOtpLogin />)
    const input = screen.getByPlaceholderText("9876543210")
    fireEvent.change(input, { target: { value: "12345" } })
    fireEvent.click(screen.getByText("Continue"))
    await waitFor(() => {
      expect(screen.getByText("Enter a valid 10-digit mobile number")).toBeInTheDocument()
    })
  })

  it("does not show back button on phone step", () => {
    render(<MobileOtpLogin />)
    expect(screen.queryByLabelText("Go back")).not.toBeInTheDocument()
  })
})
