import { create } from "zustand";

export type UserRole = "customer" | "supplier" | "kitchen" | "admin";

interface AuthState {
  role: UserRole;
  phoneNumber: string;
  code: string;
  setRole: (role: UserRole) => void;
  setPhoneNumber: (value: string) => void;
  setCode: (value: string) => void;
  resetAuthState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: "customer",
  phoneNumber: "",
  code: "",
  setRole: (role: UserRole) => set({ role }),
  setPhoneNumber: (value: string) => set({ phoneNumber: value }),
  setCode: (value: string) => set({ code: value }),
  resetAuthState: () => set({ phoneNumber: "", code: "" }),
}));
