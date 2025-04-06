import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // ✅ this comes from the main zustand package

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            setUser: (userData) => set({ user: userData }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'auth-storage', // localStorage key
        }
    )
);
