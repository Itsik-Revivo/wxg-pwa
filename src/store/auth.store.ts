import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { msalInstance, loginRequest } from '../auth/msalConfig';
import { employeeApi, Employee } from '../api/client';

interface AuthState {
  employee:   Employee | null;
  isLoading:  boolean;
  error:      string | null;
  login:      () => Promise<void>;
  logout:     () => Promise<void>;
  loadMe:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      employee:  null,
      isLoading: false,
      error:     null,

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          await msalInstance.loginPopup(loginRequest);
          const { data } = await employeeApi.getMe();
          set({ employee: data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message ?? 'שגיאה בהתחברות', isLoading: false });
        }
      },

      logout: async () => {
        await msalInstance.logoutPopup();
        set({ employee: null });
      },

      loadMe: async () => {
        const accounts = msalInstance.getAllAccounts();
        if (!accounts.length) return;
        try {
          const { data } = await employeeApi.getMe();
          set({ employee: data });
        } catch { /* token expired */ }
      },
    }),
    { name: 'wxg-auth', partialize: (s) => ({ employee: s.employee }) }
  )
);
