import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
  user: { name: string; email: string } | null;
  login: (role: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  user: null,
  login: (role, _token) => set({
    isAuthenticated: true,
    role,
    user: { name: "Người dùng thử nghiệm", email: "user@edu360.vn" }
  }),
  logout: () => set({ isAuthenticated: false, role: null, user: null }),
}));
