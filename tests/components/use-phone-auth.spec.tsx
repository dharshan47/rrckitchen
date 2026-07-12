import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCheckPhoneRegistered, mockSetRole, mockResetAuthState, mockSendOtp, mockVerifyOtp } = vi.hoisted(
  () => ({
    mockCheckPhoneRegistered: vi.fn(),
    mockSetRole: vi.fn(),
    mockResetAuthState: vi.fn(),
    mockSendOtp: vi.fn(),
    mockVerifyOtp: vi.fn(),
  })
);

vi.mock("@/actions/onboarding/auth", () => ({
  checkPhoneRegistered: mockCheckPhoneRegistered,
}));

vi.mock("@/stores", () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        role: "customer",
        setRole: mockSetRole,
        resetAuthState: mockResetAuthState,
      }),
    { getState: () => ({ role: "customer" }), setState: vi.fn(), subscribe: vi.fn() }
  ),
  UserRole: "customer",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    phoneNumber: {
      sendOtp: mockSendOtp,
      verify: mockVerifyOtp,
    },
  },
}));

import { usePhoneAuth } from "@/hooks/usePhoneAuth";

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckPhoneRegistered.mockResolvedValue(true);
  mockSendOtp.mockResolvedValue({});
  mockVerifyOtp.mockResolvedValue({});
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function TestHarness() {
  const {
    step,
    errorMessage,
    isLoading,
    resendCooldown,
    sendOtp,
    verifyOtp,
    resendOtp,
  } = usePhoneAuth("customer");

  return (
    <div>
      <div data-testid="step">{step}</div>
      <div data-testid="error">{errorMessage ?? "null"}</div>
      <div data-testid="loading">{isLoading ? "true" : "false"}</div>
      <div data-testid="cooldown">{resendCooldown}</div>
      <button data-testid="send-otp" onClick={() => sendOtp("9876543210")}>Send OTP</button>
      <button data-testid="verify-otp" onClick={() => verifyOtp("123456")}>Verify OTP</button>
      <button data-testid="resend-otp" onClick={() => resendOtp()}>Resend OTP</button>
    </div>
  );
}

function setup() {
  const queryClient = createQueryClient();
  const user = userEvent.setup();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TestHarness />
    </QueryClientProvider>
  );
  return { ...utils, user, queryClient };
}

describe("usePhoneAuth", () => {
  it("initialises with phone step", () => {
    setup();
    expect(screen.getByTestId("step")).toHaveTextContent("phone");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
    expect(screen.getByTestId("cooldown")).toHaveTextContent("0");
  });

  describe("sendOtp", () => {
    it("calls checkPhoneRegistered and authClient.sendOtp on valid phone", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));

      await waitFor(() => {
        expect(mockCheckPhoneRegistered).toHaveBeenCalledWith("+919876543210");
      });

      await waitFor(() => {
        expect(mockSendOtp).toHaveBeenCalledWith({ phoneNumber: "+919876543210" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("step")).toHaveTextContent("otp");
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("sets cooldown after OTP is sent", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));

      await waitFor(() => {
        expect(screen.getByTestId("cooldown")).toHaveTextContent("30");
      });
    });

    it("sets error when phone is not registered", async () => {
      mockCheckPhoneRegistered.mockResolvedValue(false);
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Phone number not registered");
        expect(screen.getByTestId("step")).toHaveTextContent("phone");
      });
    });

    it("sets error when sendOtp fails", async () => {
      mockSendOtp.mockRejectedValue(new Error("Failed to send OTP"));
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Failed to send OTP");
      });
    });
  });

  describe("verifyOtp", () => {
    it("calls authClient.verify on valid OTP", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));
      await waitFor(() => expect(screen.getByTestId("step")).toHaveTextContent("otp"));

      await user.click(screen.getByTestId("verify-otp"));

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith({
          phoneNumber: "+919876543210",
          code: "123456",
        });
      });
    });

    it("sets error when verifyOtp fails", async () => {
      mockVerifyOtp.mockResolvedValue({ error: { message: "Invalid OTP" } });
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));
      await waitFor(() => expect(screen.getByTestId("step")).toHaveTextContent("otp"));

      await user.click(screen.getByTestId("verify-otp"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Invalid OTP");
      });
    });
  });

  describe("resendOtp", () => {
    it("does not call sendOtp when cooldown is active", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId("send-otp"));
      await waitFor(() => expect(screen.getByTestId("step")).toHaveTextContent("otp"));
      await waitFor(() => expect(screen.getByTestId("cooldown")).toHaveTextContent("30"));

      mockSendOtp.mockClear();

      await user.click(screen.getByTestId("resend-otp"));

      await new Promise((r) => setTimeout(r, 50));
      expect(mockSendOtp).not.toHaveBeenCalled();
    });
  });
});
