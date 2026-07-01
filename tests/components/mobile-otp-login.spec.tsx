import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("input-otp", () => ({
  OTPInputContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  OTPInput: (props: { [key: string]: unknown }) => (
    <input data-testid="input-otp" {...props} />
  ),
}));

import MobileOtpLogin, { type UserRole } from "@/components/auth/mobile-otp-login";

const mockSendOtp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockLogin = vi.fn();
const mockResendOtp = vi.fn();
const mockSetPhoneNumber = vi.fn();
const mockSetCode = vi.fn();

let mockStep: "phone" | "otp" | "login" = "phone";
let mockPhoneNumber = "";
let mockCode = "";
let mockErrorMessage: string | null = null;
let mockStatusMessage: string | null = null;
let mockIsLoading = false;

vi.mock("@/hooks/usePhoneAuth", () => ({
  usePhoneAuth: () => ({
    phoneNumber: mockPhoneNumber,
    code: mockCode,
    step: mockStep,
    statusMessage: mockStatusMessage,
    errorMessage: mockErrorMessage,
    isLoading: mockIsLoading,
    setPhoneNumber: mockSetPhoneNumber,
    setCode: mockSetCode,
    sendOtp: mockSendOtp,
    verifyOtp: mockVerifyOtp,
    login: mockLogin,
    resendOtp: mockResendOtp,
  }),
}));

function renderLogin(role: UserRole = "customer") {
  return render(<MobileOtpLogin role={role} />);
}

describe("MobileOtpLogin - Phone Step", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStep = "phone";
    mockPhoneNumber = "";
    mockCode = "";
    mockErrorMessage = null;
    mockStatusMessage = null;
    mockIsLoading = false;
  });

  it("renders the login heading", () => {
    renderLogin();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders mobile number input", () => {
    renderLogin();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
  });

  it("renders Continue button on phone step", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("does not render OTP input on phone step", () => {
    renderLogin();
    expect(screen.queryByLabelText(/otp code/i)).not.toBeInTheDocument();
  });

  it("does not render resend section on phone step", () => {
    renderLogin();
    expect(screen.queryByText(/didn't get a code/i)).not.toBeInTheDocument();
  });

  it("does not render login button on phone step", () => {
    renderLogin();
    expect(screen.queryByRole("button", { name: /login/i })).not.toBeInTheDocument();
  });

  it("calls sendOtp on form submit", async () => {
    mockPhoneNumber = "+919876543210";
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(mockSendOtp).toHaveBeenCalled();
  });

  it("shows error message when present", () => {
    mockErrorMessage = "Invalid phone number";
    renderLogin();
    expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
  });

  it("shows status message when present", () => {
    mockStatusMessage = "OTP sent successfully";
    renderLogin();
    expect(screen.getByText(/otp sent successfully/i)).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    mockIsLoading = true;
    renderLogin();
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("phone input is enabled on phone step", () => {
    renderLogin();
    expect(screen.getByLabelText(/mobile number/i)).not.toBeDisabled();
  });
});

describe("MobileOtpLogin - OTP Step", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStep = "otp";
    mockPhoneNumber = "+919876543210";
    mockCode = "";
    mockErrorMessage = null;
    mockStatusMessage = null;
    mockIsLoading = false;
  });

  it("renders OTP input on otp step", () => {
    renderLogin();
    expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument();
  });

  it("renders Verify OTP button on otp step", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /verify otp/i })).toBeInTheDocument();
  });

  it("disables phone input on otp step", () => {
    renderLogin();
    expect(screen.getByLabelText(/mobile number/i)).toBeDisabled();
  });

  it("shows resend section on otp step", () => {
    renderLogin();
    expect(screen.getByText(/didn't get a code/i)).toBeInTheDocument();
  });

  it("shows Resend OTP button on otp step", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /resend otp/i })).toBeInTheDocument();
  });

  it("calls verifyOtp on form submit", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /verify otp/i }));
    expect(mockVerifyOtp).toHaveBeenCalled();
  });

  it("calls resendOtp on resend button click", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /resend otp/i }));
    expect(mockResendOtp).toHaveBeenCalled();
  });

  it("does not render login button on otp step", () => {
    renderLogin();
    expect(screen.queryByRole("button", { name: /^login$/i })).not.toBeInTheDocument();
  });
});

describe("MobileOtpLogin - Login Step", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStep = "login";
    mockPhoneNumber = "+919876543210";
    mockCode = "123456";
    mockErrorMessage = null;
    mockStatusMessage = "Phone verified. Login to continue...";
    mockIsLoading = false;
  });

  it("renders Login button on login step", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
  });

  it("does not render Continue or Verify OTP buttons on login step", () => {
    renderLogin();
    expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify otp/i })).not.toBeInTheDocument();
  });

  it("calls login on Login button click", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /^login$/i }));
    expect(mockLogin).toHaveBeenCalled();
  });

  it("shows status message on login step", () => {
    renderLogin();
    expect(screen.getByText(/phone verified. login to continue/i)).toBeInTheDocument();
  });
});

describe("MobileOtpLogin - Role prop handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStep = "phone";
    mockPhoneNumber = "";
    mockCode = "";
    mockErrorMessage = null;
    mockStatusMessage = null;
    mockIsLoading = false;
  });

  it("renders for customer role", () => {
    renderLogin("customer");
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders for kitchen role", () => {
    renderLogin("kitchen");
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders for delivery-partner role", () => {
    renderLogin("delivery-partner");
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
