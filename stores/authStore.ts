import { create } from "zustand";
import { globalEventBus, AppEvents } from "@/lib/patterns/event-bus";

export type UserRole = "customer" | "delivery-partner" | "kitchen" | "admin";

interface AuthState {
  role: UserRole;
  phoneNumber: string;
  code: string;
  setRole: (role: UserRole) => void;
  setPhoneNumber: (value: string) => void;
  setCode: (value: string) => void;
  resetAuthState: () => void;
}

export const selectAuthRole = (s: AuthState) => s.role;
export const selectAuthPhone = (s: AuthState) => s.phoneNumber;
export const selectAuthCode = (s: AuthState) => s.code;

export const authStore = create<AuthState>((set) => ({
  role: "customer",
  phoneNumber: "",
  code: "",
  setRole: (role: UserRole) => {
    set({ role });
    globalEventBus.emit(AppEvents.AUTH_CHANGED, { type: "role", role });
  },
  setPhoneNumber: (value: string) => set({ phoneNumber: value }),
  setCode: (value: string) => set({ code: value }),
  resetAuthState: () => {
    set({ phoneNumber: "", code: "" });
    globalEventBus.emit(AppEvents.AUTH_CHANGED, { type: "reset" });
  },
}));

export function useAuthRole() {
  return authStore(selectAuthRole);
}
export function useAuthPhone() {
  return authStore(selectAuthPhone);
}
export function useAuthCode() {
  return authStore(selectAuthCode);
}
