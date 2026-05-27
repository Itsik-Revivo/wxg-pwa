import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

export interface Employee {
  id: string; fullName: string; email: string | null;
  jobTitle: string | null; company: string; isPayrollAdmin: boolean;
}

interface AuthState {
  employee:   Employee | null;
  token:      string | null;
  isLoading:  boolean;
  error:      string | null;
  loginWithEmail: (email: string) => Promise<void>;
  logout:     () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      employee:  null,
      token:     null,
      isLoading: false,
      error:     null,

      loginWithEmail: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          // Backend מחפש עובד לפי מייל ומחזיר token פשוט
          const { data } = await api.post<{ token: string; employee: Employee }>(
            '/api/auth/email-login', { email }
          );
          // שמור token לכל הבקשות הבאות
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ employee: data.employee, token: data.token, isLoading: false });
        } catch (err: any) {
          const msg = err.response?.data?.error ?? 'מייל לא נמצא במערכת';
          set({ error: msg, isLoading: false });
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ employee: null, token: null });
      },
    }),
    {
      name: 'wxg-auth',
      partialize: (s) => ({ employee: s.employee, token: s.token }),
      onRehydrateStorage: () => (state) => {
        // שחזר token לאחר רענון דף
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
