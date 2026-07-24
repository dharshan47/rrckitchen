import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import SignupForm from "@/components/auth/signup-form"

const defaultHookState = {
  step: "phone",
  errorMessage: null as string | null,
  isLoading: false,
  resendCooldown: 0,
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
  completeSignup: vi.fn(),
  resendOtp: vi.fn(),
}

const mockUseSignUp = vi.fn(() => ({ ...defaultHookState }))

vi.mock("@/hooks/useSignUp", () => ({
  useSignUp: (...args: Parameters<typeof mockUseSignUp>) => mockUseSignUp(...args),
}))

vi.mock("@/components/ui/otp-input-boxes", () => ({
  OtpInputBoxes: ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) =>
    <input
      data-testid="otp-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="OTP"
    />,
}))

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders phone input on initial step", () => {
    render(<SignupForm />)
    expect(screen.getByPlaceholderText("Enter your mobile number")).toBeInTheDocument()
    expect(screen.getByText("Send OTP")).toBeInTheDocument()
  })

  it("shows role selection when role is not provided", () => {
    render(<SignupForm />)
    expect(screen.getByText("Customer")).toBeInTheDocument()
    expect(screen.getByText("Kitchen Partner")).toBeInTheDocument()
  })

  it("pre-selects role when provided", () => {
    render(<SignupForm role="kitchen" />)
    expect(screen.queryByText("Customer")).not.toBeInTheDocument()
  })

  it("renders phone input even with role provided", () => {
    render(<SignupForm role="customer" />)
    expect(screen.getByPlaceholderText("Enter your mobile number")).toBeInTheDocument()
  })

  it("calls sendOtp when form is submitted", async () => {
    const sendOtp = vi.fn()
    mockUseSignUp.mockReturnValue({ ...defaultHookState, sendOtp })
    render(<SignupForm />)
    const input = screen.getByPlaceholderText("Enter your mobile number")
    fireEvent.change(input, { target: { value: "9876543210" } })
    fireEvent.click(screen.getByText("Send OTP"))
    await waitFor(() => {
      expect(sendOtp).toHaveBeenCalled()
    })
  })

  it("shows OTP input when step is otp", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "otp" })
    render(<SignupForm />)
    expect(screen.getByTestId("otp-input")).toBeInTheDocument()
    expect(screen.getByText("Verify OTP")).toBeInTheDocument()
  })

  it("shows resend OTP link with cooldown", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "otp", resendCooldown: 30 })
    render(<SignupForm />)
    expect(screen.getByText(/Resend in 30s/)).toBeInTheDocument()
  })

  it("shows name input when step is name", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "name" })
    render(<SignupForm />)
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument()
    expect(screen.getByText("Complete Signup")).toBeInTheDocument()
  })

  it("renders Kitchen Name field for kitchen role", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "name" })
    render(<SignupForm role="kitchen" />)
    expect(screen.getByText("Kitchen Name")).toBeInTheDocument()
  })

  it("does not render Kitchen Name for customer role", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "name" })
    render(<SignupForm role="customer" />)
    expect(screen.queryByText("Kitchen Name")).not.toBeInTheDocument()
  })

  it("renders error message when present", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, errorMessage: "Invalid phone number" })
    render(<SignupForm />)
    expect(screen.getByText("Invalid phone number")).toBeInTheDocument()
  })

  it("shows loading state with spinner when isLoading", () => {
    mockUseSignUp.mockReturnValue({ ...defaultHookState, isLoading: true })
    render(<SignupForm />)
    expect(screen.getByText("Sending OTP...")).toBeInTheDocument()
  })

  it("calls completeSignup on form submission in name step", async () => {
    const completeSignup = vi.fn()
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "name", completeSignup })
    render(<SignupForm role="customer" />)
    const nameInput = screen.getByPlaceholderText("Enter your name")
    fireEvent.change(nameInput, { target: { value: "Test User" } })
    fireEvent.click(screen.getByText("Complete Signup"))
    await waitFor(() => {
      expect(completeSignup).toHaveBeenCalled()
    })
  })

  it("calls verifyOtp when OTP is submitted", async () => {
    const verifyOtp = vi.fn()
    mockUseSignUp.mockReturnValue({ ...defaultHookState, step: "otp", verifyOtp })
    render(<SignupForm role="customer" />)
    const otpInput = screen.getByTestId("otp-input")
    fireEvent.change(otpInput, { target: { value: "123456" } })
    fireEvent.click(screen.getByText("Verify OTP"))
    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalled()
    })
  })
})
