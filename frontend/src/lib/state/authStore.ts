import { create } from 'zustand';

interface UserSession {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  setSession: (user: UserSession | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
